/**
 * Micro-Loan Calculator PWA
 * PRD Reference: Section 1 - Executive Summary
 * 
 * A lightweight, offline-first Progressive Web App that provides 
 * transparent loan calculations, savings tracking, and financial literacy.
 */

import { useState, useEffect } from 'react';
import './App.css';
import LoanCalculator from './components/LoanCalculator/LoanCalculator';
import SavingsTracker from './components/SavingsTracker/SavingsTracker';
import FinancialLiteracy from './components/FinancialLiteracy/FinancialLiteracy';
import AuthModal from './components/Auth/AuthModal';
import useAuthStore from './stores/authStore';

// Tab configuration
const TABS = {
  calculator: { id: 'calculator', label: 'Calculator', emoji: '🧮' },
  savings: { id: 'savings', label: 'Savings', emoji: '🎯' },
  learn: { id: 'learn', label: 'Learn', emoji: '📚' },
};

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, isAuthenticated, isLoading, initAuth, logout } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">💰 Micro-Loan Calculator</h1>
            <p className="text-blue-200 text-sm">Financial empowerment tool</p>
          </div>
          
          {/* Auth Button */}
          <div>
            {isLoading ? (
              <span className="text-blue-200 text-sm">Loading...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-200 hidden sm:inline">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm min-h-[36px] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm min-h-[36px] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sync Status Banner */}
      {isAuthenticated && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-center text-xs py-1">
          ☁️ Synced with cloud
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {activeTab === 'calculator' && <LoanCalculator />}
        {activeTab === 'savings' && <SavingsTracker />}
        {activeTab === 'learn' && <FinancialLiteracy />}
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 z-10">
        <nav className="max-w-md mx-auto flex justify-around">
          {Object.values(TABS).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;
