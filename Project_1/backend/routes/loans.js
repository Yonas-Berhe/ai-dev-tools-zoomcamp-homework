/**
 * Loan Routes
 * PRD Reference: Section 3.1 - Loan Calculator
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const { getDB } = require('../db/database');
const { calculateLoan, checkPredatoryWarning } = require('../utils/calculations');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

/**
 * POST /api/loans/calculate
 * Calculate loan without saving (public endpoint)
 */
router.post('/calculate', (req, res) => {
  try {
    const { amount, interestRate, interestType, termLength, termUnit, fees, currency } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Amount must be greater than 0' }
      });
    }
    
    if (interestRate === undefined || interestRate < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Interest rate must be 0 or greater' }
      });
    }
    
    if (!['flat', 'reducing', 'compound'].includes(interestType)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Interest type must be flat, reducing, or compound' }
      });
    }
    
    if (!termLength || termLength <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Term length must be greater than 0' }
      });
    }
    
    // Calculate
    const results = calculateLoan({
      amount,
      interestRate,
      interestType,
      termLength,
      termUnit: termUnit || 'months',
      fees: fees || 0,
    });
    
    const warning = checkPredatoryWarning(results.effectiveAPR);
    
    res.json({
      success: true,
      data: results,
      warning: warning.isPredatory ? warning : null,
    });
    
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CALCULATION_ERROR', message: 'Failed to calculate loan' }
    });
  }
});

/**
 * GET /api/loans
 * Get user's loan history (authenticated)
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { limit = 20, offset = 0 } = req.query;
    
    const loans = db.prepare(`
      SELECT * FROM loans 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(req.userId, parseInt(limit), parseInt(offset));
    
    const total = db.prepare('SELECT COUNT(*) as count FROM loans WHERE user_id = ?').get(req.userId);
    
    res.json({
      success: true,
      data: loans.map(formatLoanRecord),
      pagination: {
        total: total.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + loans.length < total.count,
      },
    });
    
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve loans' }
    });
  }
});

/**
 * POST /api/loans
 * Save a loan calculation (authenticated)
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { amount, interestRate, interestType, termLength, termUnit, fees, currency, localId } = req.body;
    
    // Calculate results
    const results = calculateLoan({
      amount,
      interestRate,
      interestType,
      termLength,
      termUnit: termUnit || 'months',
      fees: fees || 0,
    });
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO loans (
        id, user_id, local_id, amount, interest_rate, interest_type, 
        term_length, term_unit, fees, currency,
        monthly_payment, total_interest, total_cost, effective_apr,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.userId, localId || null, amount, interestRate, interestType,
      termLength, termUnit || 'months', fees || 0, currency || 'USD',
      results.monthlyPayment, results.totalInterest, results.totalCost, results.effectiveAPR,
      now, now
    );
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      data: formatLoanRecord(loan),
    });
    
  } catch (error) {
    console.error('Save loan error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to save loan' }
    });
  }
});

/**
 * GET /api/loans/:id
 * Get a specific loan (authenticated)
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const loan = db.prepare('SELECT * FROM loans WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found' }
      });
    }
    
    res.json({
      success: true,
      data: formatLoanRecord(loan),
    });
    
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve loan' }
    });
  }
});

/**
 * DELETE /api/loans/:id
 * Delete a loan (authenticated)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM loans WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found' }
      });
    }
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to delete loan' }
    });
  }
});

/**
 * Format database record to API response
 */
function formatLoanRecord(record) {
  return {
    id: record.id,
    userId: record.user_id,
    localId: record.local_id,
    amount: record.amount,
    interestRate: record.interest_rate,
    interestType: record.interest_type,
    termLength: record.term_length,
    termUnit: record.term_unit,
    fees: record.fees,
    currency: record.currency,
    results: {
      monthlyPayment: record.monthly_payment,
      totalInterest: record.total_interest,
      totalCost: record.total_cost,
      effectiveAPR: record.effective_apr,
    },
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

module.exports = router;
