/**
 * Sync Routes
 * PRD Reference: Section 3.4 - Background sync
 * 
 * Bulk sync endpoint for offline-first functionality.
 * Accepts locally created/updated records and returns server state.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const { getDB } = require('../db/database');
const { calculateLoan } = require('../utils/calculations');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/sync
 * Sync offline data
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { lastSyncAt, loans = [], savingsGoals = [], transactions = [] } = req.body;
    
    const idMappings = {};
    const now = new Date().toISOString();
    
    // Process loans
    for (const loan of loans) {
      const results = calculateLoan({
        amount: loan.amount,
        interestRate: loan.interestRate,
        interestType: loan.interestType,
        termLength: loan.termLength,
        termUnit: loan.termUnit || 'months',
        fees: loan.fees || 0,
      });
      
      const id = uuidv4();
      
      db.prepare(`
        INSERT INTO loans (
          id, user_id, local_id, amount, interest_rate, interest_type, 
          term_length, term_unit, fees, currency,
          monthly_payment, total_interest, total_cost, effective_apr,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, req.userId, loan.localId || null, loan.amount, loan.interestRate, loan.interestType,
        loan.termLength, loan.termUnit || 'months', loan.fees || 0, loan.currency || 'USD',
        results.monthlyPayment, results.totalInterest, results.totalCost, results.effectiveAPR,
        now, now
      );
      
      if (loan.localId) {
        idMappings[loan.localId] = id;
      }
    }
    
    // Process savings goals
    for (const goal of savingsGoals) {
      const id = uuidv4();
      
      db.prepare(`
        INSERT INTO savings_goals (
          id, user_id, local_id, name, target_amount, current_amount, 
          currency, target_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
      `).run(
        id, req.userId, goal.localId || null, goal.name, goal.targetAmount,
        goal.currency || 'USD', goal.targetDate || null, now, now
      );
      
      if (goal.localId) {
        idMappings[goal.localId] = id;
      }
    }
    
    // Process transactions
    for (const tx of transactions) {
      // Find the goal (either by server ID or mapped from local ID)
      const goalId = idMappings[tx.goalLocalId] || tx.goalId;
      
      if (!goalId) continue;
      
      const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, req.userId);
      if (!goal) continue;
      
      const id = uuidv4();
      const type = tx.amount >= 0 ? 'deposit' : 'withdrawal';
      
      db.prepare(`
        INSERT INTO transactions (id, goal_id, local_id, amount, type, note, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, goalId, tx.localId || null, tx.amount, type, tx.note || null, tx.date || now, now);
      
      // Update goal's current amount
      const newAmount = goal.current_amount + tx.amount;
      const completedAt = newAmount >= goal.target_amount && !goal.completed_at ? now : goal.completed_at;
      
      db.prepare(`
        UPDATE savings_goals SET current_amount = ?, completed_at = ?, updated_at = ? WHERE id = ?
      `).run(newAmount, completedAt, now, goalId);
      
      if (tx.localId) {
        idMappings[tx.localId] = id;
      }
    }
    
    // Return current server state
    const allLoans = db.prepare(`
      SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.userId);
    
    const allGoals = db.prepare(`
      SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.userId);
    
    const goalsWithTransactions = allGoals.map(goal => {
      const txs = db.prepare(`
        SELECT * FROM transactions WHERE goal_id = ? ORDER BY date DESC
      `).all(goal.id);
      
      return {
        id: goal.id,
        localId: goal.local_id,
        name: goal.name,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        currency: goal.currency,
        targetDate: goal.target_date,
        createdAt: goal.created_at,
        completedAt: goal.completed_at,
        transactions: txs.map(t => ({
          id: t.id,
          localId: t.local_id,
          amount: t.amount,
          type: t.type,
          note: t.note,
          date: t.date,
        })),
      };
    });
    
    res.json({
      success: true,
      data: {
        loans: allLoans.map(loan => ({
          id: loan.id,
          localId: loan.local_id,
          amount: loan.amount,
          interestRate: loan.interest_rate,
          interestType: loan.interest_type,
          termLength: loan.term_length,
          termUnit: loan.term_unit,
          fees: loan.fees,
          currency: loan.currency,
          results: {
            monthlyPayment: loan.monthly_payment,
            totalInterest: loan.total_interest,
            totalCost: loan.total_cost,
            effectiveAPR: loan.effective_apr,
          },
          createdAt: loan.created_at,
        })),
        savingsGoals: goalsWithTransactions,
        syncedAt: now,
        idMappings,
      },
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SYNC_ERROR', message: 'Failed to sync data' }
    });
  }
});

module.exports = router;
