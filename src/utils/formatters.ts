import { Expense, ExpenseCategory, PaymentMethod } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  CHF: 'CHF',
  INR: '₹',
};

export function formatCurrency(amount: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { icon: string; color: string; bg: string; text: string; border: string }
> = {
  'Food & Dining': {
    icon: 'Utensils',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
  },
  Groceries: {
    icon: 'ShoppingBag',
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
  },
  Shopping: {
    icon: 'ShoppingBag',
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
  },
  Transportation: {
    icon: 'Car',
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  'Housing & Utilities': {
    icon: 'Home',
    color: '#6366f1',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
  },
  Entertainment: {
    icon: 'Film',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  'Health & Fitness': {
    icon: 'HeartPulse',
    color: '#14b8a6',
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
  },
  Travel: {
    icon: 'Plane',
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
  },
  Subscriptions: {
    icon: 'Repeat',
    color: '#eab308',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  Technology: {
    icon: 'Laptop',
    color: '#64748b',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
  Education: {
    icon: 'GraduationCap',
    color: '#38bdf8',
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
  },
  'Personal Care': {
    icon: 'Sparkles',
    color: '#f43f5e',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
  Miscellaneous: {
    icon: 'Tag',
    color: '#94a3b8',
    bg: 'bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500/20',
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
  'Miscellaneous',
];

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  'Apple Pay',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Google Pay',
  'Bank Transfer',
  'PayPal',
  'Other',
];

export function exportExpensesToCSV(expenses: Expense[]) {
  const headers = [
    'ID',
    'Merchant',
    'Amount',
    'Currency',
    'Category',
    'Date',
    'Time',
    'Payment Method',
    'Subtotal',
    'Tax',
    'Tip',
    'Is Subscription',
    'Notes',
    'Line Items Count',
  ];

  const rows = expenses.map((e) => [
    e.id,
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    e.amount,
    e.currency,
    `"${e.category}"`,
    e.date,
    e.time || '',
    `"${e.paymentMethod}"`,
    e.subtotal || '',
    e.tax || '',
    e.tip || '',
    e.isSubscription ? 'Yes' : 'No',
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    e.items?.length || 0,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `qalta_expenses_export_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
