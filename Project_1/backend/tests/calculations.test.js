/**
 * Backend Unit Tests
 * Tests calculation utilities, database operations, and middleware
 */

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');

// Test calculation utilities - only test what's exported
const {
  roundToCents,
  calculateLoan,
  checkPredatoryWarning,
} = require('../utils/calculations');

describe('Calculation Utilities', () => {
  describe('roundToCents', () => {
    it('rounds to 2 decimal places up', () => {
      assert.strictEqual(roundToCents(10.555), 10.56);
    });

    it('rounds to 2 decimal places down', () => {
      assert.strictEqual(roundToCents(10.554), 10.55);
    });

    it('handles whole numbers', () => {
      assert.strictEqual(roundToCents(100), 100);
    });
  });

  describe('calculateLoan', () => {
    it('calculates flat rate loan correctly', () => {
      const result = calculateLoan({
        interestType: 'flat',
        amount: 1000,
        interestRate: 10,
        termLength: 12,
        termUnit: 'months',
        fees: 0,
      });

      assert.strictEqual(result.interestType, 'flat');
      assert.strictEqual(result.totalInterest, 100);
      assert.strictEqual(result.totalCost, 1100);
    });

    it('calculates reducing balance loan correctly', () => {
      const result = calculateLoan({
        interestType: 'reducing',
        amount: 1000,
        interestRate: 12,
        termLength: 12,
        termUnit: 'months',
        fees: 0,
      });

      assert.strictEqual(result.interestType, 'reducing');
      assert.ok(Math.abs(result.monthlyPayment - 88.85) < 1);
    });

    it('calculates compound interest loan correctly', () => {
      const result = calculateLoan({
        interestType: 'compound',
        amount: 1000,
        interestRate: 10,
        termLength: 12,
        termUnit: 'months',
        fees: 0,
      });

      assert.strictEqual(result.interestType, 'compound');
      assert.ok(Math.abs(result.finalAmount - 1104.71) < 1);
    });

    it('handles fees in calculation', () => {
      const result = calculateLoan({
        interestType: 'flat',
        amount: 1000,
        interestRate: 10,
        termLength: 12,
        termUnit: 'months',
        fees: 50,
      });

      assert.strictEqual(result.totalCost, 1150);
    });

    it('handles year term unit conversion', () => {
      const result = calculateLoan({
        interestType: 'flat',
        amount: 1000,
        interestRate: 10,
        termLength: 2,
        termUnit: 'years',
        fees: 0,
      });

      assert.strictEqual(result.totalInterest, 200);
    });
  });

  describe('checkPredatoryWarning', () => {
    it('returns predatory warning for APR > 50%', () => {
      const warning = checkPredatoryWarning(55);
      assert.ok(warning);
      assert.strictEqual(warning.isPredatory, true);
      assert.strictEqual(warning.severity, 'warning');
      assert.ok(warning.message.includes('high effective APR'));
    });

    it('returns critical severity for APR > 100%', () => {
      const warning = checkPredatoryWarning(120);
      assert.strictEqual(warning.isPredatory, true);
      assert.strictEqual(warning.severity, 'critical');
    });

    it('returns non-predatory for APR <= 50%', () => {
      const warning = checkPredatoryWarning(50);
      assert.strictEqual(warning.isPredatory, false);
      assert.strictEqual(warning.severity, 'none');
      assert.strictEqual(warning.message, null);
    });
  });
});
