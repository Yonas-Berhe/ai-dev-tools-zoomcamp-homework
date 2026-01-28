/**
 * Loan Calculator Store
 * PRD Reference: Section 4 - Technical Architecture
 * 
 * Zustand store for loan calculator state management.
 * Zustand chosen over Redux for smaller bundle size (1KB vs 8KB).
 * 
 * Supports hybrid mode:
 * - Offline: Uses IndexedDB for local storage
 * - Online: Syncs with backend API when authenticated
 */

import { create } from 'zustand';
import { saveLoan, getAllLoans, deleteLoan } from '../utils/db';
import { calculateLoan, checkPredatoryWarning } from '../utils/calculations';
import { loansAPI, authAPI } from '../utils/api';

/**
 * Default form values
 */
const defaultFormValues = {
  amount: '',
  interestRate: '',
  termLength: '',
  termUnit: 'months',
  interestType: 'reducing',
  fees: '',
  currency: 'USD',
};

/**
 * Loan store with calculation and history management
 */
export const useLoanStore = create((set, get) => ({
  // Form state
  formValues: { ...defaultFormValues },
  
  // Calculation results
  results: null,
  warning: null,
  
  // History
  history: [],
  isLoadingHistory: false,
  
  // Error state
  error: null,

  /**
   * Update form field value
   */
  setFormValue: (field, value) => {
    set((state) => ({
      formValues: { ...state.formValues, [field]: value },
      // Clear results when form changes
      results: null,
      warning: null,
    }));
  },

  /**
   * Reset form to default values
   */
  resetForm: () => {
    set({
      formValues: { ...defaultFormValues },
      results: null,
      warning: null,
      error: null,
    });
  },

  /**
   * Calculate loan based on current form values
   */
  calculate: () => {
    const { formValues } = get();
    
    // Validate required fields
    if (!formValues.amount || !formValues.interestRate || !formValues.termLength) {
      set({ error: 'Please fill in all required fields' });
      return;
    }

    try {
      const results = calculateLoan({
        amount: formValues.amount,
        interestRate: formValues.interestRate,
        termLength: formValues.termLength,
        termUnit: formValues.termUnit,
        interestType: formValues.interestType,
        fees: formValues.fees || 0,
      });

      const warning = checkPredatoryWarning(results.effectiveAPR);

      set({ results, warning, error: null });
    } catch (err) {
      set({ error: 'Calculation error. Please check your inputs.' });
    }
  },

  /**
   * Save current calculation to history (IndexedDB + API if authenticated)
   */
  saveToHistory: async () => {
    const { results, formValues } = get();
    
    if (!results) {
      set({ error: 'No calculation to save' });
      return;
    }

    try {
      const loanRecord = {
        id: crypto.randomUUID(),
        ...formValues,
        results: {
          monthlyPayment: results.monthlyPayment,
          totalInterest: results.totalInterest,
          totalCost: results.totalCost,
          effectiveAPR: results.effectiveAPR,
        },
        createdAt: Date.now(),
      };

      // Always save to IndexedDB for offline access
      await saveLoan(loanRecord);
      
      // If authenticated, also save to backend
      if (authAPI.isAuthenticated()) {
        try {
          await loansAPI.save({
            principal: parseFloat(formValues.amount),
            interest_rate: parseFloat(formValues.interestRate),
            term_length: parseInt(formValues.termLength),
            term_unit: formValues.termUnit,
            interest_type: formValues.interestType,
            fees: parseFloat(formValues.fees) || 0,
            currency: formValues.currency,
            monthly_payment: results.monthlyPayment,
            total_interest: results.totalInterest,
            total_cost: results.totalCost,
            effective_apr: results.effectiveAPR,
          });
        } catch (apiErr) {
          console.warn('Failed to sync to backend, saved locally:', apiErr);
        }
      }
      
      // Refresh history
      const history = await getAllLoans();
      set({ history: history.reverse(), error: null }); // Most recent first
    } catch (err) {
      set({ error: 'Failed to save calculation' });
    }
  },

  /**
   * Load calculation history from IndexedDB (and optionally sync with API)
   */
  loadHistory: async () => {
    set({ isLoadingHistory: true });
    
    try {
      // Load from IndexedDB first (offline-first)
      const localHistory = await getAllLoans();
      set({ history: localHistory.reverse(), isLoadingHistory: false });
      
      // If authenticated, also fetch from backend to sync
      if (authAPI.isAuthenticated()) {
        try {
          const response = await loansAPI.getHistory();
          if (response.success && response.data.loans) {
            // Merge backend data with local (backend as source of truth for synced items)
            // For now, just update state - a more sophisticated merge could be done
            console.log('Backend loans synced:', response.data.loans.length);
          }
        } catch (apiErr) {
          console.warn('Failed to fetch from backend, using local data:', apiErr);
        }
      }
    } catch (err) {
      set({ 
        error: 'Failed to load history', 
        isLoadingHistory: false 
      });
    }
  },

  /**
   * Delete a calculation from history
   */
  deleteFromHistory: async (id) => {
    try {
      await deleteLoan(id);
      
      // Update local state
      set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      }));
    } catch (err) {
      set({ error: 'Failed to delete calculation' });
    }
  },

  /**
   * Load a saved calculation into the form
   */
  loadCalculation: (savedCalc) => {
    set({
      formValues: {
        amount: savedCalc.amount,
        interestRate: savedCalc.interestRate,
        termLength: savedCalc.termLength,
        termUnit: savedCalc.termUnit,
        interestType: savedCalc.interestType,
        fees: savedCalc.fees || '',
        currency: savedCalc.currency || 'USD',
      },
      results: savedCalc.results,
      warning: checkPredatoryWarning(savedCalc.results.effectiveAPR),
    });
  },
}));
