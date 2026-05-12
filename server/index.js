require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./db/connection');
const autoSeed = require('./db/autoSeed');

const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');
const transactionRoutes = require('./routes/transactions');
const feedbackRoutes = require('./routes/feedback');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure tables exist
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Auto-seed on first launch if tables are empty
autoSeed();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dev endpoint: reseed database (clears all data and re-inserts defaults)
app.post('/api/dev/reseed', (req, res) => {
  try {
    const bcrypt = require('bcryptjs');

    const reseed = db.transaction(() => {
      // Clear all tables
      db.exec('DELETE FROM feedback');
      db.exec('DELETE FROM transactions');
      db.exec('DELETE FROM requests');
      db.exec('DELETE FROM skills');
      db.exec('DELETE FROM users');

      // Reset autoincrement
      db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','skills','requests','transactions','feedback')");

      // Re-insert users
      const hashedPassword = bcrypt.hashSync('password123', 10);
      const insertUser = db.prepare(
        'INSERT INTO users (name, email, phone, password, balance_credits) VALUES (?, ?, ?, ?, ?)'
      );
      const users = [
        ['Alice Johnson', 'alice@example.com', '555-0101', hashedPassword, 5.00],
        ['Bob Smith', 'bob@example.com', '555-0102', hashedPassword, 5.00],
        ['Carol Williams', 'carol@example.com', '555-0103', hashedPassword, 5.00],
        ['David Brown', 'david@example.com', '555-0104', hashedPassword, 5.00],
        ['Eva Martinez', 'eva@example.com', '555-0105', hashedPassword, 5.00]
      ];
      for (const user of users) {
        insertUser.run(...user);
      }

      // Re-insert skills
      const insertSkill = db.prepare(
        'INSERT INTO skills (skill_name, category, description, user_id) VALUES (?, ?, ?, ?)'
      );
      const skills = [
        ['Mathematics', 'Education', 'Algebra, Calculus, and Statistics tutoring', 1],
        ['Guitar', 'Music', 'Beginner to intermediate acoustic and electric guitar', 1],
        ['Python Programming', 'Technology', 'Python basics, scripting, and data analysis', 2],
        ['Graphic Design', 'Creative Arts', 'Logo design, Canva, and Adobe Illustrator basics', 2],
        ['English Speaking', 'Language', 'Conversational English and pronunciation practice', 3],
        ['Yoga', 'Health & Fitness', 'Morning yoga and breathing techniques for beginners', 3],
        ['Cooking', 'Lifestyle', 'Indian, Italian, and quick weekday meal prep', 4],
        ['Web Development', 'Technology', 'HTML, CSS, JavaScript and React fundamentals', 4],
        ['Photography', 'Creative Arts', 'Mobile and DSLR photography, composition, and editing', 5],
        ['French Language', 'Language', 'Beginner French for travel and everyday conversation', 5]
      ];
      for (const skill of skills) {
        insertSkill.run(...skill);
      }
    });

    reseed();
    res.json({ message: 'Database reseeded successfully. 5 users and 10 skills created.' });
  } catch (err) {
    console.error('Reseed error:', err);
    res.status(500).json({ error: 'Reseed failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
