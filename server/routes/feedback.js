const express = require('express');
const authenticate = require('../middleware/auth');
const { queryAll, queryOne, run } = require('../db/helpers');

const router = express.Router();

router.post('/', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { request_id, rating, comments } = req.body;
    if (!request_id || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Valid request_id and rating (1-5) required.' });
    const request = queryOne(db, "SELECT * FROM requests WHERE request_id = ? AND learner_id = ? AND status = 'Completed'", [request_id, req.user.userId]);
    if (!request) return res.status(404).json({ error: 'Completed request not found or not yours.' });
    const existing = queryOne(db, 'SELECT * FROM feedback WHERE request_id = ?', [request_id]);
    if (existing) return res.status(409).json({ error: 'Feedback already submitted.' });
    const result = run(db, 'INSERT INTO feedback (request_id, rating, comments) VALUES (?, ?, ?)', [request_id, rating, comments || null]);
    req.app.locals.saveDb();
    res.status(201).json({ feedback_id: result.lastInsertRowid, request_id, rating, comments });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.get('/teacher/:id', (req, res) => {
  try {
    res.json(queryAll(req.app.locals.db, `SELECT f.*, r.skill_id, s.skill_name, u.name AS learner_name FROM feedback f JOIN requests r ON f.request_id = r.request_id JOIN skills s ON r.skill_id = s.skill_id JOIN users u ON r.learner_id = u.user_id WHERE r.teacher_id = ? ORDER BY f.created_at DESC`, [req.params.id]));
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
