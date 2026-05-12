const express = require('express');
const db = require('../db/connection');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/skills — Browse all skills
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT s.*, u.name AS teacher_name 
      FROM skills s 
      JOIN users u ON s.user_id = u.user_id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('s.category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(s.skill_name LIKE ? OR s.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY s.created_at DESC';

    const skills = db.prepare(query).all(...params);
    res.json(skills);
  } catch (err) {
    console.error('Get skills error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/skills/categories
router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM skills ORDER BY category').all();
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/skills/my
router.get('/my', authenticate, (req, res) => {
  try {
    const skills = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
    res.json(skills);
  } catch (err) {
    console.error('Get my skills error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/skills
router.post('/', authenticate, (req, res) => {
  try {
    const { skill_name, category, description } = req.body;

    if (!skill_name || !category) {
      return res.status(400).json({ error: 'Skill name and category are required.' });
    }

    const result = db.prepare(
      'INSERT INTO skills (skill_name, category, description, user_id) VALUES (?, ?, ?, ?)'
    ).run(skill_name, category, description || null, req.user.userId);

    res.status(201).json({
      skill_id: result.lastInsertRowid,
      skill_name,
      category,
      description,
      user_id: req.user.userId
    });
  } catch (err) {
    console.error('Create skill error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/skills/:id
router.put('/:id', authenticate, (req, res) => {
  try {
    const { skill_name, category, description } = req.body;
    const skillId = req.params.id;

    const existing = db.prepare('SELECT * FROM skills WHERE skill_id = ? AND user_id = ?').get(skillId, req.user.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Skill not found or not owned by you.' });
    }

    db.prepare('UPDATE skills SET skill_name = ?, category = ?, description = ? WHERE skill_id = ?')
      .run(skill_name || existing.skill_name, category || existing.category, description ?? existing.description, skillId);

    res.json({ message: 'Skill updated successfully.' });
  } catch (err) {
    console.error('Update skill error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/skills/:id
router.delete('/:id', authenticate, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM skills WHERE skill_id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Skill not found or not owned by you.' });
    }
    res.json({ message: 'Skill deleted successfully.' });
  } catch (err) {
    console.error('Delete skill error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
