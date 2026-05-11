require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { getDb, saveDb } = require('./db/connection');
const autoSeed = require('./db/autoSeed');

const app = express();
app.use(cors());
app.use(express.json());

async function start() {
  const db = await getDb();

  // Create tables
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  db.run(schema);
  saveDb();

  // Auto-seed
  await autoSeed(db, saveDb);

  // Make db available to routes
  app.locals.db = db;
  app.locals.saveDb = saveDb;

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/skills', require('./routes/skills'));
  app.use('/api/requests', require('./routes/requests'));
  app.use('/api/transactions', require('./routes/transactions'));
  app.use('/api/feedback', require('./routes/feedback'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/users', require('./routes/users'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
