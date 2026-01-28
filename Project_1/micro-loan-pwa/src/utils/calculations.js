/**
 * Loan Calculation Utilities
 * PRD Reference: Section 3.1 - Loan Calculator
 * Quick Reference: Financial Formulas section
 * 
 * Supports three interest types:
 * 1. Flat Rate - Simple interest on original principal
 * 2. Reducing Balance - Interest calculated on remaining principal
 * 3. Compound Interest - Interest on principal + accumulated interest
 * 
 * All calculations accurate to 2 decimal places (PRD requirement)
 */

/**
 * Round to 2 decimal places (financial precision)
 * @param {number} value - Number to round
 * @returns {number} Rounded value
 */
export function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Convert term to months based on unit
 * @param {number} term - Term length
 * @param {'weeks' | 'months' | 'years'} unit - Term unit
 * @returns {number} Term in months
 */
export function convertToMonths(term, unit) {
  switch (unit) {
    case 'weeks':
      return term / 4.33; // Average weeks per month
    case 'years':
      return term * 12;
    case 'months':
    default:
      return term;
  }
}

/**
 * Calculate Flat Rate Interest
 * PRD Reference: Quick-ref.md - Financial Formulas
 * 
 * Formula:
 * Total Interest = Principal × Rate × Term (in years)
 * Monthly Payment = (Principal + Total Interest) / Number of Payments
 * 
 * @param {Object} params - Loan parameters
 * @param {number} params.principal - Loan amount
 * @param {number} params.annualRate - Annual interest rate (as decimal, e.g., 0.10 for 10%)
 * @param {number} params.termMonths - Loan term in months
 * @param {number} params.fees - Additional fees
 * @returns {Object} Calculation results
 */
export function calculateFlatRate({ principal, annualRate, termMonths, fees = 0 }) {
  const termYears = termMonths / 12;
  const totalInterest = principal * annualRate * termYears;
  const totalCost = principal + totalInterest + fees;
  const monthlyPayment = totalCost / termMonths;
  
  // Calculate effective APR (accounts for fees)
  const effectiveAPR = ((totalInterest + fees) / principal / termYears) * 100;

  return {
    monthlyPayment: roundToCents(monthlyPayment),
    totalInterest: roundToCents(totalInterest),
    totalCost: roundToCents(totalCost),
    effectiveAPR: roundToCents(effectiveAPR),
    interestType: 'flat',
  };
}

/**
 * Calculate Reducing Balance (Amortizing) Interest
 * PRD Reference: Quick-ref.md - Financial Formulas
 * 
 * This is the most common loan calculation method.
 * Interest is charged on the remaining principal each period.
 * 
 * Formula:
 * Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   P = Principal
 *   r = Monthly interest rate
 *   n = Number of payments
 * 
 * @param {Object} params - Loan parameters
 * @param {number} params.principal - Loan amount
 * @param {number} params.annualRate - Annual interest rate (as decimal)
 * @param {number} params.termMonths - Loan term in months
 * @param {number} params.fees - Additional fees
 * @returns {Object} Calculation results
 */
export function calculateReducingBalance({ principal, annualRate, termMonths, fees = 0 }) {
  // Handle edge case: 0% interest
  if (annualRate === 0) {
    const monthlyPayment = principal / termMonths;
    return {
      monthlyPayment: roundToCents(monthlyPayment),
      totalInterest: 0,
      totalCost: roundToCents(principal + fees),
      effectiveAPR: fees > 0 ? roundToCents((fees / principal / (termMonths / 12)) * 100) : 0,
      interestType: 'reducing',
    };
  }

  const monthlyRate = annualRate / 12;
  const n = termMonths;
  
  // Standard amortization formula
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, n)) / 
    (Math.pow(1 + monthlyRate, n) - 1);
  
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - principal;
  const totalCost = totalPaid + fees;
  
  // Effective APR calculation (simplified - includes fees spread over loan term)
  const effectiveAPR = ((totalInterest + fees) / principal / (termMonths / 12)) * 100;

  return {
    monthlyPayment: roundToCents(monthlyPayment),
    totalInterest: roundToCents(totalInterest),
    totalCost: roundToCents(totalCost),
    effectiveAPR: roundToCents(effectiveAPR),
    interestType: 'reducing',
  };
}

/**
 * Calculate Compound Interest
 * PRD Reference: Quick-ref.md - Financial Formulas
 * 
 * Used for savings growth or balloon payment loans.
 * Interest compounds on principal + accumulated interest.
 * 
 * Formula:
 * Final Amount = P × (1 + r/n)^(n×t)
 * Where:
 *   P = Principal
 *   r = Annual interest rate
 *   n = Compounding frequency per year
 *   t = Time in years
 * 
 * @param {Object} params - Loan parameters
 * @param {number} params.principal - Loan amount
 * @param {number} params.annualRate - Annual interest rate (as decimal)
 * @param {number} params.termMonths - Loan term in months
 * @param {number} params.fees - Additional fees
 * @param {number} params.compoundingFrequency - Times per year interest compounds (default: 12)
 * @returns {Object} Calculation results
 */
export function calculateCompoundInterest({ 
  principal, 
  annualRate, 
  termMonths, 
  fees = 0,
  compoundingFrequency = 12 
}) {
  const termYears = termMonths / 12;
  const n = compoundingFrequency;
  
  // Compound interest formula
  const finalAmount = principal * Math.pow(1 + annualRate / n, n * termYears);
  const totalInterest = finalAmount - principal;
  const totalCost = finalAmount + fees;
  
  // Monthly payment if spread evenly (balloon payment loans don't have monthly payments)
  const monthlyPayment = totalCost / termMonths;
  
  // Effective APR
  const effectiveAPR = ((totalInterest + fees) / principal / termYears) * 100;

  return {
    monthlyPayment: roundToCents(monthlyPayment),
    totalInterest: roundToCents(totalInterest),
    totalCost: roundToCents(totalCost),
    effectiveAPR: roundToCents(effectiveAPR),
    finalAmount: roundToCents(finalAmount),
    interestType: 'compound',
  };
}

/**
 * Main calculation function - routes to appropriate method
 * @param {Object} params - Loan parameters
 * @param {'flat' | 'reducing' | 'compound'} params.interestType - Type of interest calculation
 * @param {number} params.amount - Loan amount (principal)
 * @param {number} params.interestRate - Annual interest rate (as percentage, e.g., 10 for 10%)
 * @param {number} params.termLength - Term length
 * @param {'weeks' | 'months' | 'years'} params.termUnit - Term unit
 * @param {number} params.fees - Additional fees
 * @returns {Object} Calculation results
 */
export function calculateLoan({ 
  interestType, 
  amount, 
  interestRate, 
  termLength, 
  termUnit = 'months',
  fees = 0 
}) {
  const principal = parseFloat(amount);
  const annualRate = parseFloat(interestRate) / 100; // Convert percentage to decimal
  const termMonths = convertToMonths(parseFloat(termLength), termUnit);
  const feeAmount = parseFloat(fees) || 0;

  const params = { principal, annualRate, termMonths, fees: feeAmount };

  let results;
  switch (interestType) {
    case 'flat':
      results = calculateFlatRate(params);
      break;
    case 'compound':
      results = calculateCompoundInterest(params);
      break;
    case 'reducing':
    default:
      results = calculateReducingBalance(params);
      break;
  }

  return {
    ...results,
    // Include input parameters for reference
    input: {
      amount: principal,
      interestRate: parseFloat(interestRate),
      termLength: parseFloat(termLength),
      termUnit,
      fees: feeAmount,
      interestType,
    },
  };
}

/**
 * Check if loan terms appear predatory
 * PRD Reference: Quick-ref.md - Predatory loan warning >50% APR
 * 
 * @param {number} effectiveAPR - Calculated effective APR
 * @returns {Object} Warning status and message
 */
export function checkPredatoryWarning(effectiveAPR) {
  const PREDATORY_THRESHOLD = 50; // 50% APR per quick-ref.md
  
  if (effectiveAPR > PREDATORY_THRESHOLD) {
    return {
      isPredatory: true,
      severity: effectiveAPR > 100 ? 'critical' : 'warning',
      message: `Warning: This loan has a very high effective APR of ${effectiveAPR}%. ` +
               `Consider looking for alternatives with lower rates.`,
    };
  }
  
  return {
    isPredatory: false,
    severity: 'none',
    message: null,
  };
}

/**
 * Generate amortization schedule for reducing balance loans
 * Shows month-by-month breakdown of payments
 * 
 * @param {Object} params - Loan parameters
 * @returns {Array} Monthly payment breakdown
 */
export function generateAmortizationSchedule({ principal, annualRate, termMonths }) {
  const monthlyRate = annualRate / 12;
  const { monthlyPayment } = calculateReducingBalance({ 
    principal, 
    annualRate, 
    termMonths, 
    fees: 0 
  });
  
  const schedule = [];
  let balance = principal;
  
  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    
    schedule.push({
      month,
      payment: roundToCents(monthlyPayment),
      principal: roundToCents(principalPayment),
      interest: roundToCents(interestPayment),
      balance: roundToCents(balance),
    });
  }
  
  return schedule;
}
