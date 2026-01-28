/**
 * Loan Calculator Component
 * PRD Reference: Section 3.1 - Loan Calculator (MVP - Priority 1)
 * 
 * Features:
 * - Three interest types: flat, reducing, compound
 * - Real-time calculation
 * - Predatory loan warning (>50% APR)
 * - Save to history (IndexedDB)
 * - Works offline
 * 
 * Bundle size target: <10KB (per quick-ref.md)
 */

import { useEffect } from 'react';
import { useLoanStore } from '../../stores/loanStore';

export default function LoanCalculator() {
  const {
    formValues,
    setFormValue,
    results,
    warning,
    error,
    calculate,
    saveToHistory,
    resetForm,
    history,
    loadHistory,
    loadCalculation,
    deleteFromHistory,
  } = useLoanStore();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Calculator Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          🧮 Loan Calculator
        </h2>

        {/* Loan Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Loan Amount
          </label>
          <div className="flex gap-2">
            <select
              value={formValues.currency}
              onChange={(e) => setFormValue('currency', e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
            >
              <option value="USD">$</option>
              <option value="KES">KSh</option>
              <option value="NGN">₦</option>
              <option value="INR">₹</option>
              <option value="PHP">₱</option>
            </select>
            <input
              type="number"
              inputMode="decimal"
              placeholder="1000"
              value={formValues.amount}
              onChange={(e) => setFormValue('amount', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
              required
              min="0"
              step="any"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="10"
            value={formValues.interestRate}
            onChange={(e) => setFormValue('interestRate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
            required
            min="0"
            max="500"
            step="any"
          />
        </div>

        {/* Interest Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Interest Type
          </label>
          <select
            value={formValues.interestType}
            onChange={(e) => setFormValue('interestType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
          >
            <option value="reducing">Reducing Balance (Most Common)</option>
            <option value="flat">Flat Rate</option>
            <option value="compound">Compound Interest</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formValues.interestType === 'reducing' && 'Interest calculated on remaining balance each month'}
            {formValues.interestType === 'flat' && 'Interest calculated on original amount for entire term'}
            {formValues.interestType === 'compound' && 'Interest added to principal, then interest charged on total'}
          </p>
        </div>

        {/* Loan Term */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Loan Term
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="12"
              value={formValues.termLength}
              onChange={(e) => setFormValue('termLength', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
              required
              min="1"
            />
            <select
              value={formValues.termUnit}
              onChange={(e) => setFormValue('termUnit', e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
            >
              <option value="months">Months</option>
              <option value="weeks">Weeks</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        {/* Additional Fees */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Additional Fees (optional)
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={formValues.fees}
            onChange={(e) => setFormValue('fees', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
            min="0"
            step="any"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg min-h-[44px] transition-colors"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg min-h-[44px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            📊 Results
          </h3>

          {/* Predatory Warning */}
          {warning?.isPredatory && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              warning.severity === 'critical' 
                ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
            }`}>
              ⚠️ {warning.message}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Monthly Payment</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formValues.currency === 'USD' && '$'}
                {formValues.currency === 'KES' && 'KSh '}
                {formValues.currency === 'NGN' && '₦'}
                {formValues.currency === 'INR' && '₹'}
                {formValues.currency === 'PHP' && '₱'}
                {results.monthlyPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Total Interest</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {results.totalInterest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Total Cost</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {results.totalCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600 dark:text-slate-400">Effective APR</span>
              <span className={`font-medium ${
                results.effectiveAPR > 50 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {results.effectiveAPR}%
              </span>
            </div>
          </div>

          <button
            onClick={saveToHistory}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg min-h-[44px] transition-colors"
          >
            💾 Save to History
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            📜 Saved Calculations
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <button
                  onClick={() => loadCalculation(item)}
                  className="flex-1 text-left min-h-[44px] flex flex-col justify-center"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.amount.toLocaleString()} @ {item.interestRate}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.interestType} • {item.termLength} {item.termUnit}
                  </span>
                </button>
                <button
                  onClick={() => deleteFromHistory(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
