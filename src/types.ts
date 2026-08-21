export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping'
  | 'Transportation'
  | 'Housing & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Travel'
  | 'Subscriptions'
  | 'Technology'
  | 'Education'
  | 'Personal Care'
  | 'Salary & Income'
  | 'Investment'
  | 'Miscellaneous';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Apple Pay'
  | 'Google Pay'
  | 'Bank Transfer'
  | 'PayPal'
  | 'Other';

export type TransactionType = 'expense' | 'income' | 'transfer';

export type WalletType = 'checking' | 'savings' | 'cash' | 'credit' | 'investment' | 'crypto';

export interface WalletAccount {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  accountNumberMask?: string;
  isDefault?: boolean;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface Expense {
  id: string;
  type?: TransactionType; // default 'expense'
  merchant: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  walletAccountId?: string; // Target or source wallet
  destinationWalletId?: string; // For transfers
  items?: ReceiptItem[];
  tax?: number;
  tip?: number;
  subtotal?: number;
  notes?: string;
  receiptImage?: string; // base64 / data URL
  receiptConfidence?: number; // 0-100
  isSubscription?: boolean;
  subscriptionId?: string;
  tags?: string[];
  payee?: string;
  createdAt: string;
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  billingCycle: BillingCycle;
  customIntervalDays?: number;
  nextBillingDate: string; // YYYY-MM-DD
  startDate?: string;
  paymentMethod: PaymentMethod;
  walletAccountId?: string;
  status: SubscriptionStatus;
  isFreeTrial: boolean;
  freeTrialEndDate?: string;
  reminderDaysBefore: number; // e.g. 1, 2, 3, 7 days alert
  notes?: string;
  icon?: string;
  color?: string;
  websiteUrl?: string;
  priceHistory?: { date: string; amount: number }[];
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  icon: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon?: string;
}

export interface SpendingInsight {
  id: string;
  type: 'alert' | 'tip' | 'celebration' | 'subscription' | 'trend';
  title: string;
  message: string;
  category?: ExpenseCategory;
  impactAmount?: number;
  actionable?: string;
}

export interface AIAdvisorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export type AppTheme = 'dark' | 'light';

export interface ReceiptScanResult {
  merchant: string;
  total: number;
  currency: string;
  date: string;
  time?: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  subtotal?: number;
  tax?: number;
  tip?: number;
  items: ReceiptItem[];
  notes?: string;
  confidence: number;
  rawTextSummary?: string;
}
