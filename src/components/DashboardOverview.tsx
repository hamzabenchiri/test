import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Repeat,
  Sparkles,
  Camera,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  ShieldAlert,
  Calendar,
  Clock,
  Zap,
  Mic,
  Coins,
  Globe2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  AppTheme,
  CategoryBudget,
  Expense,
  ExpenseCategory,
  SpendingInsight,
  Subscription,
  WalletAccount,
} from '../types';
import {
  CATEGORY_CONFIG,
  calculateDailyAllowance,
  formatCurrency,
  formatDate,
  formatShortDate,
  getDaysUntilDate,
  getSubscriptionMonthlyCost,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  expenses: Expense[];
  budgets: CategoryBudget[];
  subscriptions?: Subscription[];
  wallets?: WalletAccount[];
  currency: string;
  onOpenVoice: () => void;
  onOpenScanner: () => void;
  onOpenNaturalLog: () => void;
  onOpenManualAdd?: () => void;
  onOpenWallets?: () => void;
  onOpenTransfer?: () => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigateTab: (
    tab: 'overview' | 'expenses' | 'budgets' | 'subscriptions' | 'calendar' | 'advisor'
  ) => void;
  insights: SpendingInsight[];
  theme?: AppTheme;
  showVoiceBanner?: boolean;
  onDismissVoiceBanner?: () => void;
}

export const DashboardOverview: React.FC<Props> = ({
  expenses,
  budgets,
  subscriptions = [],
  wallets = [],
  currency,
  onOpenVoice,
  onOpenScanner,
  onOpenNaturalLog,
  onOpenManualAdd,
  onOpenWallets,
  onOpenTransfer,
  onSelectExpense,
  onNavigateTab,
  insights,
  theme = 'dark',
  showVoiceBanner = true,
  onDismissVoiceBanner,
}) => {
  const isDark = theme === 'dark';

  // Current month calculation
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(
    (e) => (!e.type || e.type === 'expense') && e.date.startsWith(currentMonthStr)
  );
  const currentMonthIncome = expenses.filter(
    (e) => e.type === 'income' && e.date.startsWith(currentMonthStr)
  );

  const totalSpentThisMonth = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomeThisMonth = currentMonthIncome.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudgetLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalSpentThisMonth);
  const percentBudgetUsed =
    totalBudgetLimit > 0 ? Math.min(100, (totalSpentThisMonth / totalBudgetLimit) * 100) : 0;

  // Daily Allowance & Pace
  const dailyAllowanceData = calculateDailyAllowance(expenses, totalBudgetLimit);

  // Subscriptions & Alerts
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlySubscriptionTotal = activeSubs.reduce(
    (acc, curr) => acc + getSubscriptionMonthlyCost(curr),
    0
  );

  const urgentRenewals = activeSubs.filter((s) => {
    const days = getDaysUntilDate(
      s.isFreeTrial && s.freeTrialEndDate ? s.freeTrialEndDate : s.nextBillingDate
    );
    return days >= 0 && days <= (s.reminderDaysBefore || 3);
  });

  // Multi-Currency & Net Worth
  const totalAssets = wallets
    .filter((w) => w.type !== 'credit')
    .reduce((sum, w) => sum + Math.max(0, w.balance), 0);

  const totalLiabilities = wallets
    .filter((w) => w.type === 'credit')
    .reduce((sum, w) => sum + Math.abs(Math.min(0, w.balance)), 0);

  const netWorth = totalAssets - totalLiabilities;

  // Category breakdown for Recharts Pie
  const categorySpendingMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpendingMap[e.category] = (categorySpendingMap[e.category] || 0) + e.amount;
  });

  const categoryChartData = Object.entries(categorySpendingMap)
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      color: CATEGORY_CONFIG[name as ExpenseCategory]?.color || '#D2AF26',
    }))
    .sort((a, b) => b.value - a.value);

  // Timeline spending for last 10 days
  const last10DaysData = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
    const daySpend = expenses
      .filter((e) => (!e.type || e.type === 'expense') && e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      date: dateStr,
      day: dayLabel,
      amount: daySpend,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in" id="spense-dashboard-overview-container">
      {/* Spense Signature Voice AI Luxury Banner (Dismissible & Remembered) */}
      {showVoiceBanner && (
        <div
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-[#141417] border border-stone-800/80 text-white shadow-xl shadow-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          id="spense-voice-ai-hero-banner"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#D2AF26]/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-48 h-48 rounded-full bg-[#D2AF26]/5 blur-3xl pointer-events-none" />

          {/* Dismiss / Remove Button */}
          {onDismissVoiceBanner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismissVoiceBanner();
              }}
              className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700/60 text-[11px] font-medium transition-all backdrop-blur-sm cursor-pointer shadow-xs group"
              title="Don't show again (Can be re-enabled in Settings)"
              id="dismiss-voice-banner-btn"
            >
              <span className="hidden sm:inline text-[10px] text-stone-400 group-hover:text-stone-200">
                Don't show again
              </span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative z-10 flex items-center gap-4">
            {/* Pulsating Voice Orb Button */}
            <button
              onClick={onOpenVoice}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-300 dark:from-stone-800 dark:to-stone-900 p-[1px] shadow-lg shadow-black/30 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Tap to speak your expense"
              id="hero-voice-trigger-btn"
            >
              <div className="w-full h-full bg-[#1c1c20] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <Mic className="w-6 h-6 text-[#D2AF26] group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[#D2AF26]/15 animate-ping rounded-full" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#D2AF26] bg-[#D2AF26]/15 px-2 py-0.5 rounded-md border border-[#D2AF26]/25 font-sans">
                  Spense Voice AI
                </span>
                <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                  Instant Speech-to-Ledger Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-100 mt-1 tracking-tight font-brand-serif">
                "Spent $18.50 on lunch with Apple Pay"
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Speak or snap receipts — AI structures merchant, price, category, and wallet automatically.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={onOpenVoice}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 font-bold text-xs shadow-lg shadow-[#D2AF26]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              id="hero-voice-action-btn"
            >
              <Mic className="w-4 h-4 text-stone-950" />
              <span>Speak Now</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-200 font-semibold text-xs backdrop-blur-md transition-all cursor-pointer"
              id="hero-scan-action-btn"
            >
              <Camera className="w-4 h-4 text-[#D2AF26]" />
              <span>Scan Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Proactive Alert Banner (if renewals/free trials ending) */}
      {urgentRenewals.length > 0 && (
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="p-4 rounded-2xl bg-[#D2AF26]/10 border border-[#D2AF26]/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#D2AF26]/15 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D2AF26]/20 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#a38514] dark:text-[#D2AF26]">
                {urgentRenewals.length === 1
                  ? `Upcoming Subscription: ${urgentRenewals[0].name}`
                  : `${urgentRenewals.length} Subscriptions Due for Renewal`}
              </div>
              <p className="text-[11px] theme-text-secondary">
                {urgentRenewals[0].isFreeTrial
                  ? `Trial ending soon (${formatShortDate(urgentRenewals[0].freeTrialEndDate || '')}) — review to avoid charges.`
                  : `Next billing date is approaching (${formatShortDate(urgentRenewals[0].nextBillingDate)}).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#a38514] dark:text-[#D2AF26] shrink-0">
            <span>Manage</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Top Header Row */}
      <div>
        <h1 className="text-2xl font-bold theme-text-main tracking-tight font-brand-serif">
          Financial Overview
        </h1>
        <p className="text-xs theme-text-secondary mt-0.5">
          Real-time daily allowance, net worth aggregate, and subscription timeline
        </p>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Allowance / Left-to-Spend */}
        <div
          onClick={() => onNavigateTab('budgets')}
          className="theme-bg-card p-5 rounded-3xl theme-border border relative overflow-hidden shadow-xs hover:border-[#D2AF26]/50 transition-all cursor-pointer group"
          id="kelo-daily-allowance-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-secondary">Daily Allowance</span>
            <div className="w-8 h-8 rounded-2xl bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(dailyAllowanceData.dailyAllowanceRemaining, currency)}
            <span className="text-xs font-sans font-normal theme-text-muted"> /day</span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span
              className={`font-bold capitalize ${
                dailyAllowanceData.paceStatus === 'ahead'
                  ? 'text-[#a38514] dark:text-[#D2AF26]'
                  : dailyAllowanceData.paceStatus === 'on_track'
                  ? 'text-stone-600 dark:text-stone-300'
                  : 'text-rose-500'
              }`}
            >
              ● {dailyAllowanceData.paceStatus.replace('_', ' ')}
            </span>
            <span className="theme-text-muted">• {dailyAllowanceData.daysRemainingInMonth}d left</span>
          </div>
        </div>

        {/* 2. Monthly Outflow / Budget */}
        <div
          onClick={() => onNavigateTab('budgets')}
          className="theme-bg-card p-5 rounded-3xl theme-border border relative overflow-hidden shadow-xs hover:border-[#D2AF26]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-secondary">Month Outflow</span>
            <div className="w-8 h-8 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(totalSpentThisMonth, currency)}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>{percentBudgetUsed.toFixed(0)}% of monthly target</span>
          </div>
        </div>

        {/* 3. Subscriptions Recurring Commitments */}
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="theme-bg-card p-5 rounded-3xl theme-border border relative overflow-hidden shadow-xs hover:border-[#D2AF26]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-secondary">Subscriptions</span>
            <div className="w-8 h-8 rounded-2xl bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(monthlySubscriptionTotal, currency)}
            <span className="text-xs font-sans font-normal theme-text-muted"> /mo</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>{activeSubs.length} active recurring plans</span>
          </div>
        </div>

        {/* 4. Total Multi-Currency Net Worth */}
        <div
          onClick={onOpenWallets}
          className="theme-bg-card p-5 rounded-3xl theme-border border relative overflow-hidden shadow-xs hover:border-[#D2AF26]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-secondary">Net Worth (Liquid)</span>
            <div className="w-8 h-8 rounded-2xl bg-stone-500/10 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(netWorth, currency)}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>{wallets.length} connected accounts</span>
          </div>
        </div>
      </div>

      {/* Multi-Currency Wallets Quick Bar */}
      {wallets.length > 0 && (
        <div className="theme-bg-card p-4 sm:p-5 rounded-3xl theme-border border shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#D2AF26]" />
              <span className="text-xs font-bold theme-text-main">Multi-Currency Accounts</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenTransfer && (
                <button
                  onClick={onOpenTransfer}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#a38514] dark:text-[#D2AF26] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Transfer</span>
                </button>
              )}
              {onOpenWallets && (
                <button
                  onClick={onOpenWallets}
                  className="text-[11px] font-bold theme-text-secondary hover:theme-text-main transition-colors cursor-pointer"
                >
                  Manage Wallets →
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {wallets.map((w) => (
              <div
                key={w.id}
                onClick={onOpenWallets}
                className="p-3.5 rounded-2xl theme-bg-subtle theme-border border hover:theme-bg-muted transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold theme-text-secondary truncate">{w.name}</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: w.color || '#D2AF26' }}
                  />
                </div>
                <div
                  className={`text-xs sm:text-sm font-mono font-bold mt-1.5 ${
                    w.type === 'credit' && w.balance < 0 ? 'text-rose-500' : 'theme-text-main'
                  }`}
                >
                  {formatCurrency(w.balance, w.currency || currency)}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold theme-text-muted mt-0.5 block">
                  {w.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics & Recent Ledger Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outflow Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 theme-bg-card rounded-3xl p-5 shadow-xs theme-border border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D2AF26]" />
              <h3 className="text-sm font-bold theme-text-main font-brand-serif">Daily Outflow Trend</h3>
            </div>
            <span className="text-xs theme-text-muted font-sans">Last 10 Days</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last10DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#78716c' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#78716c' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="theme-bg-card theme-border border p-2.5 rounded-2xl shadow-xl text-xs font-mono">
                          <div className="font-bold theme-text-main">{data.day}</div>
                          <div className="text-[#a38514] dark:text-[#D2AF26] font-bold mt-1">
                            {formatCurrency(data.amount, currency)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="#D2AF26" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="theme-bg-card rounded-3xl p-5 shadow-xs theme-border border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#D2AF26]" />
                <h3 className="text-sm font-bold theme-text-main font-brand-serif">Category Breakdown</h3>
              </div>
              <span className="text-xs theme-text-muted font-sans">This Month</span>
            </div>

            <div className="h-44 w-full relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="theme-bg-card theme-border border p-2.5 rounded-2xl shadow-xl text-xs font-mono">
                            <div className="font-bold theme-text-main">{item.name}</div>
                            <div className="text-[#a38514] dark:text-[#D2AF26] font-bold mt-0.5">
                              {formatCurrency(Number(item.value), currency)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-none">
            {categoryChartData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="theme-text-secondary truncate">{c.name}</span>
                </div>
                <span className="font-mono font-semibold theme-text-main">
                  {formatCurrency(c.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ledger Stream */}
      <div className="theme-bg-card rounded-3xl p-5 shadow-xs theme-border border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold theme-text-main font-brand-serif">Recent Activity & Ledger</h3>
            <p className="text-xs theme-text-secondary">Latest transactions across all accounts</p>
          </div>

          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-bold text-[#a38514] dark:text-[#D2AF26] hover:underline cursor-pointer"
          >
            View Full Ledger →
          </button>
        </div>

        <div className="divide-y theme-border overflow-hidden">
          {expenses.slice(0, 6).map((exp) => {
            const isIncome = exp.type === 'income';
            const isTransfer = exp.type === 'transfer';
            const wallet = wallets.find((w) => w.id === exp.walletAccountId);

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="py-3 flex items-center justify-between gap-3 hover:theme-bg-subtle transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isIncome ? (
                    <div className="w-9 h-9 rounded-2xl bg-[#D2AF26]/10 border border-[#D2AF26]/20 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                  ) : isTransfer ? (
                    <div className="w-9 h-9 rounded-2xl bg-stone-500/10 border border-stone-500/20 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                  ) : (
                    <CategoryIcon category={exp.category} size="md" />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold theme-text-main truncate group-hover:text-[#a38514] dark:group-hover:text-[#D2AF26] transition-colors">
                        {exp.merchant}
                      </span>
                      {exp.receiptImage && (
                        <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] rounded">
                          Receipt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] theme-text-muted mt-0.5">
                      <span>{formatDate(exp.date)}</span>
                      <span>•</span>
                      <span>{exp.category}</span>
                      {wallet && (
                        <>
                          <span>•</span>
                          <span>{wallet.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-mono font-bold ${
                      isIncome
                        ? 'text-[#a38514] dark:text-[#D2AF26]'
                        : isTransfer
                        ? 'text-stone-500'
                        : 'theme-text-main'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '↔' : '-'}
                    {formatCurrency(exp.amount, exp.currency || currency)}
                  </div>
                  <span className="text-[10px] theme-text-muted">{exp.paymentMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
