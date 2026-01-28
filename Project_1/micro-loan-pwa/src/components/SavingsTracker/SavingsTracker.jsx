/**
 * Savings Tracker Component
 * PRD Reference: Section 3.2 - Savings Tracker (MVP - Priority 1)
 * 
 * Features:
 * - Single savings goal (MVP)
 * - CSS-based progress bars (no Chart.js per .cursorrules)
 * - Add/remove transactions
 * - Offline support via IndexedDB
 * - API sync when authenticated
 * 
 * Bundle size target: <8KB (per quick-ref.md)
 */

import { useState, useEffect } from 'react';
import { 
  saveSavingsGoal, 
  getAllSavingsGoals, 
  deleteSavingsGoal 
} from '../../utils/db';
import { savingsAPI, authAPI } from '../../utils/api';
import useAuthStore from '../../stores/authStore';

export default function SavingsTracker() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Form state for new goal
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currency: 'USD',
  });

  // Load goals on mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    // Load from IndexedDB first (offline-first)
    const savedGoals = await getAllSavingsGoals();
    setGoals(savedGoals.reverse()); // Most recent first
    
    // If authenticated, also sync with backend
    if (authAPI.isAuthenticated()) {
      setIsSyncing(true);
      try {
        const response = await savingsAPI.getAll();
        if (response.success && response.data.goals) {
          console.log('Backend savings goals synced:', response.data.goals.length);
        }
      } catch (err) {
        console.warn('Failed to sync savings from backend:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    
    const goal = {
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currency: newGoal.currency,
      currentAmount: 0,
      transactions: [],
    };

    // Save to IndexedDB
    await saveSavingsGoal(goal);
    
    // If authenticated, also save to backend
    if (authAPI.isAuthenticated()) {
      try {
        await savingsAPI.create({
          name: goal.name,
          target_amount: goal.targetAmount,
          currency: goal.currency,
        });
      } catch (err) {
        console.warn('Failed to sync goal to backend:', err);
      }
    }
    
    await loadGoals();
    
    setNewGoal({ name: '', targetAmount: '', currency: 'USD' });
    setShowForm(false);
  };

  const handleAddTransaction = async (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const transaction = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      date: Date.now(),
      type: parseFloat(amount) >= 0 ? 'deposit' : 'withdrawal',
    };

    const updatedGoal = {
      ...goal,
      currentAmount: goal.currentAmount + parseFloat(amount),
      transactions: [...goal.transactions, transaction],
    };

    // Check if goal completed
    if (updatedGoal.currentAmount >= goal.targetAmount && !goal.completedAt) {
      updatedGoal.completedAt = Date.now();
    }

    await saveSavingsGoal(updatedGoal);
    await loadGoals();
    
    setTransactionAmount('');
    setSelectedGoal(null);
  };

  const handleDeleteGoal = async (id) => {
    if (confirm('Delete this savings goal?')) {
      await deleteSavingsGoal(id);
      await loadGoals();
    }
  };

  const getProgressPercentage = (current, target) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { USD: '$', KES: 'KSh ', NGN: '₦', INR: '₹', PHP: '₱' };
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            🎯 Savings Goals
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px] transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </div>

        {/* New Goal Form */}
        {showForm && (
          <form onSubmit={handleCreateGoal} className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                placeholder="e.g., Emergency Fund"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Amount
              </label>
              <div className="flex gap-2">
                <select
                  value={newGoal.currency}
                  onChange={(e) => setNewGoal({ ...newGoal, currency: e.target.value })}
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
                  placeholder="5000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
                  required
                  min="1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg min-h-[44px] transition-colors"
            >
              Create Goal
            </button>
          </form>
        )}
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">No savings goals yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Create your first goal to start tracking your savings!
          </p>
        </div>
      ) : (
        goals.map((goal) => (
          <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
            {/* Goal Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {goal.completedAt && '🎉 '}{goal.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrency(goal.currentAmount, goal.currency)} of {formatCurrency(goal.targetAmount, goal.currency)}
                </p>
              </div>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="text-red-500 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Delete goal"
              >
                🗑️
              </button>
            </div>

            {/* Progress Bar (CSS-based per .cursorrules - no Chart.js) */}
            <div className="mb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    goal.completedAt 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%` }}
                />
              </div>
              <p className="text-right text-sm text-slate-500 dark:text-slate-400 mt-1">
                {getProgressPercentage(goal.currentAmount, goal.targetAmount)}% complete
              </p>
            </div>

            {/* Add Transaction */}
            {selectedGoal === goal.id ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 min-h-[44px]"
                  autoFocus
                />
                <button
                  onClick={() => handleAddTransaction(goal.id, transactionAmount)}
                  disabled={!transactionAmount}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg min-h-[44px] transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg min-h-[44px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedGoal(goal.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px] transition-colors"
              >
                + Add Savings
              </button>
            )}

            {/* Recent Transactions */}
            {goal.transactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Recent Transactions
                </p>
                <div className="space-y-1">
                  {goal.transactions.slice(-3).reverse().map((tx) => (
                    <div key={tx.id} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, goal.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
