const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /api/feedback
router.post('/', authenticate, (req, res) => {
  try {
    const { request_id, rating, comments } = req.body;

    if (!request_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid request_id and rating (1-5) are required.' });
    }

    const request = db.prepare(
      'SELECT * FROM requests WHERE request_id = ? AND learner_id = ? AND status = ?'
    ).get(request_id, req.user.userId, 'Completed');

    if (!request) {
      return res.status(404).json({ error: 'Completed request not found or not yours.' });
    }

    const existing = db.prepare('SELECT * FROM feedback WHERE request_id = ?').get(request_id);
    if (existing) {
      return res.status(409).json({ error: 'Feedback already submitted for this request.' });
    }

    const result = db.prepare(
      'INSERT INTO feedback (request_id, rating, comments) VALUES (?, ?, ?)'
    ).run(request_id, rating, comments || null);

    res.status(201).json({
      feedback_id: result.lastInsertRowid,
      request_id,
      rating,
      comments
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/feedback/teacher/:id
router.get('/teacher/:id', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT f.*, r.skill_id, s.skill_name, u.name AS learner_name
      FROM feedback f
      JOIN requests r ON f.request_id = r.request_id
      JOIN skills s ON r.skill_id = s.skill_id
      JOIN users u ON r.learner_id = u.user_id
      WHERE r.teacher_id = ?
      ORDER BY f.created_at DESC
    `).all(req.params.id);
    res.json(rows);
  } catch (err) {
    console.error('Get teacher feedback error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
