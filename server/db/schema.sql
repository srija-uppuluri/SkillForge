CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  balance_credits REAL DEFAULT 5.00,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  learner_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  hours REAL NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Scheduled', 'In Progress', 'Completed', 'Rejected')),
  request_date TEXT DEFAULT (datetime('now')),
  scheduled_at TEXT,
  session_started_at TEXT,
  session_notes TEXT,
  teacher_confirmed INTEGER DEFAULT 0,
  learner_confirmed INTEGER DEFAULT 0,
  FOREIGN KEY (learner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  credits REAL NOT NULL,
  transaction_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL UNIQUE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);
