const express = require('express');
const authenticate = require('../middleware/auth');
const { queryAll, queryOne } = require('../db/helpers');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = queryOne(db, 'SELECT user_id, name, email, phone, balance_credits, created_at FROM users WHERE user_id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const rating = queryOne(db, 'SELECT AVG(f.rating) AS avg_rating, COUNT(f.feedback_id) AS total_reviews FROM feedback f JOIN requests r ON f.request_id = r.request_id WHERE r.teacher_id = ?', [req.user.userId]);
    res.json({ ...user, avg_rating: rating?.avg_rating, total_reviews: rating?.total_reviews || 0 });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = queryOne(db, 'SELECT user_id, name, email, balance_credits, created_at FROM users WHERE user_id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const skills = queryAll(db, 'SELECT * FROM skills WHERE user_id = ?', [req.params.id]);
    const rating = queryOne(db, 'SELECT AVG(f.rating) AS avg_rating, COUNT(f.feedback_id) AS total_reviews FROM feedback f JOIN requests r ON f.request_id = r.request_id WHERE r.teacher_id = ?', [req.params.id]);
    res.json({ ...user, skills, avg_rating: rating?.avg_rating, total_reviews: rating?.total_reviews || 0 });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
