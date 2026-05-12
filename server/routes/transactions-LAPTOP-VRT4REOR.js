const express = require('express');
const authenticate = require('../middleware/auth');
const { queryAll } = require('../db/helpers');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    res.json(queryAll(req.app.locals.db, `SELECT t.*, sender.name AS sender_name, receiver.name AS receiver_name FROM transactions t JOIN users sender ON t.sender_id = sender.user_id JOIN users receiver ON t.receiver_id = receiver.user_id WHERE t.sender_id = ? OR t.receiver_id = ? ORDER BY t.transaction_date DESC`, [req.user.userId, req.user.userId]));
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
