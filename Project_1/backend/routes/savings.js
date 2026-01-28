/**
 * Savings Routes
 * PRD Reference: Section 3.2 - Savings Tracker
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const { getDB } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/savings
 * Get all savings goals (authenticated)
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    
    const goals = db.prepare(`
      SELECT * FROM savings_goals 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.userId);
    
    // Get transactions for each goal
    const goalsWithTransactions = goals.map(goal => {
      const transactions = db.prepare(`
        SELECT * FROM transactions 
        WHERE goal_id = ? 
        ORDER BY date DESC
      `).all(goal.id);
      
      return formatSavingsGoal(goal, transactions);
    });
    
    res.json({
      success: true,
      data: goalsWithTransactions,
    });
    
  } catch (error) {
    console.error('Get savings error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve savings goals' }
    });
  }
});

/**
 * POST /api/savings
 * Create a savings goal (authenticated)
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { name, targetAmount, currency, targetDate, localId } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' }
      });
    }
    
    if (!targetAmount || targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Target amount must be greater than 0' }
      });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO savings_goals (
        id, user_id, local_id, name, target_amount, current_amount, 
        currency, target_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(
      id, req.userId, localId || null, name.trim(), targetAmount,
      currency || 'USD', targetDate || null, now, now
    );
    
    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      data: formatSavingsGoal(goal, []),
    });
    
  } catch (error) {
    console.error('Create savings error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to create savings goal' }
    });
  }
});

/**
 * GET /api/savings/:id
 * Get a specific savings goal (authenticated)
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }
    
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE goal_id = ? 
      ORDER BY date DESC
    `).all(goal.id);
    
    res.json({
      success: true,
      data: formatSavingsGoal(goal, transactions),
    });
    
  } catch (error) {
    console.error('Get savings goal error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve savings goal' }
    });
  }
});

/**
 * PUT /api/savings/:id
 * Update a savings goal (authenticated)
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { name, targetAmount, targetDate } = req.body;
    
    const existing = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }
    
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE savings_goals 
      SET name = COALESCE(?, name),
          target_amount = COALESCE(?, target_amount),
          target_date = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      name?.trim() || null,
      targetAmount || null,
      targetDate !== undefined ? targetDate : existing.target_date,
      now,
      req.params.id
    );
    
    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(req.params.id);
    const transactions = db.prepare('SELECT * FROM transactions WHERE goal_id = ? ORDER BY date DESC').all(goal.id);
    
    res.json({
      success: true,
      data: formatSavingsGoal(goal, transactions),
    });
    
  } catch (error) {
    console.error('Update savings error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to update savings goal' }
    });
  }
});

/**
 * DELETE /api/savings/:id
 * Delete a savings goal (authenticated)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM savings_goals WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Delete savings error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to delete savings goal' }
    });
  }
});

/**
 * POST /api/savings/:id/transactions
 * Add a transaction to a savings goal (authenticated)
 */
router.post('/:id/transactions', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { amount, note, date, localId } = req.body;
    
    if (amount === undefined || amount === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Amount is required and cannot be 0' }
      });
    }
    
    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Savings goal not found' }
      });
    }
    
    const id = uuidv4();
    const txDate = date || new Date().toISOString();
    const type = amount >= 0 ? 'deposit' : 'withdrawal';
    
    // Insert transaction
    db.prepare(`
      INSERT INTO transactions (id, goal_id, local_id, amount, type, note, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, localId || null, amount, type, note || null, txDate, new Date().toISOString());
    
    // Update goal's current amount
    const newAmount = goal.current_amount + amount;
    const completedAt = newAmount >= goal.target_amount && !goal.completed_at 
      ? new Date().toISOString() 
      : goal.completed_at;
    
    db.prepare(`
      UPDATE savings_goals 
      SET current_amount = ?, completed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(newAmount, completedAt, new Date().toISOString(), req.params.id);
    
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      data: formatTransaction(transaction),
    });
    
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to add transaction' }
    });
  }
});

/**
 * GET /api/savings/export
 * Export savings data as CSV (authenticated)
 */
router.get('/export/csv', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    
    const goals = db.prepare(`
      SELECT * FROM savings_goals WHERE user_id = ?
    `).all(req.userId);
    
    // CSV header
    let csv = 'Goal Name,Target Amount,Current Amount,Currency,Progress %,Status,Created At\n';
    
    for (const goal of goals) {
      const progress = goal.target_amount > 0 
        ? Math.round((goal.current_amount / goal.target_amount) * 100) 
        : 0;
      const status = goal.completed_at ? 'Completed' : 'In Progress';
      
      csv += `"${goal.name}",${goal.target_amount},${goal.current_amount},${goal.currency},${progress}%,${status},${goal.created_at}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=savings-export.csv');
    res.send(csv);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ERROR', message: 'Failed to export savings data' }
    });
  }
});

/**
 * Format database record to API response
 */
function formatSavingsGoal(record, transactions) {
  return {
    id: record.id,
    userId: record.user_id,
    localId: record.local_id,
    name: record.name,
    targetAmount: record.target_amount,
    currentAmount: record.current_amount,
    currency: record.currency,
    targetDate: record.target_date,
    transactions: transactions.map(formatTransaction),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    completedAt: record.completed_at,
  };
}

function formatTransaction(record) {
  return {
    id: record.id,
    localId: record.local_id,
    amount: record.amount,
    type: record.type,
    note: record.note,
    date: record.date,
  };
}

module.exports = router;
