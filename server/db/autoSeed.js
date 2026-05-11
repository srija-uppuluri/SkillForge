const bcrypt = require('bcryptjs');

async function autoSeed(db, saveDb) {
  const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0]?.values[0][0] || 0;

  if (userCount === 0) {
    console.log('[AutoSeed] Seeding users...');
    const hashedPassword = bcrypt.hashSync('password123', 10);
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
  }

  const skillCount = db.exec('SELECT COUNT(*) as count FROM skills')[0]?.values[0][0] || 0;

  if (skillCount === 0) {
    console.log('[AutoSeed] Seeding skills...');
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
  }

  if (userCount === 0 || skillCount === 0) {
    saveDb();
    console.log('[AutoSeed] Done.');
  }
}

module.exports = autoSeed;
