import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ExpensesList } from './components/ExpensesList';
import { BudgetsManager } from './components/BudgetsManager';
import { AiAdvisor } from './components/AiAdvisor';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { NaturalLoggerModal } from './components/NaturalLoggerModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { AppTheme, CategoryBudget, Expense, SpendingInsight } from './types';
import { INITIAL_CATEGORY_BUDGETS, INITIAL_EXPENSES } from './data/sampleData';

export default function App() {
  // Theme state: dark (#0A0A0A) vs light (#EBEBEB)
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('qalta_theme_v1');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  // Persistence state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('qalta_expenses_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored expenses', e);
      }
    }
    return INITIAL_EXPENSES;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('qalta_budgets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored budgets', e);
      }
    }
    return INITIAL_CATEGORY_BUDGETS;
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('qalta_currency_v1') || 'USD';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'budgets' | 'advisor'>('overview');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNaturalLogOpen, setIsNaturalLogOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [selectedExpenseForReceipt, setSelectedExpenseForReceipt] = useState<Expense | null>(null);

  // AI Financial Insights state
  const [insights, setInsights] = useState<SpendingInsight[]>([
    {
      id: 'ins-1',
      type: 'tip',
      title: 'Groceries vs. Dining Balance',
      message: 'Your dining-out expenses represent 38% of total spending. Cooking 1 extra meal at home can save ~$60/week.',
      impactAmount: 60,
      actionable: 'Set a weekly dining budget limit of $120.',
    },
    {
      id: 'ins-2',
      type: 'subscription',
      title: '2 Active Recurring Subscriptions',
      message: 'You have Spotify Family ($19.99/mo) and Equinox ($140/mo) active.',
      impactAmount: 159.99,
      actionable: 'Review renewal dates in Budgets tab.',
    },
    {
      id: 'ins-3',
      type: 'celebration',
      title: 'Housing Utilities On Target',
      message: 'Your utility and recurring essentials are within projected safe ranges for this month.',
    },
  ]);
  const [healthScore, setHealthScore] = useState<number>(88);
  const [forecastSpend, setForecastSpend] = useState<number>(1420);
  const [summaryParagraph, setSummaryParagraph] = useState<string>(
    'Your budget discipline is steady. Discretionary spending in Food & Dining is the primary optimization lever.'
  );
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('qalta_expenses_v1', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('qalta_budgets_v1', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('qalta_currency_v1', currency);
  }, [currency]);

  // Sync theme to local storage and document element
  useEffect(() => {
    localStorage.setItem('qalta_theme_v1', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch AI Insights from server
  const fetchAIInsights = useCallback(async () => {
    setIsRefreshingInsights(true);
    try {
      const res = await fetch('/api/financial-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          budgets,
          currency,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();

      if (data.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
      }
      if (typeof data.healthScore === 'number') {
        setHealthScore(data.healthScore);
      }
      if (typeof data.forecastSpend === 'number') {
        setForecastSpend(data.forecastSpend);
      }
      if (data.summaryParagraph) {
        setSummaryParagraph(data.summaryParagraph);
      }
      showToast('AI financial insights updated');
    } catch (err) {
      console.warn('AI Insights fallback:', err);
    } finally {
      setIsRefreshingInsights(false);
    }
  }, [expenses, budgets, currency]);

  // Expense Handlers
  const handleSaveNewExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Logged expense: ${newExpense.merchant} (${newExpense.amount.toFixed(2)})`);
  };

  const handleUpdateExpense = (updated: Expense | Omit<Expense, 'id' | 'createdAt'>) => {
    if ('id' in updated) {
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? (updated as Expense) : e)));
      showToast(`Updated expense: ${updated.merchant}`);
    } else {
      handleSaveNewExpense(updated);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense deleted');
  };

  const handleDuplicateExpense = (expense: Expense) => {
    const duplicated: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [duplicated, ...prev]);
    showToast(`Duplicated: ${duplicated.merchant}`);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset ledger with sample receipts and default budgets?')) {
      setExpenses(INITIAL_EXPENSES);
      setBudgets(INITIAL_CATEGORY_BUDGETS);
      setCurrency('USD');
      localStorage.removeItem('qalta_expenses_v1');
      localStorage.removeItem('qalta_budgets_v1');
      localStorage.removeItem('qalta_currency_v1');
      showToast('Restored sample receipts and budgets');
    }
  };

  return (
    <div className={`min-h-screen theme-bg-app theme-text-main flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl theme-bg-card theme-text-main font-medium text-xs shadow-xl theme-border border animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNaturalLog={() => setIsNaturalLogOpen(true)}
        currency={currency}
        onChangeCurrency={setCurrency}
        onResetSampleData={handleResetSampleData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            expenses={expenses}
            budgets={budgets}
            currency={currency}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNaturalLog={() => setIsNaturalLogOpen(true)}
            onSelectExpense={(exp) => setSelectedExpenseForReceipt(exp)}
            onNavigateTab={setActiveTab}
            insights={insights}
            theme={theme}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesList
            expenses={expenses}
            currency={currency}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenManualAdd={() => {
              setExpenseToEdit(null);
              setIsExpenseFormOpen(true);
            }}
            onSelectExpense={(exp) => setSelectedExpenseForReceipt(exp)}
            onEditExpense={(exp) => {
              setExpenseToEdit(exp);
              setIsExpenseFormOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onDuplicateExpense={handleDuplicateExpense}
            theme={theme}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsManager
            budgets={budgets}
            expenses={expenses}
            currency={currency}
            onUpdateBudgets={setBudgets}
            onAddManualExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseFormOpen(true);
            }}
            theme={theme}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisor
            expenses={expenses}
            budgets={budgets}
            currency={currency}
            insights={insights}
            healthScore={healthScore}
            forecastSpend={forecastSpend}
            summaryParagraph={summaryParagraph}
            onRefreshInsights={fetchAIInsights}
            isRefreshingInsights={isRefreshingInsights}
            theme={theme}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Receipt Scanner with live camera and OCR HUD */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveExpense={handleSaveNewExpense}
        preferredCurrency={currency}
        theme={theme}
      />

      {/* 2. Natural Language AI logger */}
      <NaturalLoggerModal
        isOpen={isNaturalLogOpen}
        onClose={() => setIsNaturalLogOpen(false)}
        onSaveExpense={handleSaveNewExpense}
        preferredCurrency={currency}
        theme={theme}
      />

      {/* 3. Manual Add & Edit Expense Form */}
      <ExpenseFormModal
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleUpdateExpense}
        expenseToEdit={expenseToEdit}
        preferredCurrency={currency}
        theme={theme}
      />

      {/* 4. Receipt High-Res Inspector & Zoom Modal */}
      <ReceiptDetailModal
        isOpen={Boolean(selectedExpenseForReceipt)}
        expense={selectedExpenseForReceipt}
        onClose={() => setSelectedExpenseForReceipt(null)}
        onEdit={(exp) => {
          setSelectedExpenseForReceipt(null);
          setExpenseToEdit(exp);
          setIsExpenseFormOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteExpense(id);
          setSelectedExpenseForReceipt(null);
        }}
        theme={theme}
      />
    </div>
  );
}
