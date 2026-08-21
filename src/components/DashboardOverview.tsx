import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Repeat,
  Sparkles,
  Camera,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
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
import { AppTheme, CategoryBudget, Expense, ExpenseCategory, SpendingInsight } from '../types';
import { CATEGORY_CONFIG, formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  expenses: Expense[];
  budgets: CategoryBudget[];
  currency: string;
  onOpenScanner: () => void;
  onOpenNaturalLog: () => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigateTab: (tab: 'overview' | 'expenses' | 'budgets' | 'advisor') => void;
  insights: SpendingInsight[];
  theme?: AppTheme;
}

export const DashboardOverview: React.FC<Props> = ({
  expenses,
  budgets,
  currency,
  onOpenScanner,
  onOpenNaturalLog,
  onSelectExpense,
  onNavigateTab,
  insights,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Current month calculation
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  const totalSpentThisMonth = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudgetLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalSpentThisMonth);
  const percentBudgetUsed =
    totalBudgetLimit > 0 ? Math.min(100, (totalSpentThisMonth / totalBudgetLimit) * 100) : 0;

  // Active subscriptions
  const subscriptionExpenses = expenses.filter((e) => e.isSubscription);
  const monthlySubscriptionTotal = subscriptionExpenses.reduce((acc, curr) => {
    if (curr.subscriptionFrequency === 'weekly') return acc + curr.amount * 4.33;
    if (curr.subscriptionFrequency === 'yearly') return acc + curr.amount / 12;
    return acc + curr.amount;
  }, 0);

  // Daily average calculation (days passed this month)
  const today = new Date();
  const daysPassed = Math.max(1, today.getDate());
  const dailyAverage = totalSpentThisMonth / daysPassed;

  // Category breakdown data for Recharts Pie
  const categorySpendingMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpendingMap[e.category] = (categorySpendingMap[e.category] || 0) + e.amount;
  });

  const categoryChartData = Object.entries(categorySpendingMap)
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      color: CATEGORY_CONFIG[name as ExpenseCategory]?.color || '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);

  // Daily timeline spending for last 14 days
  const last14DaysData = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    const dStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    const dayTotal = expenses
      .filter((e) => e.date === dStr)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      date: dayName,
      amount: Number(dayTotal.toFixed(2)),
    };
  });

  // Recent receipt images
  const receiptsWithImages = expenses.filter((e) => Boolean(e.receiptImage)).slice(0, 4);

  return (
    <div className="space-y-6 pb-12" id="dashboard-overview-container">
      {/* Top Banner: AI Overview & Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl theme-bg-card theme-border border p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qalta AI Financial Engine • Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold theme-text-main tracking-tight">
              Smart Expense Manager & Receipts
            </h1>
            <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
              Capture receipts with automated OCR, track category budgets, and let AI analyze your
              cashflow habits in real time.
            </p>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              id="dashboard-scan-receipt-btn"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Receipt</span>
            </button>

            <button
              onClick={onOpenNaturalLog}
              className="flex items-center gap-2 px-4 py-3 rounded-xl theme-bg-subtle hover:bg-slate-500/10 theme-border border theme-text-main text-xs sm:text-sm font-medium shadow-xs transition-all"
              id="dashboard-quick-log-btn"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Quick Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-muted">Total Spent This Month</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold theme-text-main font-mono">
              {formatCurrency(totalSpentThisMonth, currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs theme-text-muted">
              <span className="font-medium">
                {currentMonthExpenses.length} transactions
              </span>
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-muted">Remaining Budget</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(remainingBudget, currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs theme-text-muted">
              <span>{percentBudgetUsed.toFixed(0)}% of limit used</span>
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-muted">Daily Average Burn</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-amber-500 dark:text-amber-400 font-mono">
              {formatCurrency(dailyAverage, currency)}
              <span className="text-xs theme-text-muted font-normal"> /day</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs theme-text-muted">
              <span>Day {daysPassed} of month</span>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-muted">Recurring Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {formatCurrency(monthlySubscriptionTotal, currency)}
              <span className="text-xs theme-text-muted font-normal"> /mo</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs theme-text-muted">
              <span>{subscriptionExpenses.length} active bills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Bar */}
      <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold theme-text-main">Monthly Overall Budget</h3>
            <p className="text-xs theme-text-secondary">
              {formatCurrency(totalSpentThisMonth, currency)} spent of{' '}
              {formatCurrency(totalBudgetLimit, currency)} total limit
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('budgets')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
          >
            Manage Limits <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bar */}
        <div className="w-full h-3 theme-bg-subtle theme-border border rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentBudgetUsed > 90
                ? 'bg-rose-500'
                : percentBudgetUsed > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentBudgetUsed}%` }}
          />
        </div>
      </div>

      {/* Charts Section: Two Column (Category Donut & Daily Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Category Breakdown Donut */}
        <div className="lg:col-span-6 p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold theme-text-main flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Category Distribution
              </h3>
              <p className="text-xs theme-text-secondary">Spending by category this month</p>
            </div>
            <span className="text-xs font-mono theme-text-muted">
              {categoryChartData.length} categories
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), currency)}
                    contentStyle={{
                      backgroundColor: isDark ? '#141414' : '#ffffff',
                      borderColor: isDark ? '#262626' : '#d8d8d8',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: isDark ? '#f8fafc' : '#111827',
                      boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs theme-text-muted italic">No spending records yet</div>
            )}
          </div>

          {/* Top 4 Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t theme-border">
            {categoryChartData.slice(0, 4).map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="theme-text-secondary truncate">{c.name}</span>
                </div>
                <span className="font-mono theme-text-main font-medium">{formatCurrency(c.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: 10-Day Spending Timeline Bar Chart */}
        <div className="lg:col-span-6 p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold theme-text-main flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Recent Daily Activity
              </h3>
              <p className="text-xs theme-text-secondary">10-day spending timeline</p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Daily Outflow</span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262626' : '#e2e2e2'} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? '#737373' : '#6b7280'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#737373' : '#6b7280'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val), currency)}
                  contentStyle={{
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                    borderColor: isDark ? '#262626' : '#d8d8d8',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#111827',
                    boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t theme-border text-xs theme-text-secondary">
            <span>Burn trend: Stable</span>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
            >
              View Full Ledger <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Scanned Receipts Carousel / Gallery */}
      <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ReceiptIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold theme-text-main">Scanned Receipts Archive</h3>
              <p className="text-xs theme-text-secondary">Recent high-res receipts & itemized line logs</p>
            </div>
          </div>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
          >
            <Camera className="w-3.5 h-3.5" /> Scan New
          </button>
        </div>

        {receiptsWithImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {receiptsWithImages.map((expense) => (
              <div
                key={expense.id}
                onClick={() => onSelectExpense(expense)}
                className="group relative theme-bg-subtle hover:theme-bg-muted border theme-border hover:border-emerald-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-xs"
              >
                {/* Thumbnail Header Image */}
                <div className="h-32 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={expense.receiptImage}
                    alt={expense.merchant}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  {expense.receiptConfidence && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      {expense.receiptConfidence}% OCR
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs theme-text-main truncate max-w-[130px]">
                      {expense.merchant}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] theme-text-muted">
                    <span>{expense.category}</span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center theme-bg-subtle rounded-xl border border-dashed theme-border">
            <ReceiptIcon className="w-8 h-8 mx-auto theme-text-muted mb-2" />
            <p className="text-xs theme-text-secondary mb-3">No scanned receipts yet.</p>
            <button
              onClick={onOpenScanner}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-500/20"
            >
              Scan Your First Receipt
            </button>
          </div>
        )}
      </div>

      {/* AI Financial Insights Highlight Card */}
      {insights.length > 0 && (
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold theme-text-main">Qalta AI Financial Insights</h3>
            </div>
            <button
              onClick={() => onNavigateTab('advisor')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
            >
              Open AI Advisor <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                onClick={() => onNavigateTab('advisor')}
                className="p-3.5 rounded-xl theme-bg-subtle hover:theme-bg-muted border theme-border shadow-xs cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  {insight.type === 'alert' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : insight.type === 'celebration' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold theme-text-main truncate">
                    {insight.title}
                  </span>
                </div>
                <p className="text-[11px] theme-text-secondary line-clamp-2 leading-relaxed">
                  {insight.message}
                </p>
                {insight.actionable && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    Tip: {insight.actionable}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
