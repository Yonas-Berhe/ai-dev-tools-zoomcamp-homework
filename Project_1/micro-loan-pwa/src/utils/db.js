/**
 * IndexedDB Database Utility
 * PRD Reference: Section 4 - Technical Architecture
 * 
 * Uses idb library for IndexedDB operations.
 * Storage: Loan calculations, savings goals, user preferences
 * 
 * Why IndexedDB over localStorage:
 * - 50MB+ capacity (vs 5MB localStorage limit)
 * - Asynchronous (non-blocking UI)
 * - Supports structured data with indexes
 * - Transaction support
 */

import { openDB } from 'idb';

const DB_NAME = 'MicroLoanDB';
const DB_VERSION = 1;

/**
 * Initialize and return the database instance
 * Creates object stores on first run or version upgrade
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Loan calculations store
      if (!db.objectStoreNames.contains('loans')) {
        const loanStore = db.createObjectStore('loans', { keyPath: 'id' });
        loanStore.createIndex('createdAt', 'createdAt');
        loanStore.createIndex('amount', 'amount');
      }

      // Savings goals store
      if (!db.objectStoreNames.contains('savings')) {
        const savingsStore = db.createObjectStore('savings', { keyPath: 'id' });
        savingsStore.createIndex('createdAt', 'createdAt');
        savingsStore.createIndex('targetDate', 'targetDate');
      }

      // User preferences store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    },
  });
}

// Singleton database instance
let dbInstance = null;

/**
 * Get database instance (creates if not exists)
 */
export async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

// ===================
// LOAN OPERATIONS
// PRD Reference: Section 3.1 - Loan Calculator
// ===================

/**
 * Save a loan calculation to the database
 * @param {Object} loan - Loan calculation object
 */
export async function saveLoan(loan) {
  const db = await getDB();
  return db.put('loans', {
    ...loan,
    id: loan.id || crypto.randomUUID(),
    createdAt: loan.createdAt || Date.now(),
  });
}

/**
 * Get all saved loan calculations
 * @returns {Promise<Array>} Array of loan calculations
 */
export async function getAllLoans() {
  const db = await getDB();
  return db.getAllFromIndex('loans', 'createdAt');
}

/**
 * Get a specific loan by ID
 * @param {string} id - Loan ID
 */
export async function getLoan(id) {
  const db = await getDB();
  return db.get('loans', id);
}

/**
 * Delete a loan calculation
 * @param {string} id - Loan ID to delete
 */
export async function deleteLoan(id) {
  const db = await getDB();
  return db.delete('loans', id);
}

// ===================
// SAVINGS OPERATIONS
// PRD Reference: Section 3.2 - Savings Tracker
// ===================

/**
 * Save a savings goal
 * @param {Object} goal - Savings goal object
 */
export async function saveSavingsGoal(goal) {
  const db = await getDB();
  return db.put('savings', {
    ...goal,
    id: goal.id || crypto.randomUUID(),
    createdAt: goal.createdAt || Date.now(),
  });
}

/**
 * Get all savings goals
 * @returns {Promise<Array>} Array of savings goals
 */
export async function getAllSavingsGoals() {
  const db = await getDB();
  return db.getAllFromIndex('savings', 'createdAt');
}

/**
 * Get a specific savings goal by ID
 * @param {string} id - Goal ID
 */
export async function getSavingsGoal(id) {
  const db = await getDB();
  return db.get('savings', id);
}

/**
 * Delete a savings goal
 * @param {string} id - Goal ID to delete
 */
export async function deleteSavingsGoal(id) {
  const db = await getDB();
  return db.delete('savings', id);
}

// ===================
// PREFERENCES OPERATIONS
// ===================

/**
 * Save a user preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 */
export async function setPreference(key, value) {
  const db = await getDB();
  return db.put('preferences', { key, value });
}

/**
 * Get a user preference
 * @param {string} key - Preference key
 * @returns {Promise<any>} Preference value
 */
export async function getPreference(key) {
  const db = await getDB();
  const result = await db.get('preferences', key);
  return result?.value;
}

/**
 * Clear all data (for testing or user request)
 */
export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(['loans', 'savings', 'preferences'], 'readwrite');
  await Promise.all([
    tx.objectStore('loans').clear(),
    tx.objectStore('savings').clear(),
    tx.objectStore('preferences').clear(),
    tx.done,
  ]);
}
