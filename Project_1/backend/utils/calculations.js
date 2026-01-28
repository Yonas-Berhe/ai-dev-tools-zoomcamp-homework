/**
 * Loan calculation utilities
 * Same logic as frontend for consistency
 * PRD Reference: Section 3.1 - Loan Calculator
 */

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

function convertToMonths(term, unit) {
  switch (unit) {
    case 'weeks':
      return term / 4.33;
    case 'years':
      return term * 12;
    case 'months':
    default:
      return term;
  }
}

function calculateFlatRate({ principal, annualRate, termMonths, fees = 0 }) {
  const termYears = termMonths / 12;
  const totalInterest = principal * annualRate * termYears;
  const totalCost = principal + totalInterest + fees;
  const monthlyPayment = totalCost / termMonths;
  const effectiveAPR = ((totalInterest + fees) / principal / termYears) * 100;

  return {
    monthlyPayment: roundToCents(monthlyPayment),
    totalInterest: roundToCents(totalInterest),
    totalCost: roundToCents(totalCost),
    effectiveAPR: roundToCents(effectiveAPR),
    interestType: 'flat',
  };
}

function calculateReducingBalance({ principal, annualRate, termMonths, fees = 0 }) {
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
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, n)) / 
    (Math.pow(1 + monthlyRate, n) - 1);
  
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - principal;
  const totalCost = totalPaid + fees;
  const effectiveAPR = ((totalInterest + fees) / principal / (termMonths / 12)) * 100;

  return {
    monthlyPayment: roundToCents(monthlyPayment),
    totalInterest: roundToCents(totalInterest),
    totalCost: roundToCents(totalCost),
    effectiveAPR: roundToCents(effectiveAPR),
    interestType: 'reducing',
  };
}

function calculateCompoundInterest({ principal, annualRate, termMonths, fees = 0, compoundingFrequency = 12 }) {
  const termYears = termMonths / 12;
  const n = compoundingFrequency;
  
  const finalAmount = principal * Math.pow(1 + annualRate / n, n * termYears);
  const totalInterest = finalAmount - principal;
  const totalCost = finalAmount + fees;
  const monthlyPayment = totalCost / termMonths;
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

function calculateLoan({ interestType, amount, interestRate, termLength, termUnit = 'months', fees = 0 }) {
  const principal = parseFloat(amount);
  const annualRate = parseFloat(interestRate) / 100;
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

function checkPredatoryWarning(effectiveAPR) {
  const PREDATORY_THRESHOLD = 50;
  
  if (effectiveAPR > PREDATORY_THRESHOLD) {
    return {
      isPredatory: true,
      severity: effectiveAPR > 100 ? 'critical' : 'warning',
      message: `Warning: This loan has a very high effective APR of ${effectiveAPR}%. Consider looking for alternatives with lower rates.`,
    };
  }
  
  return {
    isPredatory: false,
    severity: 'none',
    message: null,
  };
}

module.exports = {
  calculateLoan,
  checkPredatoryWarning,
  roundToCents,
};
