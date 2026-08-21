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

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  items?: ReceiptItem[];
  tax?: number;
  tip?: number;
  subtotal?: number;
  notes?: string;
  receiptImage?: string; // base64 / data URL
  receiptConfidence?: number; // 0-100
  isSubscription?: boolean;
  subscriptionFrequency?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  limit: number;
  color: string;
  icon: string;
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
