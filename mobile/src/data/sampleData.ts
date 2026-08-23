import {
  Expense,
  Subscription,
  WalletAccount,
  CategoryBudget,
  FinancialGoal,
} from '../types';

export const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_WALLETS: WalletAccount[] = [
  { id: '1', name: 'Chase Checking', type: 'checking', balance: 4850.25, currency: 'USD', color: '#6366f1', icon: 'Landmark', isDefault: true },
  { id: '2', name: 'Marcus Savings', type: 'savings', balance: 18450, currency: 'USD', color: '#8b5cf6', icon: 'PiggyBank' },
  { id: '3', name: 'Sapphire Reserve', type: 'credit', balance: -842.15, currency: 'USD', color: '#c4b5fd', icon: 'CreditCard', accountNumberMask: '****4821' },
  { id: '4', name: 'Physical Cash', type: 'cash', balance: 240, currency: 'USD', color: '#a78bfa', icon: 'Wallet' },
  { id: '5', name: 'Vanguard', type: 'investment', balance: 32600, currency: 'USD', color: '#22c55e', icon: 'TrendingUp' },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', amount: 22.99, currency: 'USD', category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-5), paymentMethod: 'Credit Card', walletAccountId: '3', status: 'active', isFreeTrial: false, reminderDaysBefore: 3, color: '#E50914', icon: 'Tv', createdAt: getRelativeDateStr(120) },
  { id: '2', name: 'Spotify', amount: 14.99, currency: 'USD', category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-12), paymentMethod: 'Credit Card', walletAccountId: '3', status: 'active', isFreeTrial: false, reminderDaysBefore: 3, color: '#1DB954', icon: 'Music', createdAt: getRelativeDateStr(200) },
  { id: '3', name: 'ChatGPT Plus', amount: 20, currency: 'USD', category: 'Subscriptions', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-8), paymentMethod: 'Credit Card', walletAccountId: '3', status: 'active', isFreeTrial: false, reminderDaysBefore: 3, color: '#10a37f', icon: 'Bot', createdAt: getRelativeDateStr(90) },
  { id: '4', name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', category: 'Subscriptions', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-15), paymentMethod: 'Credit Card', walletAccountId: '3', status: 'active', isFreeTrial: false, reminderDaysBefore: 5, color: '#FF0000', icon: 'Layers', createdAt: getRelativeDateStr(180) },
  { id: '5', name: 'iCloud+', amount: 9.99, currency: 'USD', category: 'Subscriptions', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-3), paymentMethod: 'Apple Pay', walletAccountId: '1', status: 'active', isFreeTrial: false, reminderDaysBefore: 3, color: '#007AFF', icon: 'Cloud', createdAt: getRelativeDateStr(365) },
  { id: '6', name: 'Equinox', amount: 180, currency: 'USD', category: 'Health & Fitness', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-1), paymentMethod: 'Debit Card', walletAccountId: '1', status: 'active', isFreeTrial: false, reminderDaysBefore: 7, color: '#B4975A', icon: 'Dumbbell', createdAt: getRelativeDateStr(300) },
  { id: '7', name: 'Paramount+', amount: 11.99, currency: 'USD', category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: getRelativeDateStr(-10), paymentMethod: 'Credit Card', walletAccountId: '3', status: 'active', isFreeTrial: true, freeTrialEndDate: getRelativeDateStr(-20), reminderDaysBefore: 3, color: '#0064FF', icon: 'Tv', createdAt: getRelativeDateStr(30) },
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Dining', limit: 800, period: 'monthly', color: '#f97316', icon: 'Utensils' },
  { category: 'Groceries', limit: 600, period: 'monthly', color: '#D2AF26', icon: 'ShoppingBag' },
  { category: 'Shopping', limit: 500, period: 'monthly', color: '#ec4899', icon: 'ShoppingBag' },
  { category: 'Transportation', limit: 400, period: 'monthly', color: '#3b82f6', icon: 'Car' },
  { category: 'Housing & Utilities', limit: 2200, period: 'monthly', color: '#6366f1', icon: 'Home' },
  { category: 'Entertainment', limit: 300, period: 'monthly', color: '#8b5cf6', icon: 'Film' },
  { category: 'Health & Fitness', limit: 250, period: 'monthly', color: '#14b8a6', icon: 'HeartPulse' },
  { category: 'Subscriptions', limit: 150, period: 'monthly', color: '#D2AF26', icon: 'Repeat' },
  { category: 'Technology', limit: 200, period: 'monthly', color: '#64748b', icon: 'Laptop' },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', merchant: 'Whole Foods Market', amount: 127.45, currency: 'USD', category: 'Groceries', date: getRelativeDateStr(0), time: '14:32', paymentMethod: 'Credit Card', walletAccountId: '3', tags: ['groceries', 'weekly'], notes: 'Weekly grocery run', createdAt: new Date().toISOString() },
  { id: '2', merchant: 'Shell Gas Station', amount: 52.30, currency: 'USD', category: 'Transportation', date: getRelativeDateStr(0), time: '08:15', paymentMethod: 'Credit Card', walletAccountId: '3', tags: ['fuel'], createdAt: new Date().toISOString() },
  { id: '3', merchant: 'Starbucks', amount: 6.75, currency: 'USD', category: 'Food & Dining', date: getRelativeDateStr(1), time: '07:45', paymentMethod: 'Apple Pay', tags: ['coffee'], notes: 'Morning coffee', createdAt: new Date().toISOString() },
  { id: '4', merchant: 'Amazon', amount: 89.99, currency: 'USD', category: 'Shopping', date: getRelativeDateStr(1), time: '20:10', paymentMethod: 'Credit Card', walletAccountId: '3', tags: ['online', 'electronics'], notes: 'New headphones', createdAt: new Date().toISOString() },
  { id: '5', merchant: 'Target', amount: 156.23, currency: 'USD', category: 'Shopping', date: getRelativeDateStr(2), time: '15:20', paymentMethod: 'Debit Card', walletAccountId: '1', tags: ['household'], createdAt: new Date().toISOString() },
  { id: '6', merchant: 'Uber', amount: 24.50, currency: 'USD', category: 'Transportation', date: getRelativeDateStr(2), time: '22:30', paymentMethod: 'Credit Card', walletAccountId: '3', tags: ['ride'], notes: 'Night ride home', createdAt: new Date().toISOString() },
  { id: '7', merchant: 'CVS Pharmacy', amount: 35.80, currency: 'USD', category: 'Health & Fitness', date: getRelativeDateStr(3), time: '11:00', paymentMethod: 'Debit Card', walletAccountId: '1', tags: ['medicine'], createdAt: new Date().toISOString() },
  { id: '8', merchant: 'Netflix', amount: 22.99, currency: 'USD', category: 'Entertainment', date: getRelativeDateStr(3), time: '00:00', paymentMethod: 'Credit Card', walletAccountId: '3', tags: ['subscription'], isSubscription: true, subscriptionId: '1', createdAt: new Date().toISOString() },
];

export const INITIAL_FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 15000,
    currentAmount: 8500,
    currency: 'USD',
    targetDate: getRelativeDateStr(-180),
    category: 'Savings',
    color: '#22c55e',
    icon: 'Shield',
  },
  {
    id: '2',
    title: 'Vacation Fund',
    targetAmount: 3000,
    currentAmount: 1200,
    currency: 'USD',
    targetDate: getRelativeDateStr(-90),
    category: 'Travel',
    color: '#3b82f6',
    icon: 'Plane',
  },
  {
    id: '3',
    title: 'New Laptop',
    targetAmount: 2000,
    currentAmount: 2000,
    currency: 'USD',
    targetDate: getRelativeDateStr(-30),
    category: 'Technology',
    color: '#8b5cf6',
    icon: 'Laptop',
  },
];
