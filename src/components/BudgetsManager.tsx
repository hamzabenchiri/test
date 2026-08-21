import React, { useState } from 'react';
import {
  Wallet,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Check,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { AppTheme, CategoryBudget, Expense, ExpenseCategory } from '../types';
import { CATEGORY_CONFIG, formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  budgets: CategoryBudget[];
  expenses: Expense[];
  currency: string;
  onUpdateBudgets: (updatedBudgets: CategoryBudget[]) => void;
  onAddManualExpense: () => void;
  theme?: AppTheme;
}

export const BudgetsManager: React.FC<Props> = ({
  budgets,
  expenses,
  currency,
  onUpdateBudgets,
  onAddManualExpense,
  theme = 'dark',
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);

  // Current month calculation
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  // Compute spend per category
  const categorySpendMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Active subscriptions
  const subscriptionExpenses = expenses.filter((e) => e.isSubscription);
  const monthlySubTotal = subscriptionExpenses.reduce((sum, s) => {
    if (s.subscriptionFrequency === 'weekly') return sum + s.amount * 4.33;
    if (s.subscriptionFrequency === 'yearly') return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  const handleStartEdit = (budget: CategoryBudget) => {
    setEditingCategory(budget.category);
    setTempLimit(budget.limit);
  };

  const handleSaveEdit = (categoryName: ExpenseCategory) => {
    const updated = budgets.map((b) =>
      b.category === categoryName ? { ...b, limit: Math.max(0, tempLimit) } : b
    );
    onUpdateBudgets(updated);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-8 pb-12" id="budgets-manager-container">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold theme-text-main flex items-center gap-2">
          Budgets & Recurring Subscriptions
        </h2>
        <p className="text-xs theme-text-secondary">
          Set monthly category limits and monitor your ongoing subscription commitments.
        </p>
      </div>

      {/* Overall Budget Header Card */}
      <div className="p-6 rounded-2xl theme-bg-card theme-border border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs theme-text-muted font-medium">Total Monthly Budget Status</span>
            <div className="text-2xl font-bold theme-text-main font-mono mt-0.5">
              {formatCurrency(totalSpent, currency)}{' '}
              <span className="text-sm font-normal theme-text-muted">
                / {formatCurrency(totalBudget, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs theme-text-muted block">Remaining</span>
              <span
                className={`text-sm font-bold font-mono ${
                  totalBudget - totalSpent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {formatCurrency(Math.max(0, totalBudget - totalSpent), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3.5 theme-bg-subtle theme-border border rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPercent > 90
                ? 'bg-rose-500'
                : totalPercent > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, totalPercent)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold theme-text-main flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Category Spending Limits
          </h3>
          <span className="text-xs theme-text-muted">Click edit to modify limit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = categorySpendMap[budget.category] || 0;
            const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const isEditing = editingCategory === budget.category;
            const catConfig = CATEGORY_CONFIG[budget.category] || CATEGORY_CONFIG['Miscellaneous'];

            return (
              <div
                key={budget.category}
                className="p-4 rounded-2xl theme-bg-card theme-border border space-y-3 shadow-md hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${catConfig.color}15`,
                        borderColor: `${catConfig.color}30`,
                        color: catConfig.color,
                      }}
                    >
                      <CategoryIcon category={budget.category} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold theme-text-main">{budget.category}</h4>
                      <span className="text-[11px] theme-text-muted">
                        {percent > 100 ? (
                          <span className="text-rose-500 dark:text-rose-400 font-medium">Over budget!</span>
                        ) : (
                          `${percent.toFixed(0)}% used`
                        )}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(budget.category)}
                      className="p-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(budget)}
                      className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Amount vs Limit */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="font-mono text-sm font-bold theme-text-main">
                    {formatCurrency(spent, currency)}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs theme-text-muted">/ $</span>
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 theme-bg-subtle border border-emerald-500 rounded text-xs theme-text-main font-mono shadow-xs focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="text-xs theme-text-muted font-mono">
                      / {formatCurrency(budget.limit, currency)}
                    </span>
                  )}
                </div>

                {/* Meter */}
                <div className="w-full h-2 theme-bg-subtle theme-border border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percent > 100
                        ? 'bg-rose-500'
                        : percent > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriptions & Recurring Bills Section */}
      <div className="space-y-4 pt-4 border-t theme-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold theme-text-main flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Active Subscriptions & Recurring Bills
            </h3>
            <p className="text-xs theme-text-secondary">
              Total subscription commitment:{' '}
              <span className="text-purple-600 dark:text-purple-400 font-mono font-semibold">
                {formatCurrency(monthlySubTotal, currency)} / month
              </span>{' '}
              ({formatCurrency(monthlySubTotal * 12, currency)} / year)
            </p>
          </div>

          <button
            onClick={onAddManualExpense}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subscription
          </button>
        </div>

        {subscriptionExpenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionExpenses.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl theme-bg-card theme-border border flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold theme-text-main">{sub.merchant}</h4>
                      <span className="text-[10px] theme-text-muted capitalize">
                        {sub.subscriptionFrequency || 'monthly'} bill
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                    {formatCurrency(sub.amount, sub.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] theme-text-muted pt-2 border-t theme-border">
                  <span>Last charged: {formatDate(sub.date)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center theme-bg-card border border-dashed theme-border rounded-2xl">
            <p className="text-xs theme-text-muted">No active subscriptions registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

