import React, { useState, useEffect, useCallback } from 'react';
import ReactNativeApp from './ReactNativeApp.jsx';
import { Navbar, NavTabType } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ExpensesList } from './components/ExpensesList';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { PaymentCalendar } from './components/PaymentCalendar';
import { BudgetsManager } from './components/BudgetsManager';
import { AiAdvisor } from './components/AiAdvisor';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { NaturalLoggerModal } from './components/NaturalLoggerModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { WalletsManagerModal } from './components/WalletsManagerModal';
import { TransferModal } from './components/TransferModal';
import { QaltaVoiceModal } from './components/QaltaVoiceModal';
import { QaltaFloatingDock } from './components/QaltaFloatingDock';
import {
  AppTheme,
  CategoryBudget,
  Expense,
  FinancialGoal,
  SpendingInsight,
  Subscription,
  WalletAccount,
} from './types';
import {
  INITIAL_BUDGETS,
  INITIAL_EXPENSES,
  INITIAL_FINANCIAL_GOALS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_WALLETS,
} from './data/sampleData';

export default function App() {
  // Theme state: dark (#08080A) vs light (#F4F5F8)
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('qalta_theme_v1');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  // Persistent States
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

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('qalta_subscriptions_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored subscriptions', e);
      }
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [wallets, setWallets] = useState<WalletAccount[]>(() => {
    const saved = localStorage.getItem('qalta_wallets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored wallets', e);
      }
    }
    return INITIAL_WALLETS;
  });

  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('qalta_goals_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored goals', e);
      }
    }
    return INITIAL_FINANCIAL_GOALS;
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
    return INITIAL_BUDGETS;
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('qalta_currency_v1') || 'USD';
  });

  // Voice AI hero banner visibility (remembered across sessions)
  const [showVoiceBanner, setShowVoiceBanner] = useState<boolean>(() => {
    const stored = localStorage.getItem('spense_show_voice_banner_v1');
    return stored !== 'false';
  });

  const handleDismissVoiceBanner = () => {
    setShowVoiceBanner(false);
    localStorage.setItem('spense_show_voice_banner_v1', 'false');
    showToast('Voice AI banner removed from overview (Can be restored in Settings)');
  };

  const handleToggleVoiceBanner = () => {
    setShowVoiceBanner((prev) => {
      const nextVal = !prev;
      localStorage.setItem('spense_show_voice_banner_v1', nextVal ? 'true' : 'false');
      showToast(nextVal ? 'Voice AI banner enabled' : 'Voice AI banner hidden');
      return nextVal;
    });
  };

  const [isNativeEngine, setIsNativeEngine] = useState<boolean>(() => {
    const stored = localStorage.getItem('spense_runtime_engine_v1');
    return stored === 'native';
  });

  const handleToggleNativeEngine = () => {
    setIsNativeEngine((prev) => {
      const nextVal = !prev;
      localStorage.setItem('spense_runtime_engine_v1', nextVal ? 'native' : 'web');
      showToast(nextVal ? 'Switched to React Native (JavaScript) Engine' : 'Switched to Web Layout');
      return nextVal;
    });
  };

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTabType>('overview');

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNaturalLogOpen, setIsNaturalLogOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [selectedExpenseForReceipt, setSelectedExpenseForReceipt] = useState<Expense | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>(undefined);

  // AI Financial Insights state
  const [insights, setInsights] = useState<SpendingInsight[]>([
    {
      id: 'ins-1',
      type: 'tip',
      title: 'Dining vs. Groceries Optimal Ratio',
      message:
        'Dining-out expenses represent 34% of monthly outflow. Preparing 1 additional meal at home can save ~$60/week.',
      impactAmount: 60,
      actionable: 'Set a dining budget ceiling of $120/week in Budgets.',
    },
    {
      id: 'ins-2',
      type: 'subscription',
      title: 'Adobe Trial Ending in 2 Days',
      message:
        'Adobe Creative Cloud ($54.99/mo) free trial ends soon. Cancel before rollover if not utilizing Photoshop daily.',
      impactAmount: 54.99,
      actionable: 'Manage in Subscriptions hub.',
    },
    {
      id: 'ins-3',
      type: 'celebration',
      title: '50/30/20 Rule in Healthy Balance',
      message:
        'Essential Needs are currently at 46% of total inflow, leaving strong buffer for Savings and Debt payoff.',
    },
  ]);
  const [healthScore, setHealthScore] = useState<number>(92);
  const [forecastSpend, setForecastSpend] = useState<number>(1380);
  const [summaryParagraph, setSummaryParagraph] = useState<string>(
    'Financial velocity is optimal. Your daily allowance is on pace with healthy margin in your discretionary envelope.'
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
    localStorage.setItem('qalta_subscriptions_v1', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('qalta_wallets_v1', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('qalta_goals_v1', JSON.stringify(financialGoals));
  }, [financialGoals]);

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
          subscriptions,
          wallets,
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
      showToast('Spense AI financial insights updated');
    } catch (err) {
      console.warn('AI Insights fallback:', err);
    } finally {
      setIsRefreshingInsights(false);
    }
  }, [expenses, budgets, subscriptions, wallets, currency]);

  // Expense Handlers
  const handleSaveNewExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Update wallet balance if specified
    if (newExpense.walletAccountId) {
      setWallets((prevWallets) =>
        prevWallets.map((w) => {
          if (w.id === newExpense.walletAccountId) {
            const isInc = newExpense.type === 'income';
            return {
              ...w,
              balance: isInc ? w.balance + newExpense.amount : w.balance - newExpense.amount,
            };
          }
          return w;
        })
      );
    }

    showToast(`Logged transaction: ${newExpense.merchant} (${newExpense.amount.toFixed(2)})`);
  };

  const handleUpdateExpense = (updated: Expense | Omit<Expense, 'id' | 'createdAt'>) => {
    if ('id' in updated) {
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? (updated as Expense) : e)));
      showToast(`Updated: ${updated.merchant}`);
    } else {
      handleSaveNewExpense(updated);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Transaction removed');
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

  const handleImportExpenses = (imported: Expense[]) => {
    setExpenses((prev) => [...imported, ...prev]);
    showToast(`Imported ${imported.length} transactions from CSV`);
  };

  // Subscription Handlers
  const handleAddSubscription = (subData: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [...prev, newSub]);
    showToast(`Added subscription: ${newSub.name}`);
  };

  const handleUpdateSubscription = (sub: Subscription) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    showToast(`Updated subscription: ${sub.name}`);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    showToast('Subscription deleted');
  };

  const handleLogRenewalExpense = (sub: Subscription) => {
    const renewalExpense: Expense = {
      id: `exp-sub-${Date.now()}`,
      type: 'expense',
      merchant: `${sub.name} (Renewal)`,
      amount: sub.amount,
      currency: sub.currency || currency,
      category: sub.category,
      date: new Date().toISOString().slice(0, 10),
      time: '00:01',
      paymentMethod: sub.paymentMethod,
      walletAccountId: sub.walletAccountId,
      isSubscription: true,
      subscriptionId: sub.id,
      notes: `Automatic recurring renewal (${sub.billingCycle})`,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [renewalExpense, ...prev]);

    // Advance next billing date
    const nextDate = new Date();
    if (sub.billingCycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (sub.billingCycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else if (sub.billingCycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setMonth(nextDate.getMonth() + 3);

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === sub.id ? { ...s, nextBillingDate: nextDate.toISOString().slice(0, 10) } : s
      )
    );

    showToast(`Logged charge for ${sub.name}`);
  };

  // Wallet Handlers
  const handleAddWallet = (walletData: Omit<WalletAccount, 'id'>) => {
    const newWallet: WalletAccount = {
      ...walletData,
      id: `wallet-${Date.now()}`,
    };
    setWallets((prev) => [...prev, newWallet]);
    showToast(`Created account: ${newWallet.name}`);
  };

  const handleUpdateWallet = (wallet: WalletAccount) => {
    setWallets((prev) => prev.map((w) => (w.id === wallet.id ? wallet : w)));
    showToast(`Updated account: ${wallet.name}`);
  };

  const handleDeleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
    showToast('Account removed');
  };

  const handleExecuteTransfer = (
    sourceWalletId: string,
    destWalletId: string,
    amount: number,
    date: string,
    notes?: string
  ) => {
    const sourceW = wallets.find((w) => w.id === sourceWalletId);
    const destW = wallets.find((w) => w.id === destWalletId);

    // Update balances
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === sourceWalletId) return { ...w, balance: w.balance - amount };
        if (w.id === destWalletId) return { ...w, balance: w.balance + amount };
        return w;
      })
    );

    // Record transfer transaction
    const transferExpense: Expense = {
      id: `exp-trans-${Date.now()}`,
      type: 'transfer',
      merchant: `Transfer: ${sourceW?.name || 'Account'} → ${destW?.name || 'Account'}`,
      amount,
      currency,
      category: 'Investment',
      date,
      time: '12:00',
      paymentMethod: 'Bank Transfer',
      walletAccountId: sourceWalletId,
      destinationWalletId: destWalletId,
      notes,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [transferExpense, ...prev]);
    showToast(`Transferred ${currency} ${amount.toFixed(2)} between accounts`);
  };

  // Financial Goals Handlers
  const handleAddGoal = (goalData: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setFinancialGoals((prev) => [...prev, newGoal]);
    showToast(`Created goal: ${newGoal.title}`);
  };

  const handleResetSampleData = () => {
    if (
      window.confirm(
        'Reset Spense ledger, subscriptions, multi-currency accounts, and goals with fresh demo data?'
      )
    ) {
      setExpenses(INITIAL_EXPENSES);
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setWallets(INITIAL_WALLETS);
      setFinancialGoals(INITIAL_FINANCIAL_GOALS);
      setBudgets(INITIAL_BUDGETS);
      setCurrency('USD');
      localStorage.removeItem('qalta_expenses_v1');
      localStorage.removeItem('qalta_subscriptions_v1');
      localStorage.removeItem('qalta_wallets_v1');
      localStorage.removeItem('qalta_goals_v1');
      localStorage.removeItem('qalta_budgets_v1');
      localStorage.removeItem('qalta_currency_v1');
      showToast('Restored Spense sample data');
    }
  };

  return (
    <div
      className={`min-h-screen theme-bg-app theme-text-main flex flex-col font-sans pb-20 selection:bg-[#D2AF26]/20 selection:text-[#a38514] dark:selection:text-[#D2AF26] ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 px-4 py-2.5 rounded-2xl theme-bg-card theme-text-main font-semibold text-xs shadow-2xl theme-border border animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D2AF26] animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNaturalLog={() => setIsNaturalLogOpen(true)}
        onOpenWallets={() => setIsWalletsModalOpen(true)}
        currency={currency}
        onChangeCurrency={setCurrency}
        onResetSampleData={handleResetSampleData}
        theme={theme}
        onToggleTheme={toggleTheme}
        showVoiceBanner={showVoiceBanner}
        onToggleVoiceBanner={handleToggleVoiceBanner}
        isNativeEngine={isNativeEngine}
        onToggleNativeEngine={handleToggleNativeEngine}
      />

      {/* Main Content Area */}
      {isNativeEngine ? (
        <ReactNativeApp onSwitchMode={handleToggleNativeEngine} />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Overview Dashboard */}
        {activeTab === 'overview' && (
          <DashboardOverview
            expenses={expenses}
            budgets={budgets}
            subscriptions={subscriptions}
            wallets={wallets}
            currency={currency}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNaturalLog={() => setIsNaturalLogOpen(true)}
            onOpenManualAdd={() => {
              setExpenseToEdit(null);
              setQuickAddDate(undefined);
              setIsExpenseFormOpen(true);
            }}
            onOpenWallets={() => setIsWalletsModalOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onSelectExpense={(exp) => setSelectedExpenseForReceipt(exp)}
            onNavigateTab={setActiveTab}
            insights={insights}
            theme={theme}
            showVoiceBanner={showVoiceBanner}
            onDismissVoiceBanner={handleDismissVoiceBanner}
          />
        )}

        {/* 2. Transactions & Ledger */}
        {activeTab === 'expenses' && (
          <ExpensesList
            expenses={expenses}
            wallets={wallets}
            currency={currency}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenManualAdd={() => {
              setExpenseToEdit(null);
              setQuickAddDate(undefined);
              setIsExpenseFormOpen(true);
            }}
            onSelectExpense={(exp) => setSelectedExpenseForReceipt(exp)}
            onEditExpense={(exp) => {
              setExpenseToEdit(exp);
              setIsExpenseFormOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onDuplicateExpense={handleDuplicateExpense}
            onImportExpenses={handleImportExpenses}
            theme={theme}
          />
        )}

        {/* 3. Subscriptions & Recurring Hub */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsManager
            subscriptions={subscriptions}
            wallets={wallets}
            currency={currency}
            theme={theme}
            onAddSubscription={handleAddSubscription}
            onUpdateSubscription={handleUpdateSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onLogRenewalExpense={handleLogRenewalExpense}
          />
        )}

        {/* 4. Payment & Cash Flow Calendar */}
        {activeTab === 'calendar' && (
          <PaymentCalendar
            expenses={expenses}
            subscriptions={subscriptions}
            currency={currency}
            theme={theme}
            onSelectExpense={(exp) => setSelectedExpenseForReceipt(exp)}
            onQuickAddExpenseForDate={(date) => {
              setExpenseToEdit(null);
              setQuickAddDate(date);
              setIsExpenseFormOpen(true);
            }}
          />
        )}

        {/* 5. Budgets, 50/30/20 Rule & Targets */}
        {activeTab === 'budgets' && (
          <BudgetsManager
            budgets={budgets}
            expenses={expenses}
            subscriptions={subscriptions}
            wallets={wallets}
            financialGoals={financialGoals}
            currency={currency}
            onUpdateBudgets={setBudgets}
            onUpdateFinancialGoals={setFinancialGoals}
            onAddGoal={handleAddGoal}
            onAddManualExpense={() => {
              setExpenseToEdit(null);
              setQuickAddDate(undefined);
              setIsExpenseFormOpen(true);
            }}
            theme={theme}
          />
        )}

        {/* 6. Qalta AI Financial Advisor */}
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
      )}

      {/* Qalta Floating iOS Action Dock */}
      {!isNativeEngine && (
        <QaltaFloatingDock
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenNaturalLog={() => setIsNaturalLogOpen(true)}
          onOpenManualAdd={() => {
            setExpenseToEdit(null);
            setQuickAddDate(undefined);
            setIsExpenseFormOpen(true);
          }}
          onOpenWallets={() => setIsWalletsModalOpen(true)}
          theme={theme}
        />
      )}

      {/* MODALS */}
      {!isNativeEngine && (
        <>
          {/* 1. Qalta AI Voice Modal */}
          <QaltaVoiceModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            onSaveExpense={handleSaveNewExpense}
            preferredCurrency={currency}
            wallets={wallets}
            theme={theme}
          />

          {/* 2. OCR Camera Receipt Scanner */}
          <ReceiptScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onSaveExpense={handleSaveNewExpense}
            preferredCurrency={currency}
            theme={theme}
          />

          {/* 3. Natural Language AI logger */}
          <NaturalLoggerModal
            isOpen={isNaturalLogOpen}
            onClose={() => setIsNaturalLogOpen(false)}
            onSaveExpense={handleSaveNewExpense}
            preferredCurrency={currency}
            theme={theme}
          />

          {/* 4. Manual Add & Edit Multi-Type Transaction Form */}
          <ExpenseFormModal
            isOpen={isExpenseFormOpen}
            onClose={() => {
              setIsExpenseFormOpen(false);
              setExpenseToEdit(null);
              setQuickAddDate(undefined);
            }}
            onSave={handleUpdateExpense}
            expenseToEdit={expenseToEdit}
            preferredCurrency={currency}
            wallets={wallets}
            initialDate={quickAddDate}
            theme={theme}
          />

          {/* 5. Receipt High-Res Inspector */}
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

          {/* 6. Multi-Wallet Manager Modal */}
          <WalletsManagerModal
            isOpen={isWalletsModalOpen}
            onClose={() => setIsWalletsModalOpen(false)}
            wallets={wallets}
            currency={currency}
            theme={theme}
            onAddWallet={handleAddWallet}
            onUpdateWallet={handleUpdateWallet}
            onDeleteWallet={handleDeleteWallet}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
          />

          {/* 7. Account-to-Account Transfer Modal */}
          <TransferModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            wallets={wallets}
            currency={currency}
            theme={theme}
            onExecuteTransfer={handleExecuteTransfer}
          />
        </>
      )}
    </div>
  );
}
