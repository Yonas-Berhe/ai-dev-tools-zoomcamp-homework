/**
 * Loan Calculation Utilities Tests
 * Tests all three interest calculation methods and edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  roundToCents,
  convertToMonths,
  calculateFlatRate,
  calculateReducingBalance,
  calculateCompoundInterest,
  calculateLoan,
  checkPredatoryWarning,
} from './calculations';

describe('roundToCents', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundToCents(10.555)).toBe(10.56);
    expect(roundToCents(10.554)).toBe(10.55);
    expect(roundToCents(100)).toBe(100);
    expect(roundToCents(0.001)).toBe(0);
  });
});

describe('convertToMonths', () => {
  it('converts weeks to months', () => {
    const result = convertToMonths(4, 'weeks');
    expect(result).toBeCloseTo(0.92, 1);
  });

  it('converts years to months', () => {
    expect(convertToMonths(1, 'years')).toBe(12);
    expect(convertToMonths(2, 'years')).toBe(24);
  });

  it('returns months unchanged', () => {
    expect(convertToMonths(6, 'months')).toBe(6);
  });
});

describe('calculateFlatRate', () => {
  it('calculates flat rate loan correctly', () => {
    // $1000 at 10% for 12 months
    const result = calculateFlatRate({
      principal: 1000,
      annualRate: 0.10,
      termMonths: 12,
      fees: 0,
    });

    expect(result.totalInterest).toBe(100); // 1000 * 0.10 * 1
    expect(result.totalCost).toBe(1100);
    expect(result.monthlyPayment).toBeCloseTo(91.67, 1);
    expect(result.interestType).toBe('flat');
  });

  it('includes fees in calculation', () => {
    const result = calculateFlatRate({
      principal: 1000,
      annualRate: 0.10,
      termMonths: 12,
      fees: 50,
    });

    expect(result.totalCost).toBe(1150);
  });

  it('handles zero interest rate', () => {
    const result = calculateFlatRate({
      principal: 1000,
      annualRate: 0,
      termMonths: 12,
      fees: 0,
    });

    expect(result.totalInterest).toBe(0);
    expect(result.totalCost).toBe(1000);
  });
});

describe('calculateReducingBalance', () => {
  it('calculates amortizing loan correctly', () => {
    // $1000 at 12% for 12 months (standard amortization)
    const result = calculateReducingBalance({
      principal: 1000,
      annualRate: 0.12,
      termMonths: 12,
      fees: 0,
    });

    // Monthly payment should be around $88.85
    expect(result.monthlyPayment).toBeCloseTo(88.85, 0);
    expect(result.totalInterest).toBeCloseTo(66.19, 0);
    expect(result.interestType).toBe('reducing');
  });

  it('handles zero interest rate', () => {
    const result = calculateReducingBalance({
      principal: 1000,
      annualRate: 0,
      termMonths: 12,
      fees: 0,
    });

    expect(result.totalInterest).toBe(0);
    expect(result.monthlyPayment).toBeCloseTo(83.33, 1);
  });

  it('calculates effective APR with fees', () => {
    const result = calculateReducingBalance({
      principal: 1000,
      annualRate: 0.10,
      termMonths: 12,
      fees: 100,
    });

    expect(result.effectiveAPR).toBeGreaterThan(10);
  });
});

describe('calculateCompoundInterest', () => {
  it('calculates compound interest correctly', () => {
    // $1000 at 10% for 12 months, monthly compounding
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRate: 0.10,
      termMonths: 12,
      fees: 0,
      compoundingFrequency: 12,
    });

    // With monthly compounding: 1000 * (1 + 0.10/12)^12 ≈ 1104.71
    expect(result.finalAmount).toBeCloseTo(1104.71, 0);
    expect(result.totalInterest).toBeCloseTo(104.71, 0);
    expect(result.interestType).toBe('compound');
  });

  it('handles annual compounding', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      annualRate: 0.10,
      termMonths: 12,
      fees: 0,
      compoundingFrequency: 1,
    });

    // Annual compounding: 1000 * (1.10)^1 = 1100
    expect(result.finalAmount).toBe(1100);
  });
});

describe('calculateLoan', () => {
  it('routes to flat rate calculation', () => {
    const result = calculateLoan({
      interestType: 'flat',
      amount: 1000,
      interestRate: 10,
      termLength: 12,
      termUnit: 'months',
      fees: 0,
    });

    expect(result.interestType).toBe('flat');
    expect(result.totalInterest).toBe(100);
  });

  it('routes to reducing balance calculation', () => {
    const result = calculateLoan({
      interestType: 'reducing',
      amount: 1000,
      interestRate: 12,
      termLength: 12,
      termUnit: 'months',
      fees: 0,
    });

    expect(result.interestType).toBe('reducing');
    expect(result.monthlyPayment).toBeCloseTo(88.85, 0);
  });

  it('routes to compound interest calculation', () => {
    const result = calculateLoan({
      interestType: 'compound',
      amount: 1000,
      interestRate: 10,
      termLength: 12,
      termUnit: 'months',
      fees: 0,
    });

    expect(result.interestType).toBe('compound');
  });

  it('handles term conversion from weeks', () => {
    const result = calculateLoan({
      interestType: 'flat',
      amount: 1000,
      interestRate: 10,
      termLength: 52,
      termUnit: 'weeks',
      fees: 0,
    });

    expect(result).toBeDefined();
    expect(result.totalInterest).toBeCloseTo(100, 0);
  });

  it('handles term conversion from years', () => {
    const result = calculateLoan({
      interestType: 'flat',
      amount: 1000,
      interestRate: 10,
      termLength: 2,
      termUnit: 'years',
      fees: 0,
    });

    expect(result.totalInterest).toBe(200); // 1000 * 0.10 * 2 years
  });
});

describe('checkPredatoryWarning', () => {
  it('returns warning object for APR > 50%', () => {
    const warning = checkPredatoryWarning(55);
    expect(warning).toBeTruthy();
    expect(warning.isPredatory).toBe(true);
    expect(warning.severity).toBe('warning');
    expect(warning.message).toContain('high effective APR');
  });

  it('returns critical severity for APR > 100%', () => {
    const warning = checkPredatoryWarning(120);
    expect(warning.isPredatory).toBe(true);
    expect(warning.severity).toBe('critical');
  });

  it('returns non-predatory for APR <= 50%', () => {
    const warning50 = checkPredatoryWarning(50);
    expect(warning50.isPredatory).toBe(false);
    expect(warning50.severity).toBe('none');
    expect(warning50.message).toBeNull();

    const warning25 = checkPredatoryWarning(25);
    expect(warning25.isPredatory).toBe(false);
  });
});
