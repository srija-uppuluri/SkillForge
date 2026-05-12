const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me
router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT user_id, name, email, phone, balance_credits, created_at FROM users WHERE user_id = ?'
    ).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const rating = db.prepare(`
      SELECT AVG(f.rating) AS avg_rating, COUNT(f.feedback_id) AS total_reviews
      FROM feedback f
      JOIN requests r ON f.request_id = r.request_id
      WHERE r.teacher_id = ?
    `).get(req.user.userId);

    res.json({ ...user, avg_rating: rating.avg_rating, total_reviews: rating.total_reviews });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare(
      'SELECT user_id, name, email, balance_credits, created_at FROM users WHERE user_id = ?'
    ).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const skills = db.prepare('SELECT * FROM skills WHERE user_id = ?').all(req.params.id);

    const rating = db.prepare(`
      SELECT AVG(f.rating) AS avg_rating, COUNT(f.feedback_id) AS total_reviews
      FROM feedback f
      JOIN requests r ON f.request_id = r.request_id
      WHERE r.teacher_id = ?
    `).get(req.params.id);

    res.json({ ...user, skills, avg_rating: rating.avg_rating, total_reviews: rating.total_reviews });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
