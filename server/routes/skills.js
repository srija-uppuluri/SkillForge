const express = require('express');
const authenticate = require('../middleware/auth');
const { queryAll, queryOne, run } = require('../db/helpers');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { category, search } = req.query;
    let sql = 'SELECT s.*, u.name AS teacher_name FROM skills s JOIN users u ON s.user_id = u.user_id';
    const params = [];
    const conds = [];
    if (category) { conds.push('s.category = ?'); params.push(category); }
    if (search) { conds.push('(s.skill_name LIKE ? OR s.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY s.created_at DESC';
    res.json(queryAll(db, sql, params));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error.' }); }
});

router.get('/categories', (req, res) => {
  try {
    const rows = queryAll(req.app.locals.db, 'SELECT DISTINCT category FROM skills ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.get('/my', authenticate, (req, res) => {
  try { res.json(queryAll(req.app.locals.db, 'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId])); }
  catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const { skill_name, category, description } = req.body;
    if (!skill_name || !category) return res.status(400).json({ error: 'Skill name and category are required.' });
    const result = run(db, 'INSERT INTO skills (skill_name, category, description, user_id) VALUES (?, ?, ?, ?)', [skill_name, category, description || null, req.user.userId]);
    req.app.locals.saveDb();
    res.status(201).json({ skill_id: result.lastInsertRowid, skill_name, category, description, user_id: req.user.userId });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = req.app.locals.db;
    const existing = queryOne(db, 'SELECT * FROM skills WHERE skill_id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!existing) return res.status(404).json({ error: 'Skill not found or not owned by you.' });
    const { skill_name, category, description } = req.body;
    run(db, 'UPDATE skills SET skill_name = ?, category = ?, description = ? WHERE skill_id = ?', [skill_name || existing.skill_name, category || existing.category, description ?? existing.description, req.params.id]);
    req.app.locals.saveDb();
    res.json({ message: 'Skill updated.' });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const result = run(req.app.locals.db, 'DELETE FROM skills WHERE skill_id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (result.changes === 0) return res.status(404).json({ error: 'Skill not found.' });
    req.app.locals.saveDb();
    res.json({ message: 'Skill deleted.' });
  } catch (err) { res.status(500).json({ error: 'Internal server error.' }); }
});

module.exports = router;
