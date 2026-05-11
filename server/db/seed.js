require('dotenv').config();
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'skill_swap.db');

async function seed() {
  const SQL = await initSqlJs();

  // Delete existing DB
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.run(schema);

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Seed users
  const users = [
    ['Alice Johnson', 'alice@example.com', '555-0101', hashedPassword, 5.00],
    ['Bob Smith', 'bob@example.com', '555-0102', hashedPassword, 5.00],
    ['Carol Williams', 'carol@example.com', '555-0103', hashedPassword, 5.00],
    ['David Brown', 'david@example.com', '555-0104', hashedPassword, 5.00],
    ['Eva Martinez', 'eva@example.com', '555-0105', hashedPassword, 5.00]
  ];
  for (const u of users) {
    db.run('INSERT INTO users (name, email, phone, password, balance_credits) VALUES (?, ?, ?, ?, ?)', u);
  }

  // Seed skills
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
  for (const s of skills) {
    db.run('INSERT INTO skills (skill_name, category, description, user_id) VALUES (?, ?, ?, ?)', s);
  }

  // Save
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log('Database seeded successfully! 5 users + 10 skills created.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
