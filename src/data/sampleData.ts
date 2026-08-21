import { CategoryBudget, Expense, ExpenseCategory } from '../types';

// Helper to generate dynamic SVG receipt images as base64 data URLs
export function generateSampleReceiptSVG(
  title: string,
  items: { name: string; price: number; qty?: number }[],
  tax: number,
  total: number,
  dateStr: string,
  payment: string
): string {
  const lineItemsSvg = items
    .map(
      (item, idx) => `
    <text x="24" y="${140 + idx * 24}" font-family="monospace" font-size="12" fill="#2d3748">${item.qty ? `${item.qty}x ` : ''}${item.name}</text>
    <text x="296" y="${140 + idx * 24}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end" fill="#1a202c">$${item.price.toFixed(2)}</text>`
    )
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

export const SAMPLE_RECEIPT_TEMPLATES = [
  {
    id: 'sample-1',
    merchant: 'Blue Bottle Coffee',
    category: 'Food & Dining' as ExpenseCategory,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString().slice(0, 10),
    items: [
      { name: 'Bella Donovan Blend', quantity: 1, price: 5.5 },
      { name: 'Oat Milk Flat White', quantity: 1, price: 6.75 },
      { name: 'Almond Croissant', quantity: 1, price: 4.5 },
    ],
    tax: 1.45,
    tip: 2.0,
    total: 20.2,
    paymentMethod: 'Apple Pay' as const,
  },
  {
    id: 'sample-2',
    merchant: 'Trader Joe’s Market',
    category: 'Groceries' as ExpenseCategory,
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString().slice(0, 10),
    items: [
      { name: 'Organic Honeycrisp Apples', quantity: 1, price: 5.99 },
      { name: 'Pasture-Raised Eggs 12pk', quantity: 1, price: 4.89 },
      { name: 'Almond Butter Crunch', quantity: 1, price: 6.49 },
      { name: 'Organic Sourdough Bread', quantity: 1, price: 3.99 },
      { name: 'Cold Brew Concentrate', quantity: 1, price: 7.99 },
    ],
    tax: 2.15,
    tip: 0,
    total: 31.5,
    paymentMethod: 'Credit Card' as const,
  },
  {
    id: 'sample-3',
    merchant: 'Apple Store Downtown',
    category: 'Technology' as ExpenseCategory,
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().slice(0, 10),
    items: [
      { name: 'USB-C to MagSafe 3 Cable (2m)', quantity: 1, price: 49.0 },
      { name: 'AirTag 4-Pack', quantity: 1, price: 99.0 },
    ],
    tax: 12.85,
    tip: 0,
    total: 160.85,
    paymentMethod: 'Apple Pay' as const,
  },
  {
    id: 'sample-4',
    merchant: 'Uber Technologies',
    category: 'Transportation' as ExpenseCategory,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().slice(0, 10),
    items: [
      { name: 'UberX Trip - SFO Airport to City', quantity: 1, price: 42.5 },
      { name: 'Airport Surcharge & Tolls', quantity: 1, price: 5.75 },
    ],
    tax: 3.25,
    tip: 6.5,
    total: 58.0,
    paymentMethod: 'Credit Card' as const,
  },
];

export const INITIAL_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Dining', limit: 600, color: '#f97316', icon: 'Utensils' },
  { category: 'Groceries', limit: 550, color: '#10b981', icon: 'ShoppingBag' },
  { category: 'Shopping', limit: 350, color: '#ec4899', icon: 'ShoppingBag' },
  { category: 'Transportation', limit: 250, color: '#3b82f6', icon: 'Car' },
  { category: 'Housing & Utilities', limit: 1400, color: '#6366f1', icon: 'Home' },
  { category: 'Entertainment', limit: 200, color: '#8b5cf6', icon: 'Film' },
  { category: 'Health & Fitness', limit: 150, color: '#14b8a6', icon: 'HeartPulse' },
  { category: 'Travel', limit: 400, color: '#06b6d4', icon: 'Plane' },
  { category: 'Subscriptions', limit: 120, color: '#eab308', icon: 'Repeat' },
  { category: 'Technology', limit: 300, color: '#64748b', icon: 'Laptop' },
  { category: 'Miscellaneous', limit: 150, color: '#94a3b8', icon: 'Tag' },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    merchant: 'Blue Bottle Coffee',
    amount: 20.2,
    currency: 'USD',
    category: 'Food & Dining',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString().slice(0, 10),
    time: '08:45',
    paymentMethod: 'Apple Pay',
    subtotal: 16.75,
    tax: 1.45,
    tip: 2.0,
    items: [
      { name: 'Bella Donovan Blend', quantity: 1, price: 5.5, category: 'Coffee' },
      { name: 'Oat Milk Flat White', quantity: 1, price: 6.75, category: 'Coffee' },
      { name: 'Almond Croissant', quantity: 1, price: 4.5, category: 'Bakery' },
    ],
    notes: 'Breakfast with team',
    receiptConfidence: 98,
    receiptImage: generateSampleReceiptSVG(
      'Blue Bottle Coffee',
      [
        { name: 'Bella Donovan Blend', price: 5.5, qty: 1 },
        { name: 'Oat Milk Flat White', price: 6.75, qty: 1 },
        { name: 'Almond Croissant', price: 4.5, qty: 1 },
      ],
      1.45,
      20.2,
      new Date().toLocaleDateString(),
      'Apple Pay'
    ),
    tags: ['breakfast', 'team'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    merchant: 'Trader Joe’s Market',
    amount: 78.4,
    currency: 'USD',
    category: 'Groceries',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    time: '17:30',
    paymentMethod: 'Credit Card',
    subtotal: 73.15,
    tax: 5.25,
    items: [
      { name: 'Organic Chicken Breast', quantity: 2, price: 18.5, category: 'Meat' },
      { name: 'Fresh Produce (Avocados, Spinach)', quantity: 1, price: 14.2, category: 'Produce' },
      { name: 'Greek Yogurt & Almond Milk', quantity: 2, price: 9.8, category: 'Dairy' },
      { name: 'Snacks & Kombucha 4pk', quantity: 1, price: 15.65, category: 'Beverages' },
      { name: 'Olive Oil & Pasta', quantity: 1, price: 15.0, category: 'Pantry' },
    ],
    notes: 'Weekly grocery run',
    receiptConfidence: 95,
    receiptImage: generateSampleReceiptSVG(
      'Trader Joe’s',
      [
        { name: 'Organic Chicken Breast 2x', price: 18.5 },
        { name: 'Fresh Produce', price: 14.2 },
        { name: 'Greek Yogurt & Almond Milk', price: 9.8 },
        { name: 'Snacks & Kombucha', price: 15.65 },
        { name: 'Olive Oil & Pasta', price: 15.0 },
      ],
      5.25,
      78.4,
      '08/19/2026',
      'Visa **** 4921'
    ),
    tags: ['groceries', 'home'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    merchant: 'Uber Technologies',
    amount: 32.5,
    currency: 'USD',
    category: 'Transportation',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().slice(0, 10),
    time: '21:15',
    paymentMethod: 'Apple Pay',
    tax: 2.5,
    tip: 5.0,
    subtotal: 25.0,
    items: [{ name: 'UberX ride downtown', quantity: 1, price: 25.0 }],
    notes: 'Ride back from client dinner',
    receiptConfidence: 99,
    tags: ['work', 'travel'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    merchant: 'Spotify Premium Family',
    amount: 19.99,
    currency: 'USD',
    category: 'Subscriptions',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().slice(0, 10),
    time: '00:01',
    paymentMethod: 'Credit Card',
    isSubscription: true,
    subscriptionFrequency: 'monthly',
    notes: 'Monthly family subscription',
    tags: ['recurring', 'music'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-5',
    merchant: 'Equinox Fitness Club',
    amount: 140.0,
    currency: 'USD',
    category: 'Health & Fitness',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString().slice(0, 10),
    time: '12:00',
    paymentMethod: 'Debit Card',
    isSubscription: true,
    subscriptionFrequency: 'monthly',
    notes: 'Monthly gym membership',
    tags: ['fitness', 'recurring'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-6',
    merchant: 'Apple Store Downtown',
    amount: 160.85,
    currency: 'USD',
    category: 'Technology',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString().slice(0, 10),
    time: '15:20',
    paymentMethod: 'Apple Pay',
    subtotal: 148.0,
    tax: 12.85,
    items: [
      { name: 'USB-C to MagSafe Cable', quantity: 1, price: 49.0 },
      { name: 'AirTag 4-Pack', quantity: 1, price: 99.0 },
    ],
    notes: 'Accessories replacement',
    receiptConfidence: 96,
    tags: ['gadgets', 'apple'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-7',
    merchant: 'Osteria Morini Italian',
    amount: 112.4,
    currency: 'USD',
    category: 'Food & Dining',
    date: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString().slice(0, 10),
    time: '19:45',
    paymentMethod: 'Credit Card',
    subtotal: 91.0,
    tax: 7.4,
    tip: 14.0,
    items: [
      { name: 'Tagliatelle Bolognese', quantity: 2, price: 56.0 },
      { name: 'Burrata Antipasti', quantity: 1, price: 18.0 },
      { name: 'Sparkling Pellegrino', quantity: 1, price: 7.0 },
      { name: 'Tiramisu', quantity: 1, price: 10.0 },
    ],
    notes: 'Dinner with Sarah',
    receiptConfidence: 94,
    tags: ['dining', 'weekend'],
    createdAt: new Date().toISOString(),
  },
];
