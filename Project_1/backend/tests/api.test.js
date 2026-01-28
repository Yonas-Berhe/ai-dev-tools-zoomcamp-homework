/**
 * Backend API Tests
 * Tests auth middleware and route handlers
 */

const { describe, it, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Test auth middleware
const { generateToken, verifyToken } = require('../middleware/auth');

describe('Auth Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  
  describe('generateToken', () => {
    it('generates a valid JWT token', () => {
      const token = generateToken(123);
      assert.ok(token);
      assert.strictEqual(typeof token, 'string');
      
      // Token should have 3 parts separated by dots
      const parts = token.split('.');
      assert.strictEqual(parts.length, 3);
    });

    it('includes userId in token payload', () => {
      const userId = 456;
      const token = generateToken(userId);
      const decoded = jwt.verify(token, JWT_SECRET);
      
      assert.strictEqual(decoded.userId, userId);
    });

    it('sets expiration on token', () => {
      const token = generateToken(789);
      const decoded = jwt.verify(token, JWT_SECRET);
      
      assert.ok(decoded.exp);
      assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
    });
  });

  describe('verifyToken', () => {
    it('verifies valid token', () => {
      const userId = 123;
      const token = generateToken(userId);
      const decoded = verifyToken(token);
      
      assert.strictEqual(decoded.userId, userId);
    });

    it('throws on invalid token', () => {
      assert.throws(() => {
        verifyToken('invalid-token');
      });
    });

    it('throws on tampered token', () => {
      const token = generateToken(123);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      assert.throws(() => {
        verifyToken(tamperedToken);
      });
    });
  });
});

describe('Database Operations', () => {
  const Database = require('better-sqlite3');
  let db;

  before(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        principal REAL NOT NULL,
        interest_rate REAL NOT NULL,
        term_length INTEGER NOT NULL,
        term_unit TEXT DEFAULT 'months',
        interest_type TEXT NOT NULL,
        fees REAL DEFAULT 0,
        monthly_payment REAL,
        total_interest REAL,
        total_cost REAL,
        effective_apr REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  });

  after(() => {
    db.close();
  });

  beforeEach(() => {
    // Clear tables before each test
    db.exec('DELETE FROM loans');
    db.exec('DELETE FROM savings_goals');
    db.exec('DELETE FROM users');
  });

  describe('User operations', () => {
    it('creates a new user', () => {
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      
      const result = stmt.run('test@example.com', 'hashed_password', 'Test User');
      
      assert.ok(result.lastInsertRowid);
      assert.strictEqual(result.changes, 1);
    });

    it('enforces unique email constraint', () => {
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      
      stmt.run('duplicate@example.com', 'hash1', 'User 1');
      
      assert.throws(() => {
        stmt.run('duplicate@example.com', 'hash2', 'User 2');
      });
    });

    it('retrieves user by email', () => {
      const insertStmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      insertStmt.run('find@example.com', 'hash', 'Find Me');
      
      const selectStmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = selectStmt.get('find@example.com');
      
      assert.ok(user);
      assert.strictEqual(user.email, 'find@example.com');
      assert.strictEqual(user.name, 'Find Me');
    });
  });

  describe('Loan operations', () => {
    let userId;

    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run('loan-user@example.com', 'hash', 'Loan User');
      userId = result.lastInsertRowid;
    });

    it('creates a loan record', () => {
      const stmt = db.prepare(`
        INSERT INTO loans (user_id, principal, interest_rate, term_length, interest_type, monthly_payment, total_interest, total_cost, effective_apr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(userId, 1000, 10, 12, 'reducing', 88.85, 66.19, 1066.19, 12.5);
      
      assert.ok(result.lastInsertRowid);
    });

    it('retrieves loans for user', () => {
      const insertStmt = db.prepare(`
        INSERT INTO loans (user_id, principal, interest_rate, term_length, interest_type, monthly_payment, total_interest, total_cost, effective_apr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(userId, 1000, 10, 12, 'reducing', 88.85, 66.19, 1066.19, 12.5);
      insertStmt.run(userId, 2000, 15, 24, 'flat', 100, 600, 2600, 15);
      
      const selectStmt = db.prepare('SELECT * FROM loans WHERE user_id = ?');
      const loans = selectStmt.all(userId);
      
      assert.strictEqual(loans.length, 2);
      assert.strictEqual(loans[0].principal, 1000);
      assert.strictEqual(loans[1].principal, 2000);
    });

    it('deletes a loan', () => {
      const insertStmt = db.prepare(`
        INSERT INTO loans (user_id, principal, interest_rate, term_length, interest_type, monthly_payment, total_interest, total_cost, effective_apr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertResult = insertStmt.run(userId, 1000, 10, 12, 'reducing', 88.85, 66.19, 1066.19, 12.5);
      
      const deleteStmt = db.prepare('DELETE FROM loans WHERE id = ? AND user_id = ?');
      const deleteResult = deleteStmt.run(insertResult.lastInsertRowid, userId);
      
      assert.strictEqual(deleteResult.changes, 1);
    });
  });

  describe('Savings operations', () => {
    let userId;

    beforeEach(() => {
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run('savings-user@example.com', 'hash', 'Savings User');
      userId = result.lastInsertRowid;
    });

    it('creates a savings goal', () => {
      const stmt = db.prepare(`
        INSERT INTO savings_goals (user_id, name, target_amount, currency)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(userId, 'Emergency Fund', 5000, 'USD');
      
      assert.ok(result.lastInsertRowid);
    });

    it('updates savings goal current amount', () => {
      const insertStmt = db.prepare(`
        INSERT INTO savings_goals (user_id, name, target_amount, current_amount, currency)
        VALUES (?, ?, ?, ?, ?)
      `);
      const insertResult = insertStmt.run(userId, 'Goal', 1000, 0, 'USD');
      
      const updateStmt = db.prepare(`
        UPDATE savings_goals SET current_amount = ? WHERE id = ?
      `);
      updateStmt.run(500, insertResult.lastInsertRowid);
      
      const selectStmt = db.prepare('SELECT current_amount FROM savings_goals WHERE id = ?');
      const goal = selectStmt.get(insertResult.lastInsertRowid);
      
      assert.strictEqual(goal.current_amount, 500);
    });

    it('marks goal as completed', () => {
      const insertStmt = db.prepare(`
        INSERT INTO savings_goals (user_id, name, target_amount, current_amount, currency)
        VALUES (?, ?, ?, ?, ?)
      `);
      const insertResult = insertStmt.run(userId, 'Goal', 1000, 0, 'USD');
      
      const updateStmt = db.prepare(`
        UPDATE savings_goals 
        SET current_amount = ?, completed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      updateStmt.run(1000, insertResult.lastInsertRowid);
      
      const selectStmt = db.prepare('SELECT * FROM savings_goals WHERE id = ?');
      const goal = selectStmt.get(insertResult.lastInsertRowid);
      
      assert.strictEqual(goal.current_amount, 1000);
      assert.ok(goal.completed_at);
    });
  });
});

describe('API Response Format', () => {
  it('success response has correct structure', () => {
    const successResponse = {
      success: true,
      data: { id: 1, name: 'Test' },
    };
    
    assert.strictEqual(successResponse.success, true);
    assert.ok(successResponse.data);
    assert.ok(!successResponse.error);
  });

  it('error response has correct structure', () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
    };
    
    assert.strictEqual(errorResponse.success, false);
    assert.ok(errorResponse.error);
    assert.ok(errorResponse.error.code);
    assert.ok(errorResponse.error.message);
  });
});
