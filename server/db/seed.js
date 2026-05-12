require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'skill_swap.db');

// Create DB if it doesn't exist
const dbExists = fs.existsSync(dbPath);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Check if users table is empty
const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

if (userCount === 0) {
  console.log('Users table is empty. Seeding default users...');

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

  const insertUsers = db.transaction(() => {
    for (const user of users) {
      insertUser.run(...user);
    }
  });
  insertUsers();
  console.log('5 default users created (password: password123).');
} else {
  console.log(`Users table already has ${userCount} records. Skipping user seed.`);
}

// Check if skills table is empty
const skillCount = db.prepare('SELECT COUNT(*) AS count FROM skills').get().count;

if (skillCount === 0) {
  console.log('Skills table is empty. Seeding default skills...');

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

  const insertSkills = db.transaction(() => {
    for (const skill of skills) {
      insertSkill.run(...skill);
    }
  });
  insertSkills();
  console.log('10 default skills created.');
} else {
  console.log(`Skills table already has ${skillCount} records. Skipping skill seed.`);
}

db.close();
console.log('Seed complete!');
