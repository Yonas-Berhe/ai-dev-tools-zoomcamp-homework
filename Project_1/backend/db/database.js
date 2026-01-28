/**
 * Database initialization and connection
 * Uses better-sqlite3 for synchronous, lightweight SQLite
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/microloan.db';

let db = null;

function getDB() {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initDB() {
  const db = getDB();
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Loans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      local_id TEXT,
      amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      interest_type TEXT NOT NULL CHECK(interest_type IN ('flat', 'reducing', 'compound')),
      term_length INTEGER NOT NULL,
      term_unit TEXT NOT NULL CHECK(term_unit IN ('weeks', 'months', 'years')),
      fees REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      monthly_payment REAL,
      total_interest REAL,
      total_cost REAL,
      effective_apr REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Savings goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      local_id TEXT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      target_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      local_id TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
      note TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
    )
  `);
  
  // Lenders table (Phase 3)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lenders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      average_apr REAL,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      website TEXT,
      phone TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      lender_id TEXT NOT NULL,
      user_id TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
    CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings_goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON transactions(goal_id);
    CREATE INDEX IF NOT EXISTS idx_lenders_country ON lenders(country);
    CREATE INDEX IF NOT EXISTS idx_reviews_lender_id ON reviews(lender_id);
  `);
  
  // Insert sample lenders if table is empty (for demo)
  const lenderCount = db.prepare('SELECT COUNT(*) as count FROM lenders').get();
  if (lenderCount.count === 0) {
    seedLenders(db);
  }
  
  return db;
}

function seedLenders(db) {
  const { v4: uuidv4 } = require('uuid');
  
  const sampleLenders = [
    {
      id: uuidv4(),
      name: 'Community Microfinance Kenya',
      country: 'KE',
      average_apr: 24.5,
      rating: 4.2,
      review_count: 156,
      website: 'https://example.com/cmk',
      phone: '+254-xxx-xxx',
      description: 'Trusted microfinance institution serving rural communities since 2010.'
    },
    {
      id: uuidv4(),
      name: 'Lagos Quick Loans',
      country: 'NG',
      average_apr: 32.0,
      rating: 3.8,
      review_count: 89,
      website: 'https://example.com/lql',
      phone: '+234-xxx-xxx',
      description: 'Fast approval mobile-first lending platform.'
    },
    {
      id: uuidv4(),
      name: 'Rural Finance India',
      country: 'IN',
      average_apr: 18.5,
      rating: 4.5,
      review_count: 342,
      website: 'https://example.com/rfi',
      phone: '+91-xxx-xxx',
      description: 'Government-backed microfinance for agricultural communities.'
    },
  ];
  
  const insert = db.prepare(`
    INSERT INTO lenders (id, name, country, average_apr, rating, review_count, website, phone, description)
    VALUES (@id, @name, @country, @average_apr, @rating, @review_count, @website, @phone, @description)
  `);
  
  for (const lender of sampleLenders) {
    insert.run(lender);
  }
  
  console.log('Seeded sample lenders');
}

module.exports = { getDB, initDB };
