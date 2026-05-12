const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/transactions
router.get('/', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT t.*, 
        sender.name AS sender_name, 
        receiver.name AS receiver_name
      FROM transactions t
      JOIN users sender ON t.sender_id = sender.user_id
      JOIN users receiver ON t.receiver_id = receiver.user_id
      WHERE t.sender_id = ? OR t.receiver_id = ?
      ORDER BY t.transaction_date DESC
    `).all(req.user.userId, req.user.userId);
    res.json(rows);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
