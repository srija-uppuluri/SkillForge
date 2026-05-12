const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/requests/incoming
router.get('/incoming', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT r.*, s.skill_name, u.name AS learner_name
      FROM requests r
      JOIN skills s ON r.skill_id = s.skill_id
      JOIN users u ON r.learner_id = u.user_id
      WHERE r.teacher_id = ?
      ORDER BY r.request_date DESC
    `).all(req.user.userId);
    res.json(rows);
  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/requests/outgoing
router.get('/outgoing', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT r.*, s.skill_name, u.name AS teacher_name
      FROM requests r
      JOIN skills s ON r.skill_id = s.skill_id
      JOIN users u ON r.teacher_id = u.user_id
      WHERE r.learner_id = ?
      ORDER BY r.request_date DESC
    `).all(req.user.userId);
    res.json(rows);
  } catch (err) {
    console.error('Get outgoing requests error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/requests — Create a new request
router.post('/', authenticate, (req, res) => {
  try {
    const { skill_id, hours } = req.body;
    const learnerId = req.user.userId;

    if (!skill_id || !hours || hours <= 0) {
      return res.status(400).json({ error: 'Valid skill_id and hours are required.' });
    }

    const skill = db.prepare('SELECT * FROM skills WHERE skill_id = ?').get(skill_id);
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });

    const teacherId = skill.user_id;
    if (teacherId === learnerId) return res.status(400).json({ error: 'You cannot request your own skill.' });

    const learner = db.prepare('SELECT balance_credits FROM users WHERE user_id = ?').get(learnerId);
    if (learner.balance_credits < hours) return res.status(400).json({ error: 'Insufficient credits.' });

    const result = db.prepare(
      'INSERT INTO requests (learner_id, teacher_id, skill_id, hours, status) VALUES (?, ?, ?, ?, ?)'
    ).run(learnerId, teacherId, skill_id, hours, 'Pending');

    res.status(201).json({ request_id: result.lastInsertRowid, status: 'Pending' });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/requests/:id/accept — Teacher accepts and schedules
router.put('/:id/accept', authenticate, (req, res) => {
  try {
    const { scheduled_at } = req.body;
    const request = db.prepare('SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?').get(req.params.id, req.user.userId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Request is not in Pending status.' });

    if (!scheduled_at) return res.status(400).json({ error: 'Please select a scheduled date and time.' });

    const learner = db.prepare('SELECT balance_credits FROM users WHERE user_id = ?').get(request.learner_id);
    if (learner.balance_credits < request.hours) return res.status(400).json({ error: 'Learner has insufficient credits.' });

    db.prepare('UPDATE requests SET status = ?, scheduled_at = ? WHERE request_id = ?')
      .run('Scheduled', scheduled_at, req.params.id);

    res.json({ message: 'Request accepted and session scheduled.' });
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/requests/:id/reject
router.put('/:id/reject', authenticate, (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?').get(req.params.id, req.user.userId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Request is not in Pending status.' });

    db.prepare('UPDATE requests SET status = ? WHERE request_id = ?').run('Rejected', req.params.id);
    res.json({ message: 'Request rejected.' });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/requests/:id/start — Teacher starts the video session
router.put('/:id/start', authenticate, (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM requests WHERE request_id = ? AND teacher_id = ?').get(req.params.id, req.user.userId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'Scheduled') return res.status(400).json({ error: 'Session must be Scheduled to start.' });

    db.prepare('UPDATE requests SET status = ?, session_started_at = datetime(?) WHERE request_id = ?')
      .run('In Progress', 'now', req.params.id);

    res.json({ message: 'Session started.' });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/requests/:id/confirm — Either party confirms session completion
router.put('/:id/confirm', authenticate, (req, res) => {
  try {
    const userId = req.user.userId;
    const request = db.prepare('SELECT * FROM requests WHERE request_id = ? AND (teacher_id = ? OR learner_id = ?)').get(req.params.id, userId, userId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'In Progress') return res.status(400).json({ error: 'Session must be In Progress to confirm completion.' });

    const isTeacher = request.teacher_id === userId;

    if (isTeacher) {
      if (request.teacher_confirmed) return res.status(400).json({ error: 'You already confirmed.' });
      db.prepare('UPDATE requests SET teacher_confirmed = 1 WHERE request_id = ?').run(req.params.id);
    } else {
      if (request.learner_confirmed) return res.status(400).json({ error: 'You already confirmed.' });
      db.prepare('UPDATE requests SET learner_confirmed = 1 WHERE request_id = ?').run(req.params.id);
    }

    // Check if both confirmed now
    const updated = db.prepare('SELECT * FROM requests WHERE request_id = ?').get(req.params.id);
    const bothConfirmed = (isTeacher ? 1 : updated.teacher_confirmed) && (!isTeacher ? 1 : updated.learner_confirmed);

    if (bothConfirmed) {
      // Both confirmed — transfer credits atomically
      const { learner_id, teacher_id, hours } = updated;
      const learner = db.prepare('SELECT balance_credits FROM users WHERE user_id = ?').get(learner_id);

      if (learner.balance_credits < hours) {
        return res.status(400).json({ error: 'Learner has insufficient credits.' });
      }

      const completeSession = db.transaction(() => {
        db.prepare('UPDATE users SET balance_credits = balance_credits - ? WHERE user_id = ?').run(hours, learner_id);
        db.prepare('UPDATE users SET balance_credits = balance_credits + ? WHERE user_id = ?').run(hours, teacher_id);
        db.prepare('INSERT INTO transactions (sender_id, receiver_id, credits) VALUES (?, ?, ?)').run(learner_id, teacher_id, hours);
        db.prepare('UPDATE requests SET status = ? WHERE request_id = ?').run('Completed', req.params.id);
      });
      completeSession();

      return res.json({ message: 'Both confirmed! Session completed and credits transferred.', completed: true });
    }

    const who = isTeacher ? 'Teacher' : 'Learner';
    res.json({ message: `${who} confirmed. Waiting for the other party to confirm.`, completed: false });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
