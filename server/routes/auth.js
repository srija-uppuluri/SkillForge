const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, run } = require('../db/helpers');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

    const existing = queryOne(db, 'SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const hashed = bcrypt.hashSync(password, 10);
    const result = run(db, 'INSERT INTO users (name, email, phone, password, balance_credits) VALUES (?, ?, ?, ?, ?)', [name, email, phone || null, hashed, 5.00]);
    req.app.locals.saveDb();

    const token = jwt.sign({ userId: result.lastInsertRowid, email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
    res.status(201).json({ message: 'Registration successful.', token, user: { userId: result.lastInsertRowid, name, email, balance_credits: 5.00 } });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.post('/login', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = queryOne(db, 'SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
    res.json({ message: 'Login successful.', token, user: { userId: user.user_id, name: user.name, email: user.email, balance_credits: user.balance_credits } });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
