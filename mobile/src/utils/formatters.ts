import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  Subscription,
} from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  JPY: '\u00A5',
  CAD: 'CA$',
  AUD: 'AU$',
  CHF: 'CHF',
  CNY: '\u00A5',
  INR: '\u20B9',
  BRL: 'R$',
  SGD: 'SG$',
};

export function formatCurrency(
  amount: number,
  currencyCode = 'USD',
  options?: { hideCents?: boolean }
): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formattedNumber = options?.hideCents
    ? Math.round(absAmount).toLocaleString('en-US')
    : absAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { icon: string; color: string; group: 'Needs' | 'Wants' | 'Savings' }
> = {
  'Food & Dining': { icon: 'Utensils', color: '#f97316', group: 'Wants' },
  Groceries: { icon: 'ShoppingBag', color: '#D2AF26', group: 'Needs' },
  Shopping: { icon: 'ShoppingBag', color: '#ec4899', group: 'Wants' },
  Transportation: { icon: 'Car', color: '#3b82f6', group: 'Needs' },
  'Housing & Utilities': { icon: 'Home', color: '#6366f1', group: 'Needs' },
  Entertainment: { icon: 'Film', color: '#8b5cf6', group: 'Wants' },
  'Health & Fitness': { icon: 'HeartPulse', color: '#14b8a6', group: 'Needs' },
  Travel: { icon: 'Plane', color: '#06b6d4', group: 'Wants' },
  Subscriptions: { icon: 'Repeat', color: '#D2AF26', group: 'Wants' },
  Technology: { icon: 'Laptop', color: '#64748b', group: 'Wants' },
  Education: { icon: 'GraduationCap', color: '#38bdf8', group: 'Needs' },
  'Personal Care': { icon: 'Sparkles', color: '#f43f5e', group: 'Wants' },
  'Salary & Income': { icon: 'TrendingUp', color: '#D2AF26', group: 'Savings' },
  Investment: { icon: 'LineChart', color: '#8b5cf6', group: 'Savings' },
  Miscellaneous: { icon: 'MoreHorizontal', color: '#94a3b8', group: 'Wants' },
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transportation',
  'Housing & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Travel',
  'Subscriptions',
  'Technology',
  'Education',
  'Personal Care',
  'Salary & Income',
  'Investment',
  'Miscellaneous',
];

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  'Apple Pay',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
  'Google Pay',
  'PayPal',
  'Other',
];

export function getSubscriptionMonthlyCost(sub: Subscription): number {
  if (sub.status === 'cancelled' || sub.status === 'paused') return 0;
  switch (sub.billingCycle) {
    case 'weekly':
      return sub.amount * 4.333;
    case 'monthly':
      return sub.amount;
    case 'quarterly':
      return sub.amount / 3;
    case 'yearly':
      return sub.amount / 12;
    case 'custom':
      return sub.customIntervalDays
        ? (sub.amount / sub.customIntervalDays) * 30.4
        : sub.amount;
    default:
      return sub.amount;
  }
}

export function getSubscriptionAnnualCost(sub: Subscription): number {
  return getSubscriptionMonthlyCost(sub) * 12;
}

export function getDaysUntilDate(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateDailyAllowance(
  expenses: Expense[],
  totalBudgetLimit: number
) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter(
    (e) => (!e.type || e.type === 'expense') && e.date.startsWith(currentMonthStr)
  );
  const totalSpentThisMonth = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - currentDay + 1);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalSpentThisMonth);
  const dailyAllowanceRemaining =
    totalBudgetLimit > 0 ? remainingBudget / daysRemainingInMonth : 0;
  const expectedSpendRatio = currentDay / totalDaysInMonth;
  const actualSpendRatio =
    totalBudgetLimit > 0 ? totalSpentThisMonth / totalBudgetLimit : 0;

  let paceStatus: 'ahead' | 'on_track' | 'warning' | 'critical' = 'on_track';
  if (actualSpendRatio > expectedSpendRatio * 1.25 || remainingBudget <= 0) {
    paceStatus = 'critical';
  } else if (actualSpendRatio > expectedSpendRatio * 1.05) {
    paceStatus = 'warning';
  } else if (actualSpendRatio < expectedSpendRatio * 0.85) {
    paceStatus = 'ahead';
  }

  return {
    dailyAllowanceRemaining,
    dailyRemaining: dailyAllowanceRemaining,
    daysRemainingInMonth,
    daysRemaining: daysRemainingInMonth,
    totalDaysInMonth,
    currentDay,
    totalSpentThisMonth,
    remainingBudget,
    paceStatus,
  };
}

export function calculate503020Rule(
  expenses: Expense[],
  totalIncome: number
) {
  let needsSpent = 0;
  let wantsSpent = 0;
  const expenseItems = expenses.filter((e) => !e.type || e.type === 'expense');
  for (const exp of expenseItems) {
    const config = CATEGORY_CONFIG[exp.category];
    if (config?.group === 'Needs') {
      needsSpent += exp.amount;
    } else {
      wantsSpent += exp.amount;
    }
  }
  const baseIncome = Math.max(totalIncome, needsSpent + wantsSpent, 100);
  const savingsSpent = Math.max(0, totalIncome - (needsSpent + wantsSpent));
  return {
    needsSpent,
    needsTarget: baseIncome * 0.5,
    needsActualPercent: (needsSpent / baseIncome) * 100,
    wantsSpent,
    wantsTarget: baseIncome * 0.3,
    wantsActualPercent: (wantsSpent / baseIncome) * 100,
    savingsSpent,
    savingsTarget: baseIncome * 0.2,
    savingsActualPercent: (savingsSpent / baseIncome) * 100,
  };
}

export const calculate503020Breakdown = calculate503020Rule;
