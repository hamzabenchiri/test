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
  Target,
  ShieldCheck,
  Plane,
  Laptop,
  Percent,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import {
  AppTheme,
  CategoryBudget,
  Expense,
  ExpenseCategory,
  FinancialGoal,
  Subscription,
  WalletAccount,
} from '../types';
import {
  CATEGORY_CONFIG,
  calculate503020Rule,
  formatCurrency,
  formatDate,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  budgets: CategoryBudget[];
  expenses: Expense[];
  subscriptions?: Subscription[];
  wallets?: WalletAccount[];
  financialGoals?: FinancialGoal[];
  currency: string;
  onUpdateBudgets: (updatedBudgets: CategoryBudget[]) => void;
  onUpdateFinancialGoals?: (goals: FinancialGoal[]) => void;
  onAddGoal?: (goal: Omit<FinancialGoal, 'id'>) => void;
  onAddManualExpense?: () => void;
  theme?: AppTheme;
}

export const BudgetsManager: React.FC<Props> = ({
  budgets,
  expenses,
  subscriptions = [],
  wallets = [],
  financialGoals = [],
  currency,
  onUpdateBudgets,
  onUpdateFinancialGoals,
  onAddGoal,
  onAddManualExpense,
  theme = 'dark',
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // New Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState<number | ''>('');
  const [goalCurrent, setGoalCurrent] = useState<number | ''>('');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-12-31');
  const [goalCategory, setGoalCategory] = useState('Savings');

  // Current month calculation
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(
    (e) => (!e.type || e.type === 'expense') && e.date.startsWith(currentMonthStr)
  );
  const currentMonthIncome = expenses.filter(
    (e) => e.type === 'income' && e.date.startsWith(currentMonthStr)
  );

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = currentMonthIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Compute spend per category
  const categorySpendMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
  });

  // 50/30/20 Rule Breakdown
  const ruleBreakdown = calculate503020Rule(expenses, totalIncome > 0 ? totalIncome : 5000);

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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || goalTarget === '' || Number(goalTarget) <= 0) return;

    if (onAddGoal) {
      onAddGoal({
        title: goalTitle.trim(),
        targetAmount: Number(goalTarget),
        currentAmount: Number(goalCurrent) || 0,
        currency,
        targetDate: goalTargetDate,
        category: goalCategory,
        color: '#D2AF26',
      });
    }

    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('');
    setIsGoalModalOpen(false);
  };

  const handleContributeToGoal = (goalId: string, delta: number) => {
    if (!onUpdateFinancialGoals) return;
    const updated = financialGoals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount + delta) } : g
    );
    onUpdateFinancialGoals(updated);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="budgets-manager-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text-main tracking-tight flex items-center gap-2.5 font-brand-serif">
            <Target className="w-6 h-6 text-[#D2AF26]" />
            Budgets & Financial Targets
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            50/30/20 rule allocation, category spending limits, and long-term savings goals
          </p>
        </div>

        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-bold shadow-lg shadow-[#D2AF26]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="p-6 rounded-2xl theme-bg-card theme-border border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs theme-text-muted font-medium uppercase tracking-wider">
              Monthly Budget Consumption
            </span>
            <div className="text-2xl font-bold theme-text-main font-mono mt-1">
              {formatCurrency(totalSpent, currency)}{' '}
              <span className="text-sm font-normal theme-text-muted">
                / {formatCurrency(totalBudget, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                totalPercent > 100
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  : totalPercent > 80
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] border border-[#D2AF26]/30'
              }`}
            >
              {totalPercent > 100 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                {totalPercent > 100
                  ? `${(totalPercent - 100).toFixed(1)}% Over Limit`
                  : `${(100 - totalPercent).toFixed(1)}% Remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full theme-bg-subtle overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalPercent > 100 ? 'bg-rose-500' : totalPercent > 80 ? 'bg-amber-500' : 'bg-[#D2AF26]'
              }`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] theme-text-muted">
            <span>0%</span>
            <span>50%</span>
            <span>100% Limit</span>
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule Allocation Card */}
      <div className="theme-card p-6 rounded-2xl theme-border border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#D2AF26]" />
            <h3 className="text-base font-bold theme-text-main font-brand-serif">
              50 / 30 / 20 Financial Rule Health
            </h3>
          </div>
          <span className="text-xs theme-text-muted">
            Income Basis:{' '}
            <strong className="theme-text-main font-mono">
              {formatCurrency(totalIncome > 0 ? totalIncome : 5000, currency)}
            </strong>
          </span>
        </div>

        <p className="text-xs theme-text-secondary">
          Allocates 50% of income to essential Needs, 30% to Lifestyle & Wants, and
          20% toward Savings & Debt paydown.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Needs 50% */}
          <div className="p-4 rounded-xl theme-bg-subtle theme-border border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold theme-text-main flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                Needs (50% Target)
              </span>
              <span className="font-mono font-bold theme-text-main">
                {ruleBreakdown.needsActualPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono theme-text-main">
              {formatCurrency(ruleBreakdown.needsSpent, currency)}
            </div>
            <div className="w-full h-2 rounded-full theme-bg-card overflow-hidden">
              <div
                className="h-full bg-stone-400 rounded-full transition-all"
                style={{ width: `${Math.min(ruleBreakdown.needsActualPercent * 2, 100)}%` }}
              />
            </div>
            <span className="text-[10px] theme-text-muted block">
              Groceries, Housing, Commute, Utilities
            </span>
          </div>

          {/* Wants 30% */}
          <div className="p-4 rounded-xl theme-bg-subtle theme-border border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold theme-text-main flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                Wants (30% Target)
              </span>
              <span className="font-mono font-bold theme-text-main">
                {ruleBreakdown.wantsActualPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono theme-text-main">
              {formatCurrency(ruleBreakdown.wantsSpent, currency)}
            </div>
            <div className="w-full h-2 rounded-full theme-bg-card overflow-hidden">
              <div
                className="h-full bg-stone-500 rounded-full transition-all"
                style={{ width: `${Math.min(ruleBreakdown.wantsActualPercent * 3.33, 100)}%` }}
              />
            </div>
            <span className="text-[10px] theme-text-muted block">
              Dining, Entertainment, Shopping, Streaming
            </span>
          </div>

          {/* Savings 20% */}
          <div className="p-4 rounded-xl theme-bg-subtle theme-border border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold theme-text-main flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D2AF26]" />
                Savings / Retained (20%)
              </span>
              <span className="font-mono font-bold theme-text-main">
                {ruleBreakdown.savingsActualPercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-[#a38514] dark:text-[#D2AF26]">
              {formatCurrency(ruleBreakdown.savingsSpent, currency)}
            </div>
            <div className="w-full h-2 rounded-full theme-bg-card overflow-hidden">
              <div
                className="h-full bg-[#D2AF26] rounded-full transition-all"
                style={{ width: `${Math.min(ruleBreakdown.savingsActualPercent * 5, 100)}%` }}
              />
            </div>
            <span className="text-[10px] theme-text-muted block">
              Investments, Emergency Funds, Goal Reserves
            </span>
          </div>
        </div>
      </div>

      {/* Savings & Financial Goals Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold theme-text-main flex items-center gap-2 font-brand-serif">
              <ShieldCheck className="w-5 h-5 text-[#D2AF26]" />
              Savings & Financial Goals ({financialGoals.length})
            </h3>
            <p className="text-xs theme-text-secondary">
              Track targets for emergency funds, travel, and major asset purchases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financialGoals.map((goal) => {
            const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            return (
              <div
                key={goal.id}
                className="theme-card p-5 rounded-2xl theme-border border shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold theme-text-main">{goal.title}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26]">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-[#a38514] dark:text-[#D2AF26]">
                      {formatCurrency(goal.currentAmount, goal.currency || currency)}
                    </span>
                    <span className="text-xs theme-text-muted">
                      / {formatCurrency(goal.targetAmount, goal.currency || currency)}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full theme-bg-subtle overflow-hidden mt-2">
                    <div
                      className="h-full bg-[#D2AF26] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {goal.targetDate && (
                    <span className="text-[10px] theme-text-muted block mt-2">
                      Target deadline: {formatDate(goal.targetDate)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t theme-border">
                  <button
                    onClick={() => handleContributeToGoal(goal.id, 100)}
                    className="flex-1 py-1.5 rounded-lg bg-[#D2AF26]/10 hover:bg-[#D2AF26]/20 border border-[#D2AF26]/30 text-[#a38514] dark:text-[#D2AF26] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    + $100
                  </button>
                  <button
                    onClick={() => handleContributeToGoal(goal.id, 500)}
                    className="flex-1 py-1.5 rounded-lg bg-[#D2AF26]/10 hover:bg-[#D2AF26]/20 border border-[#D2AF26]/30 text-[#a38514] dark:text-[#D2AF26] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    + $500
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold theme-text-main font-brand-serif">Category Limits</h3>
            <p className="text-xs theme-text-secondary">
              Click the pencil to adjust individual monthly spending envelopes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = categorySpendMap[b.category] || 0;
            const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            const isOver = spent > b.limit;
            const isEditing = editingCategory === b.category;

            return (
              <div
                key={b.category}
                className="theme-card p-4 rounded-2xl theme-border border shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon category={b.category} size="md" />
                    <div>
                      <h4 className="text-xs font-bold theme-text-main">{b.category}</h4>
                      <span className="text-[10px] theme-text-muted capitalize">{b.period} limit</span>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="p-1 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
                      title="Edit Category Budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress Bar & Numbers */}
                {isEditing ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg theme-bg-subtle theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-[#D2AF26]"
                    />
                    <button
                      onClick={() => handleSaveEdit(b.category)}
                      className="p-1.5 bg-[#D2AF26] text-stone-950 rounded-lg hover:bg-[#c29f1e] font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-baseline font-mono text-xs mb-1.5">
                      <span className={`font-bold ${isOver ? 'text-rose-500' : 'theme-text-main'}`}>
                        {formatCurrency(spent, currency)}
                      </span>
                      <span className="theme-text-muted">/ {formatCurrency(b.limit, currency)}</span>
                    </div>

                    <div className="w-full h-2 rounded-full theme-bg-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-[#D2AF26]'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] theme-text-muted mt-1.5">
                      <span>{pct.toFixed(0)}% used</span>
                      <span className={isOver ? 'text-rose-500 font-semibold' : ''}>
                        {isOver
                          ? `Over by ${formatCurrency(spent - b.limit, currency)}`
                          : `${formatCurrency(b.limit - spent, currency)} left`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
              <h3 className="text-base font-bold theme-text-main flex items-center gap-2 font-brand-serif">
                <Target className="w-5 h-5 text-[#D2AF26]" />
                Add Savings Goal
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-xs theme-text-muted hover:theme-text-main"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Reserve, Japan Trip"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-[#D2AF26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Target Amount *</label>
                  <input
                    type="number"
                    step="50"
                    min="1"
                    required
                    placeholder="5000"
                    value={goalTarget}
                    onChange={(e) =>
                      setGoalTarget(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-[#D2AF26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Current Saved</label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    placeholder="0"
                    value={goalCurrent}
                    onChange={(e) =>
                      setGoalCurrent(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-[#D2AF26]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Target Date</label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-[#D2AF26] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs theme-text-secondary hover:theme-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
