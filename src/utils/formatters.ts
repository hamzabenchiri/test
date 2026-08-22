import {
  AppTheme,
  BillingCycle,
  CategoryBudget,
  Expense,
  ExpenseCategory,
  FinancialGoal,
  PaymentMethod,
  Subscription,
  WalletAccount,
} from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'AU$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
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

  let formattedNumber = options?.hideCents
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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    icon: string;
    color: string;
    bg: string;
    text: string;
    border: string;
    group: 'Needs' | 'Wants' | 'Savings';
  }
> = {
  'Food & Dining': {
    icon: 'Utensils',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    group: 'Wants',
  },
  Groceries: {
    icon: 'ShoppingBag',
    color: '#D2AF26',
    bg: 'bg-[#D2AF26]/10',
    text: 'text-[#9a7d13] dark:text-[#D2AF26]',
    border: 'border-[#D2AF26]/20',
    group: 'Needs',
  },
  Shopping: {
    icon: 'ShoppingBag',
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
    group: 'Wants',
  },
  Transportation: {
    icon: 'Car',
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    group: 'Needs',
  },
  'Housing & Utilities': {
    icon: 'Home',
    color: '#6366f1',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    group: 'Needs',
  },
  Entertainment: {
    icon: 'Film',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    group: 'Wants',
  },
  'Health & Fitness': {
    icon: 'HeartPulse',
    color: '#14b8a6',
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
    group: 'Needs',
  },
  Travel: {
    icon: 'Plane',
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    group: 'Wants',
  },
  Subscriptions: {
    icon: 'Repeat',
    color: '#D2AF26',
    bg: 'bg-[#D2AF26]/10',
    text: 'text-[#9a7d13] dark:text-[#D2AF26]',
    border: 'border-[#D2AF26]/20',
    group: 'Wants',
  },
  Technology: {
    icon: 'Laptop',
    color: '#64748b',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    group: 'Wants',
  },
  Education: {
    icon: 'GraduationCap',
    color: '#38bdf8',
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
    group: 'Needs',
  },
  'Personal Care': {
    icon: 'Sparkles',
    color: '#f43f5e',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    group: 'Wants',
  },
  'Salary & Income': {
    icon: 'TrendingUp',
    color: '#D2AF26',
    bg: 'bg-[#D2AF26]/10',
    text: 'text-[#9a7d13] dark:text-[#D2AF26]',
    border: 'border-[#D2AF26]/20',
    group: 'Savings',
  },
  Investment: {
    icon: 'LineChart',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    group: 'Savings',
  },
  Miscellaneous: {
    icon: 'MoreHorizontal',
    color: '#94a3b8',
    bg: 'bg-slate-500/10',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-500/20',
    group: 'Wants',
  },
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

// Subscriptions calculations (Subo style)
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
      return sub.customIntervalDays ? (sub.amount / sub.customIntervalDays) * 30.4 : sub.amount;
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
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Daily Allowance / Left-to-spend calculation (Kelo style)
export function calculateDailyAllowance(
  expenses: Expense[],
  totalBudgetLimit: number
): {
  dailyAllowanceRemaining: number;
  dailyRemaining: number;
  daysRemainingInMonth: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  currentDay: number;
  totalSpentThisMonth: number;
  remainingBudget: number;
  paceStatus: 'ahead' | 'on_track' | 'warning' | 'critical';
} {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses.filter(
    (e) => (!e.type || e.type === 'expense') && e.date.startsWith(currentMonthStr)
  );
  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - currentDay + 1);

  const remainingBudget = Math.max(0, totalBudgetLimit - totalSpentThisMonth);
  const dailyAllowanceRemaining =
    totalBudgetLimit > 0 ? remainingBudget / daysRemainingInMonth : 0;

  const expectedSpendRatio = currentDay / totalDaysInMonth;
  const actualSpendRatio = totalBudgetLimit > 0 ? totalSpentThisMonth / totalBudgetLimit : 0;

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

// 50/30/20 Rule breakdown (Kelo & Fineyo style)
export function calculate503020Rule(
  expenses: Expense[],
  totalIncome: number
): {
  needsSpent: number;
  needsTarget: number;
  needsActualPercent: number;
  wantsSpent: number;
  wantsTarget: number;
  wantsActualPercent: number;
  savingsSpent: number;
  savingsTarget: number;
  savingsActualPercent: number;
} {
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

// Export CSV string (Fineyo style)
export function exportExpensesToCSV(expenses: Expense[], currency = 'USD'): string {
  const headers = [
    'ID',
    'Type',
    'Date',
    'Time',
    'Merchant/Payee',
    'Category',
    'Amount',
    'Currency',
    'Payment Method',
    'Wallet Account',
    'Notes',
    'Tags',
  ];

  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.type || 'expense'}"`,
    `"${e.date}"`,
    `"${e.time || ''}"`,
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    `"${e.category}"`,
    e.amount.toFixed(2),
    `"${e.currency || currency}"`,
    `"${e.paymentMethod}"`,
    `"${e.walletAccountId || ''}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    `"${(e.tags || []).join(';')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Download CSV helper
export function triggerCSVDownload(content: string, filename = 'spense_expenses.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
