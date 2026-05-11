const express = require('express');
const authenticate = require('../middleware/auth');
const { queryAll, queryOne, run } = require('../db/helpers');

const router = express.Router();

router.get('/incoming', authenticate, (req, res) => {
  try {
    res.json(queryAll(req.app.locals.db, `SELECT r.*, s.skill_name, u.name AS learner_name FROM requests r JOIN skills s ON r.skill_id = s.skill_id JOIN users u ON r.learner_id = u.user_id WHERE r.teacher_id = ? ORDER BY r.request_date DESC`, [req.user.userId]));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.get('/outgoing', authenticate, (req, res) => {
  try {
    res.json(queryAll(req.app.locals.db, `SELECT r.*, s.skill_name, u.name AS teacher_name FROM requests r JOIN skills s ON r.skill_id = s.skill_id JOIN users u ON r.teacher_id = u.user_id WHERE r.learner_id = ? ORDER BY r.request_date DESC`, [req.user.userId]));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { skill_id, hours } = req.body;
    if (!skill_id || !hours || hours <= 0) return res.status(400).json({ error: 'Valid skill_id and hours required.' });
    const skill = queryOne(db, 'SELECT * FROM skills WHERE skill_id = ?', [skill_id]);
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });
    if (skill.user_id === req.user.userId) return res.status(400).json({ error: 'Cannot request your own skill.' });
    const learner = queryOne(db, 'SELECT balance_credits FROM users WHERE user_id = ?', [req.user.userId]);
    if (learner.balance_credits < hours) return res.status(400).json({ error: 'Insufficient credits.' });
    const result = run(db, 'INSERT INTO requests (learner_id, teacher_id, skill_id, hours, status) VALUES (?, ?, ?, ?, ?)', [req.user.userId, skill.user_id, skill_id, hours, 'Pending']);
    req.app.locals.saveDb();
    res.status(201).json({ request_id: result.lastInsertRowid, status: 'Pending' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.put('/:id/accept', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { scheduled_at } = req.body;
    const request = queryOne(db, 'SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?', [req.params.id, req.user.userId]);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Not in Pending status.' });
    if (!scheduled_at) return res.status(400).json({ error: 'Please select a scheduled date and time.' });
    run(db, 'UPDATE requests SET status = ?, scheduled_at = ? WHERE request_id = ?', ['Scheduled', scheduled_at, req.params.id]);
    req.app.locals.saveDb();
    res.json({ message: 'Request accepted and session scheduled.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.put('/:id/reject', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const request = queryOne(db, 'SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?', [req.params.id, req.user.userId]);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Not in Pending status.' });
    run(db, 'UPDATE requests SET status = ? WHERE request_id = ?', ['Rejected', req.params.id]);
    req.app.locals.saveDb();
    res.json({ message: 'Request rejected.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.put('/:id/start', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const request = queryOne(db, 'SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?', [req.params.id, req.user.userId]);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Scheduled') return res.status(400).json({ error: 'Must be Scheduled to start.' });
    run(db, "UPDATE requests SET status = 'In Progress', session_started_at = datetime('now') WHERE request_id = ?", [req.params.id]);
    req.app.locals.saveDb();
    res.json({ message: 'Session started.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.put('/:id/confirm', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;
    const request = queryOne(db, 'SELECT * FROM requests WHERE request_id = ? AND (teacher_id = ? OR learner_id = ?)', [req.params.id, userId, userId]);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'In Progress') return res.status(400).json({ error: 'Session must be In Progress.' });

    const isTeacher = request.teacher_id === userId;
    if (isTeacher) {
      if (request.teacher_confirmed) return res.status(400).json({ error: 'You already confirmed.' });
      run(db, 'UPDATE requests SET teacher_confirmed = 1 WHERE request_id = ?', [req.params.id]);
    } else {
      if (request.learner_confirmed) return res.status(400).json({ error: 'You already confirmed.' });
      run(db, 'UPDATE requests SET learner_confirmed = 1 WHERE request_id = ?', [req.params.id]);
    }

    const updated = queryOne(db, 'SELECT * FROM requests WHERE request_id = ?', [req.params.id]);
    if (updated.teacher_confirmed && updated.learner_confirmed) {
      const { learner_id, teacher_id, hours } = updated;
      const learner = queryOne(db, 'SELECT balance_credits FROM users WHERE user_id = ?', [learner_id]);
      if (learner.balance_credits < hours) return res.status(400).json({ error: 'Learner has insufficient credits.' });

      run(db, 'UPDATE users SET balance_credits = balance_credits - ? WHERE user_id = ?', [hours, learner_id]);
      run(db, 'UPDATE users SET balance_credits = balance_credits + ? WHERE user_id = ?', [hours, teacher_id]);
      run(db, 'INSERT INTO transactions (sender_id, receiver_id, credits) VALUES (?, ?, ?)', [learner_id, teacher_id, hours]);
      run(db, "UPDATE requests SET status = 'Completed' WHERE request_id = ?", [req.params.id]);
      req.app.locals.saveDb();
      return res.json({ message: 'Both confirmed! Credits transferred.', completed: true });
    }

    req.app.locals.saveDb();
    res.json({ message: `${isTeacher ? 'Teacher' : 'Learner'} confirmed. Waiting for the other party.`, completed: false });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
