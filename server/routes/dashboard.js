const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard
router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.userId;

    const user = db.prepare('SELECT name, email, balance_credits FROM users WHERE user_id = ?').get(userId);

    const activeSessions = db.prepare(`
      SELECT r.*, s.skill_name,
        CASE WHEN r.learner_id = ? THEN 'learning' ELSE 'teaching' END AS role,
        CASE WHEN r.learner_id = ? THEN teacher.name ELSE learner.name END AS partner_name
      FROM requests r
      JOIN skills s ON r.skill_id = s.skill_id
      JOIN users teacher ON r.teacher_id = teacher.user_id
      JOIN users learner ON r.learner_id = learner.user_id
      WHERE (r.learner_id = ? OR r.teacher_id = ?) AND r.status IN ('Scheduled', 'In Progress')
      ORDER BY r.request_date DESC
    `).all(userId, userId, userId, userId);

    const recentTransactions = db.prepare(`
      SELECT t.*, 
        sender.name AS sender_name, 
        receiver.name AS receiver_name
      FROM transactions t
      JOIN users sender ON t.sender_id = sender.user_id
      JOIN users receiver ON t.receiver_id = receiver.user_id
      WHERE t.sender_id = ? OR t.receiver_id = ?
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `).all(userId, userId);

    const topTeachers = db.prepare(`
      SELECT u.user_id, u.name, AVG(f.rating) AS avg_rating, COUNT(f.feedback_id) AS total_reviews
      FROM users u
      JOIN requests r ON u.user_id = r.teacher_id
      JOIN feedback f ON r.request_id = f.request_id
      GROUP BY u.user_id, u.name
      ORDER BY avg_rating DESC
      LIMIT 5
    `).all();

    res.json({ user, activeSessions, recentTransactions, topTeachers });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
