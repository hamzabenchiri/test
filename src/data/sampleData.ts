import {
  CategoryBudget,
  Expense,
  ExpenseCategory,
  FinancialGoal,
  Subscription,
  WalletAccount,
} from '../types';

// Helper to generate dynamic SVG receipt images as base64 data URLs
export function generateSampleReceiptSVG(
  title: string,
  items: { name: string; price: number; qty?: number; quantity?: number }[],
  tax: number,
  total: number,
  dateStr: string,
  payment: string
): string {
  const lineItemsSvg = items
    .map((item, idx) => {
      const quantity = item.quantity || item.qty;
      return `
    <text x="24" y="${140 + idx * 24}" font-family="monospace" font-size="12" fill="#2d3748">${quantity ? `${quantity}x ` : ''}${item.name}</text>
    <text x="296" y="${140 + idx * 24}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end" fill="#1a202c">$${item.price.toFixed(2)}</text>`;
    })
    .join('');

  const endY = 150 + items.length * 24;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="${endY + 140}" viewBox="0 0 320 ${endY + 140}">
    <defs>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.1"/>
      </filter>
    </defs>
    <rect width="320" height="${endY + 140}" fill="#f7fafc" />
    <rect x="12" y="12" width="296" height="${endY + 116}" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)" />
    
    <!-- Receipt Header -->
    <circle cx="160" cy="42" r="16" fill="#f1f5f9" />
    <text x="160" y="47" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#475569">🧾</text>
    <text x="160" y="74" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#0f172a">${title.toUpperCase()}</text>
    <text x="160" y="92" font-family="monospace" font-size="11" text-anchor="middle" fill="#64748b">${dateStr} • RECEIPT #8942</text>
    
    <!-- Divider -->
    <line x1="24" y1="108" x2="296" y2="108" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
    
    <!-- Items -->
    ${lineItemsSvg}
    
    <!-- Divider -->
    <line x1="24" y1="${endY + 8}" x2="296" y2="${endY + 8}" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
    
    <!-- Summary -->
    <text x="24" y="${endY + 28}" font-family="monospace" font-size="11" fill="#64748b">Tax / VAT</text>
    <text x="296" y="${endY + 28}" font-family="monospace" font-size="11" text-anchor="end" fill="#64748b">$${tax.toFixed(2)}</text>
    
    <text x="24" y="${endY + 50}" font-family="monospace" font-size="14" font-weight="bold" fill="#0f172a">TOTAL</text>
    <text x="296" y="${endY + 50}" font-family="monospace" font-size="15" font-weight="bold" text-anchor="end" fill="#059669">$${total.toFixed(2)}</text>
    
    <text x="24" y="${endY + 74}" font-family="monospace" font-size="10" fill="#94a3b8">Paid via ${payment} (AUTH: OK)</text>
    <text x="160" y="${endY + 98}" font-family="monospace" font-size="10" text-anchor="middle" fill="#94a3b8">THANK YOU FOR YOUR VISIT!</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_WALLETS: WalletAccount[] = [
  {
    id: 'wallet-1',
    name: 'Chase Checking',
    type: 'checking',
    balance: 4850.25,
    currency: 'USD',
    color: '#3b82f6',
    icon: 'Building2',
    accountNumberMask: '•••• 4129',
    isDefault: true,
  },
  {
    id: 'wallet-2',
    name: 'Marcus High-Yield',
    type: 'savings',
    balance: 18450.0,
    currency: 'USD',
    color: '#D2AF26',
    icon: 'PiggyBank',
    accountNumberMask: '•••• 8821',
  },
  {
    id: 'wallet-3',
    name: 'Sapphire Reserve',
    type: 'credit',
    balance: -842.15,
    currency: 'USD',
    color: '#6366f1',
    icon: 'CreditCard',
    accountNumberMask: '•••• 9014',
  },
  {
    id: 'wallet-4',
    name: 'Physical Cash',
    type: 'cash',
    balance: 240.0,
    currency: 'USD',
    color: '#f59e0b',
    icon: 'Banknote',
  },
  {
    id: 'wallet-5',
    name: 'Vanguard Index',
    type: 'investment',
    balance: 32600.0,
    currency: 'USD',
    color: '#8b5cf6',
    icon: 'TrendingUp',
    accountNumberMask: '•••• 6672',
  },
];

// Subo-style Popular Subscription Templates
export const POPULAR_SUBSCRIPTION_TEMPLATES: {
  name: string;
  defaultAmount: number;
  category: ExpenseCategory;
  billingCycle: 'monthly' | 'yearly';
  color: string;
  icon: string;
  websiteUrl: string;
}[] = [
  {
    name: 'Netflix Premium',
    defaultAmount: 22.99,
    category: 'Entertainment',
    billingCycle: 'monthly',
    color: '#E50914',
    icon: 'Tv',
    websiteUrl: 'https://netflix.com',
  },
  {
    name: 'Spotify Premium Duo',
    defaultAmount: 14.99,
    category: 'Entertainment',
    billingCycle: 'monthly',
    color: '#1DB954',
    icon: 'Music',
    websiteUrl: 'https://spotify.com',
  },
  {
    name: 'ChatGPT Plus',
    defaultAmount: 20.0,
    category: 'Technology',
    billingCycle: 'monthly',
    color: '#10A37F',
    icon: 'Bot',
    websiteUrl: 'https://chatgpt.com',
  },
  {
    name: 'Apple iCloud+ 2TB',
    defaultAmount: 9.99,
    category: 'Technology',
    billingCycle: 'monthly',
    color: '#3B82F6',
    icon: 'Cloud',
    websiteUrl: 'https://apple.com/icloud',
  },
  {
    name: 'YouTube Premium',
    defaultAmount: 13.99,
    category: 'Entertainment',
    billingCycle: 'monthly',
    color: '#FF0000',
    icon: 'PlayCircle',
    websiteUrl: 'https://youtube.com',
  },
  {
    name: 'Amazon Prime',
    defaultAmount: 14.99,
    category: 'Shopping',
    billingCycle: 'monthly',
    color: '#FF9900',
    icon: 'Package',
    websiteUrl: 'https://amazon.com',
  },
  {
    name: 'Equinox Gym',
    defaultAmount: 180.0,
    category: 'Health & Fitness',
    billingCycle: 'monthly',
    color: '#14B8A6',
    icon: 'Dumbbell',
    websiteUrl: 'https://equinox.com',
  },
  {
    name: 'GitHub Copilot',
    defaultAmount: 10.0,
    category: 'Technology',
    billingCycle: 'monthly',
    color: '#6366F1',
    icon: 'Code2',
    websiteUrl: 'https://github.com',
  },
  {
    name: 'Claude Pro',
    defaultAmount: 20.0,
    category: 'Technology',
    billingCycle: 'monthly',
    color: '#D97706',
    icon: 'Sparkles',
    websiteUrl: 'https://anthropic.com',
  },
  {
    name: 'Disney+ Bundle',
    defaultAmount: 18.99,
    category: 'Entertainment',
    billingCycle: 'monthly',
    color: '#113CCF',
    icon: 'Film',
    websiteUrl: 'https://disneyplus.com',
  },
  {
    name: 'Notion Plus',
    defaultAmount: 10.0,
    category: 'Technology',
    billingCycle: 'monthly',
    color: '#000000',
    icon: 'FileText',
    websiteUrl: 'https://notion.so',
  },
  {
    name: 'NYTimes All Access',
    defaultAmount: 4.0,
    category: 'Education',
    billingCycle: 'monthly',
    color: '#000000',
    icon: 'Newspaper',
    websiteUrl: 'https://nytimes.com',
  },
];

// Helper to compute date relative to today
const getRelativeDateStr = (daysDelta: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysDelta);
  return d.toISOString().slice(0, 10);
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix 4K Ultra',
    amount: 22.99,
    currency: 'USD',
    category: 'Entertainment',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(3), // Renews in 3 days!
    startDate: '2024-01-15',
    paymentMethod: 'Apple Pay',
    walletAccountId: 'wallet-1',
    status: 'active',
    isFreeTrial: false,
    reminderDaysBefore: 2,
    notes: 'Family profile account',
    color: '#E50914',
    icon: 'Tv',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'sub-2',
    name: 'Spotify Duo Premium',
    amount: 14.99,
    currency: 'USD',
    category: 'Entertainment',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(12),
    startDate: '2023-06-01',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    status: 'active',
    isFreeTrial: false,
    reminderDaysBefore: 3,
    color: '#1DB954',
    icon: 'Music',
    createdAt: '2023-06-01T00:00:00.000Z',
  },
  {
    id: 'sub-3',
    name: 'ChatGPT Plus Team',
    amount: 20.0,
    currency: 'USD',
    category: 'Technology',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(18),
    startDate: '2023-08-10',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    status: 'active',
    isFreeTrial: false,
    reminderDaysBefore: 1,
    notes: 'Work productivity & coding assistance',
    color: '#10A37F',
    icon: 'Bot',
    createdAt: '2023-08-10T00:00:00.000Z',
  },
  {
    id: 'sub-4',
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    category: 'Technology',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(2), // Renews in 2 days! Free trial alert!
    startDate: getRelativeDateStr(-28),
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    status: 'active',
    isFreeTrial: true,
    freeTrialEndDate: getRelativeDateStr(2),
    reminderDaysBefore: 3,
    notes: '30-day trial ends soon! Cancel if not using Photoshop',
    color: '#FF0000',
    icon: 'Sparkles',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'sub-5',
    name: 'Apple iCloud+ Storage 2TB',
    amount: 9.99,
    currency: 'USD',
    category: 'Technology',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(7),
    startDate: '2022-11-20',
    paymentMethod: 'Apple Pay',
    walletAccountId: 'wallet-1',
    status: 'active',
    isFreeTrial: false,
    reminderDaysBefore: 1,
    color: '#3B82F6',
    icon: 'Cloud',
    createdAt: '2022-11-20T00:00:00.000Z',
  },
  {
    id: 'sub-6',
    name: 'Equinox Gym & Sauna',
    amount: 180.0,
    currency: 'USD',
    category: 'Health & Fitness',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(15),
    startDate: '2024-01-01',
    paymentMethod: 'Bank Transfer',
    walletAccountId: 'wallet-1',
    status: 'active',
    isFreeTrial: false,
    reminderDaysBefore: 5,
    color: '#14B8A6',
    icon: 'Dumbbell',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'sub-7',
    name: 'Paramount+ with Showtime',
    amount: 11.99,
    currency: 'USD',
    category: 'Entertainment',
    billingCycle: 'monthly',
    nextBillingDate: getRelativeDateStr(25),
    startDate: '2023-10-05',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    status: 'paused',
    isFreeTrial: false,
    reminderDaysBefore: 2,
    notes: 'Paused during summer season',
    color: '#0064FF',
    icon: 'Tv',
    createdAt: '2023-10-05T00:00:00.000Z',
  },
];

export const INITIAL_FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Fund (6 Months)',
    targetAmount: 25000,
    currentAmount: 18450,
    currency: 'USD',
    targetDate: '2026-12-31',
    category: 'Savings',
    color: '#10B981',
    icon: 'ShieldCheck',
  },
  {
    id: 'goal-2',
    title: 'Japan Autumn Trip',
    targetAmount: 4500,
    currentAmount: 3100,
    currency: 'USD',
    targetDate: '2026-10-15',
    category: 'Travel',
    color: '#3B82F6',
    icon: 'Plane',
  },
  {
    id: 'goal-3',
    title: 'New M4 MacBook Pro',
    targetAmount: 2800,
    currentAmount: 2100,
    currency: 'USD',
    targetDate: '2026-09-30',
    category: 'Technology',
    color: '#8B5CF6',
    icon: 'Laptop',
  },
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Dining', limit: 650, period: 'monthly', color: '#f97316', icon: 'Utensils' },
  { category: 'Groceries', limit: 550, period: 'monthly', color: '#D2AF26', icon: 'ShoppingBag' },
  { category: 'Shopping', limit: 400, period: 'monthly', color: '#ec4899', icon: 'ShoppingBag' },
  { category: 'Transportation', limit: 250, period: 'monthly', color: '#3b82f6', icon: 'Car' },
  { category: 'Housing & Utilities', limit: 1650, period: 'monthly', color: '#6366f1', icon: 'Home' },
  { category: 'Entertainment', limit: 220, period: 'monthly', color: '#8b5cf6', icon: 'Film' },
  { category: 'Health & Fitness', limit: 260, period: 'monthly', color: '#14b8a6', icon: 'HeartPulse' },
  { category: 'Subscriptions', limit: 180, period: 'monthly', color: '#eab308', icon: 'Repeat' },
  { category: 'Technology', limit: 300, period: 'monthly', color: '#64748b', icon: 'Laptop' },
];

export const INITIAL_EXPENSES: Expense[] = [
  // Income entries
  {
    id: 'inc-1',
    type: 'income',
    merchant: 'Acme Corp Payroll',
    payee: 'Acme Corp',
    amount: 4650.0,
    currency: 'USD',
    category: 'Salary & Income',
    date: getRelativeDateStr(-6),
    time: '09:00',
    paymentMethod: 'Bank Transfer',
    walletAccountId: 'wallet-1',
    notes: 'Bi-weekly tech engineering salary',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'inc-2',
    type: 'income',
    merchant: 'Freelance Design Client',
    payee: 'Studio Nimbus',
    amount: 1200.0,
    currency: 'USD',
    category: 'Salary & Income',
    date: getRelativeDateStr(-16),
    time: '14:20',
    paymentMethod: 'Bank Transfer',
    walletAccountId: 'wallet-1',
    notes: 'Web UI design sprint payout',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
  },

  // Transfer entry
  {
    id: 'trans-1',
    type: 'transfer',
    merchant: 'Savings Auto-Deposit',
    amount: 500.0,
    currency: 'USD',
    category: 'Investment',
    date: getRelativeDateStr(-5),
    time: '10:00',
    paymentMethod: 'Bank Transfer',
    walletAccountId: 'wallet-1',
    destinationWalletId: 'wallet-2',
    notes: 'Monthly emergency fund contribution',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },

  // Expenses entries with rich receipt metadata
  {
    id: 'exp-1',
    type: 'expense',
    merchant: 'Blue Bottle Coffee',
    amount: 18.5,
    currency: 'USD',
    category: 'Food & Dining',
    date: getRelativeDateStr(0),
    time: '08:45',
    paymentMethod: 'Apple Pay',
    walletAccountId: 'wallet-1',
    items: [
      { name: 'Oat Milk Flat White', quantity: 2, price: 6.75 },
      { name: 'Cardamom Bun', quantity: 1, price: 5.0 },
    ],
    tax: 1.25,
    tip: 2.0,
    notes: 'Morning coffee with Alex before standup',
    tags: ['coffee', 'work'],
    receiptImage: generateSampleReceiptSVG(
      'Blue Bottle Coffee',
      [
        { name: 'Oat Milk Flat White', quantity: 2, price: 13.5 },
        { name: 'Cardamom Bun', quantity: 1, price: 5.0 },
      ],
      1.25,
      18.5,
      getRelativeDateStr(0),
      'Apple Pay'
    ),
    receiptConfidence: 98,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    type: 'expense',
    merchant: 'Trader Joe’s Market',
    amount: 86.4,
    currency: 'USD',
    category: 'Groceries',
    date: getRelativeDateStr(-1),
    time: '18:15',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    items: [
      { name: 'Organic Honeycrisp Apples', quantity: 1, price: 5.99 },
      { name: 'Pasture-Raised Eggs 12pk', quantity: 2, price: 4.89 },
      { name: 'Almond Butter Crunch', quantity: 1, price: 6.49 },
      { name: 'Organic Sourdough Bread', quantity: 1, price: 3.99 },
      { name: 'Cold Brew Concentrate', quantity: 2, price: 7.99 },
      { name: 'Wild Caught Salmon 1lb', quantity: 1, price: 14.99 },
      { name: 'Greek Yogurt 32oz', quantity: 2, price: 5.49 },
      { name: 'Avocados 4pk', quantity: 1, price: 4.99 },
    ],
    tax: 4.2,
    notes: 'Weekly fresh grocery restocking',
    tags: ['groceries', 'household'],
    receiptImage: generateSampleReceiptSVG(
      'Trader Joe’s Market',
      [
        { name: 'Organic Honeycrisp Apples', price: 5.99 },
        { name: 'Pasture-Raised Eggs (2x)', price: 9.78 },
        { name: 'Almond Butter Crunch', price: 6.49 },
        { name: 'Organic Sourdough Bread', price: 3.99 },
        { name: 'Cold Brew Concentrate (2x)', price: 15.98 },
        { name: 'Wild Salmon 1lb', price: 14.99 },
        { name: 'Greek Yogurt (2x)', price: 10.98 },
        { name: 'Avocados 4pk', price: 4.99 },
      ],
      4.2,
      86.4,
      getRelativeDateStr(-1),
      'Credit Card'
    ),
    receiptConfidence: 96,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'exp-3',
    type: 'expense',
    merchant: 'Uber Ride',
    amount: 28.75,
    currency: 'USD',
    category: 'Transportation',
    date: getRelativeDateStr(-2),
    time: '21:30',
    paymentMethod: 'Apple Pay',
    walletAccountId: 'wallet-1',
    notes: 'Airport commute back from client meeting',
    tags: ['commute', 'travel'],
    receiptImage: generateSampleReceiptSVG(
      'Uber Technologies',
      [{ name: 'UberX Trip (14.2 miles)', price: 24.5 }],
      1.75,
      28.75,
      getRelativeDateStr(-2),
      'Apple Pay'
    ),
    receiptConfidence: 99,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'exp-4',
    type: 'expense',
    merchant: 'Apple Store Downtown',
    amount: 149.0,
    currency: 'USD',
    category: 'Technology',
    date: getRelativeDateStr(-3),
    time: '15:10',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    items: [{ name: 'Magic Trackpad - Black', quantity: 1, price: 149.0 }],
    tax: 12.65,
    notes: 'Desk ergonomic upgrade',
    tags: ['tech', 'workspace'],
    receiptImage: generateSampleReceiptSVG(
      'Apple Store Downtown',
      [{ name: 'Magic Trackpad Space Black', price: 149.0 }],
      12.65,
      161.65,
      getRelativeDateStr(-3),
      'Credit Card'
    ),
    receiptConfidence: 99,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'exp-5',
    type: 'expense',
    merchant: 'Il Buco Italian Trattoria',
    amount: 112.5,
    currency: 'USD',
    category: 'Food & Dining',
    date: getRelativeDateStr(-4),
    time: '20:15',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    items: [
      { name: 'Truffle Tagliolini', quantity: 2, price: 28.0 },
      { name: 'Nebbiolo Wine Bottle', quantity: 1, price: 42.0 },
      { name: 'Tiramisu Tradizionale', quantity: 1, price: 12.0 },
    ],
    tax: 9.8,
    tip: 22.0,
    notes: 'Anniversary dinner with Maya',
    tags: ['dining', 'celebration'],
    receiptConfidence: 95,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'exp-6',
    type: 'expense',
    merchant: 'Uniqlo Flagship',
    amount: 74.3,
    currency: 'USD',
    category: 'Shopping',
    date: getRelativeDateStr(-6),
    time: '13:40',
    paymentMethod: 'Debit Card',
    walletAccountId: 'wallet-1',
    items: [
      { name: 'AIRism Cotton Oversized Tee', quantity: 2, price: 24.9 },
      { name: 'Ultra Light Down Vest', quantity: 1, price: 49.9 },
    ],
    tax: 6.2,
    notes: 'Autumn wardrobe basics',
    tags: ['clothes', 'shopping'],
    receiptConfidence: 94,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
  },
  {
    id: 'exp-7',
    type: 'expense',
    merchant: 'Shell Gas Station',
    amount: 48.0,
    currency: 'USD',
    category: 'Transportation',
    date: getRelativeDateStr(-8),
    time: '07:20',
    paymentMethod: 'Credit Card',
    walletAccountId: 'wallet-3',
    notes: 'Full tank premium fuel',
    tags: ['fuel', 'car'],
    receiptConfidence: 99,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
  },
  {
    id: 'exp-8',
    type: 'expense',
    merchant: 'Netflix Subscription',
    amount: 22.99,
    currency: 'USD',
    category: 'Subscriptions',
    date: getRelativeDateStr(-27),
    time: '00:01',
    paymentMethod: 'Apple Pay',
    walletAccountId: 'wallet-1',
    isSubscription: true,
    subscriptionId: 'sub-1',
    notes: 'Monthly 4K streaming plan',
    tags: ['recurring', 'streaming'],
    receiptConfidence: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
  },
];

export const INITIAL_CATEGORY_BUDGETS = INITIAL_BUDGETS;

export const SAMPLE_RECEIPT_TEMPLATES = [
  {
    id: 'blue-bottle',
    merchant: 'Blue Bottle Coffee',
    category: 'Food & Dining' as ExpenseCategory,
    date: getRelativeDateStr(0),
    total: 18.5,
    tax: 1.25,
    tip: 2.0,
    paymentMethod: 'Apple Pay' as const,
    items: [
      { name: 'Oat Milk Flat White', quantity: 2, price: 6.75 },
      { name: 'Cardamom Bun', quantity: 1, price: 5.0 },
    ],
    svg: generateSampleReceiptSVG(
      'Blue Bottle Coffee',
      [
        { name: 'Oat Milk Flat White', quantity: 2, price: 13.5 },
        { name: 'Cardamom Bun', quantity: 1, price: 5.0 },
      ],
      1.25,
      18.5,
      getRelativeDateStr(0),
      'Apple Pay'
    ),
  },
  {
    id: 'trader-joes',
    merchant: 'Trader Joe’s Market',
    category: 'Groceries' as ExpenseCategory,
    date: getRelativeDateStr(-1),
    total: 86.4,
    tax: 4.2,
    tip: 0,
    paymentMethod: 'Credit Card' as const,
    items: [
      { name: 'Organic Honeycrisp Apples', quantity: 1, price: 5.99 },
      { name: 'Pasture-Raised Eggs 12pk', quantity: 2, price: 4.89 },
      { name: 'Almond Butter Crunch', quantity: 1, price: 6.49 },
      { name: 'Wild Caught Salmon 1lb', quantity: 1, price: 14.99 },
    ],
    svg: generateSampleReceiptSVG(
      'Trader Joe’s Market',
      [
        { name: 'Organic Honeycrisp Apples', price: 5.99 },
        { name: 'Pasture-Raised Eggs', price: 9.78 },
        { name: 'Almond Butter Crunch', price: 6.49 },
        { name: 'Wild Caught Salmon', price: 14.99 },
      ],
      4.2,
      86.4,
      getRelativeDateStr(-1),
      'Credit Card'
    ),
  },
  {
    id: 'apple-store',
    merchant: 'Apple Store 5th Ave',
    category: 'Technology' as ExpenseCategory,
    date: getRelativeDateStr(-3),
    total: 161.65,
    tax: 12.65,
    tip: 0,
    paymentMethod: 'Credit Card' as const,
    items: [{ name: 'Magic Trackpad Space Black', quantity: 1, price: 149.0 }],
    svg: generateSampleReceiptSVG(
      'Apple Store 5th Ave',
      [{ name: 'Magic Trackpad Space Black', price: 149.0 }],
      12.65,
      161.65,
      getRelativeDateStr(-3),
      'Credit Card'
    ),
  },
];


