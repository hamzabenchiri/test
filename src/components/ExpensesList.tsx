import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Camera,
  Trash2,
  Edit2,
  FileText,
  Repeat,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Copy,
  Sparkles,
  LayoutList,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Wallet,
  Building2,
} from 'lucide-react';
import {
  AppTheme,
  Expense,
  ExpenseCategory,
  PaymentMethod,
  TransactionType,
  WalletAccount,
} from '../types';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  CATEGORY_CONFIG,
  exportExpensesToCSV,
  formatCurrency,
  formatDate,
  triggerCSVDownload,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  expenses: Expense[];
  wallets?: WalletAccount[];
  currency: string;
  onOpenScanner: () => void;
  onOpenManualAdd: () => void;
  onSelectExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onDuplicateExpense: (expense: Expense) => void;
  onImportExpenses?: (imported: Expense[]) => void;
  theme?: AppTheme;
}

export const ExpensesList: React.FC<Props> = ({
  expenses,
  wallets = [],
  currency,
  onOpenScanner,
  onOpenManualAdd,
  onSelectExpense,
  onEditExpense,
  onDeleteExpense,
  onDuplicateExpense,
  onImportExpenses,
  theme = 'dark',
}) => {
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_7_days' | 'this_year'>('all');
  const [onlyReceipts, setOnlyReceipts] = useState(false);
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);
  const [viewMode, setViewMode] = useState<'grouped' | 'grid' | 'table'>('grouped');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Type Tab
      if (activeTypeTab !== 'all') {
        const itemType = e.type || 'expense';
        if (itemType !== activeTypeTab) return false;
      }

      // Wallet Account
      if (selectedWalletId !== 'all') {
        if (e.walletAccountId !== selectedWalletId && e.destinationWalletId !== selectedWalletId) {
          return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMerchant = e.merchant.toLowerCase().includes(q);
        const matchPayee = e.payee?.toLowerCase().includes(q);
        const matchNotes = e.notes?.toLowerCase().includes(q);
        const matchCategory = e.category.toLowerCase().includes(q);
        const matchItems = e.items?.some((it) => it.name.toLowerCase().includes(q));
        const matchTags = e.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchMerchant && !matchPayee && !matchNotes && !matchCategory && !matchItems && !matchTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // Payment Method
      if (selectedPayment !== 'all' && e.paymentMethod !== selectedPayment) {
        return false;
      }

      // Only receipts
      if (onlyReceipts && !e.receiptImage) {
        return false;
      }

      // Only subscriptions
      if (onlySubscriptions && !e.isSubscription) {
        return false;
      }

      // Date Range
      if (dateFilter !== 'all') {
        const itemDate = new Date(e.date);
        const now = new Date();

        if (dateFilter === 'this_month') {
          if (
            itemDate.getFullYear() !== now.getFullYear() ||
            itemDate.getMonth() !== now.getMonth()
          ) {
            return false;
          }
        } else if (dateFilter === 'last_7_days') {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays < 0 || diffDays > 7) {
            return false;
          }
        } else if (dateFilter === 'this_year') {
          if (itemDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    expenses,
    activeTypeTab,
    selectedWalletId,
    searchQuery,
    selectedCategory,
    selectedPayment,
    onlyReceipts,
    onlySubscriptions,
    dateFilter,
  ]);

  // Sort logic
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [filteredExpenses, sortBy]);

  // Group by Date for Fineyo & Kelo ledger view
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Expense[]; totalSpent: number; totalIncome: number }[] = [];
    const dateMap = new Map<string, Expense[]>();

    for (const exp of sortedExpenses) {
      if (!dateMap.has(exp.date)) {
        dateMap.set(exp.date, []);
      }
      dateMap.get(exp.date)!.push(exp);
    }

    dateMap.forEach((items, date) => {
      const totalSpent = items
        .filter((i) => !i.type || i.type === 'expense')
        .reduce((sum, i) => sum + i.amount, 0);
      const totalIncome = items
        .filter((i) => i.type === 'income')
        .reduce((sum, i) => sum + i.amount, 0);
      groups.push({ date, items, totalSpent, totalIncome });
    });

    return groups;
  }, [sortedExpenses]);

  // Summary stats for filtered set
  const totalExpenseSum = filteredExpenses
    .filter((e) => !e.type || e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncomeSum = filteredExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    const csvContent = exportExpensesToCSV(sortedExpenses, currency);
    triggerCSVDownload(csvContent, `spense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportExpenses) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const lines = content.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) return;

        const newExpenses: Expense[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 6) {
            const amount = parseFloat(cols[6]) || 0;
            if (amount > 0) {
              newExpenses.push({
                id: `imp-${Date.now()}-${i}`,
                type: (cols[1] as TransactionType) || 'expense',
                date: cols[2] || new Date().toISOString().slice(0, 10),
                time: cols[3] || '12:00',
                merchant: cols[4] || 'Imported Entry',
                category: (cols[5] as ExpenseCategory) || 'Miscellaneous',
                amount,
                currency: cols[7] || currency,
                paymentMethod: (cols[8] as PaymentMethod) || 'Credit Card',
                notes: cols[10] || undefined,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
        if (newExpenses.length > 0) {
          onImportExpenses(newExpenses);
        }
      } catch (err) {
        console.error('Failed to import CSV:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in" id="expenses-list-view">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text-main tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-500" />
            Transactions & Ledger
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            Fineyo & Kelo unified multi-account transactions, timeline stream, and CSV tools
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Import CSV transactions"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Scan Receipt */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl theme-bg-card hover:theme-bg-subtle theme-border border theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span>Scan</span>
          </button>

          {/* Add Manual */}
          <button
            onClick={onOpenManualAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            id="expenses-add-transaction-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Summary Totals Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="theme-card p-4 rounded-2xl shadow-xs theme-border border">
          <span className="text-[10px] uppercase tracking-wider theme-text-muted font-medium">
            Filtered Outflow
          </span>
          <div className="text-lg font-bold font-mono text-rose-500 mt-1">
            -{formatCurrency(totalExpenseSum, currency)}
          </div>
        </div>

        <div className="theme-card p-4 rounded-2xl shadow-xs theme-border border">
          <span className="text-[10px] uppercase tracking-wider theme-text-muted font-medium">
            Filtered Inflow
          </span>
          <div className="text-lg font-bold font-mono text-emerald-500 mt-1">
            +{formatCurrency(totalIncomeSum, currency)}
          </div>
        </div>

        <div className="theme-card p-4 rounded-2xl shadow-xs theme-border border">
          <span className="text-[10px] uppercase tracking-wider theme-text-muted font-medium">
            Net Change
          </span>
          <div
            className={`text-lg font-bold font-mono mt-1 ${
              totalIncomeSum - totalExpenseSum >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {totalIncomeSum - totalExpenseSum >= 0 ? '+' : ''}
            {formatCurrency(totalIncomeSum - totalExpenseSum, currency)}
          </div>
        </div>

        <div className="theme-card p-4 rounded-2xl shadow-xs theme-border border">
          <span className="text-[10px] uppercase tracking-wider theme-text-muted font-medium">
            Total Records
          </span>
          <div className="text-lg font-bold font-mono theme-text-main mt-1">
            {filteredExpenses.length}{' '}
            <span className="text-xs font-sans theme-text-muted font-normal">items</span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="theme-card p-4 rounded-2xl shadow-xs theme-border border space-y-3">
        {/* Row 1: Type Switcher & Search & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Type Switcher */}
          <div className="flex items-center gap-1 theme-bg-subtle p-1 rounded-xl theme-border border w-full md:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'expense', label: 'Expenses' },
              { id: 'income', label: 'Income' },
              { id: 'transfer', label: 'Transfers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeTab(tab.id as any)}
                className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTypeTab === tab.id
                    ? 'theme-bg-card theme-text-main shadow-xs theme-border border'
                    : 'theme-text-secondary hover:theme-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by merchant, note, item, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 theme-bg-subtle p-1 rounded-xl theme-border border self-end md:self-auto">
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grouped'
                  ? 'theme-bg-card theme-text-main shadow-xs'
                  : 'theme-text-muted hover:theme-text-main'
              }`}
              title="Daily Grouped Ledger (Fineyo Style)"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'theme-bg-card theme-text-main shadow-xs'
                  : 'theme-text-muted hover:theme-text-main'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {/* Wallet Account Filter (Fineyo) */}
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="theme-input text-xs rounded-xl px-2.5 py-1.5 border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Accounts</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="theme-input text-xs rounded-xl px-2.5 py-1.5 border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="theme-input text-xs rounded-xl px-2.5 py-1.5 border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Methods</option>
            {ALL_PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="theme-input text-xs rounded-xl px-2.5 py-1.5 border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="this_year">This Year</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="theme-input text-xs rounded-xl px-2.5 py-1.5 border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {/* Quick Toggle Checks */}
          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <label className="flex items-center gap-1.5 text-xs theme-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={onlyReceipts}
                onChange={(e) => setOnlyReceipts(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500"
              />
              <span>Receipts</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs theme-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={onlySubscriptions}
                onChange={(e) => setOnlySubscriptions(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500"
              />
              <span>Recurring</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ledger Stream Content */}
      {sortedExpenses.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center theme-border border">
          <FileText className="w-10 h-10 mx-auto theme-text-muted mb-3 opacity-50" />
          <h3 className="text-sm font-semibold theme-text-main">No transactions found</h3>
          <p className="text-xs theme-text-secondary mt-1 max-w-sm mx-auto">
            Try adjusting your search query, account filters, or add a new transaction.
          </p>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Fineyo & Kelo Day-by-Day Grouped Ledger */
        <div className="space-y-5">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Day Header Banner */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl theme-bg-subtle theme-border border text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 theme-text-muted" />
                  <span className="font-bold theme-text-main">{formatDate(group.date)}</span>
                  <span className="text-[10px] theme-text-muted">({group.items.length} items)</span>
                </div>

                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  {group.totalSpent > 0 && (
                    <span className="text-rose-500">
                      -{formatCurrency(group.totalSpent, currency)}
                    </span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-500">
                      +{formatCurrency(group.totalIncome, currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in Day */}
              <div className="theme-card rounded-2xl shadow-xs theme-border border divide-y theme-border overflow-hidden">
                {group.items.map((exp) => {
                  const isIncome = exp.type === 'income';
                  const isTransfer = exp.type === 'transfer';
                  const wallet = wallets.find((w) => w.id === exp.walletAccountId);
                  const destWallet = wallets.find((w) => w.id === exp.destinationWalletId);

                  return (
                    <div
                      key={exp.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:theme-bg-subtle transition-colors group cursor-pointer"
                      onClick={() => onSelectExpense(exp)}
                      id={`expense-row-${exp.id}`}
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        {isIncome ? (
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                        ) : isTransfer ? (
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                            <ArrowRightLeft className="w-4 h-4" />
                          </div>
                        ) : (
                          <CategoryIcon category={exp.category} size="md" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold theme-text-main truncate">
                              {exp.merchant}
                            </span>
                            {exp.receiptImage && (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">
                                OCR Receipt
                              </span>
                            )}
                            {exp.isSubscription && (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded flex items-center gap-0.5">
                                <Repeat className="w-2.5 h-2.5" />
                                Recurring
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] theme-text-secondary">
                            <span>{exp.category}</span>
                            <span>•</span>
                            <span>{exp.paymentMethod}</span>
                            {wallet && (
                              <>
                                <span>•</span>
                                <span className="theme-text-muted">{wallet.name}</span>
                              </>
                            )}
                            {isTransfer && destWallet && (
                              <>
                                <span>→</span>
                                <span className="theme-text-muted">{destWallet.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div
                            className={`text-xs sm:text-sm font-mono font-bold ${
                              isIncome
                                ? 'text-emerald-500'
                                : isTransfer
                                ? 'text-indigo-400'
                                : 'theme-text-main'
                            }`}
                          >
                            {isIncome ? '+' : isTransfer ? '↔' : '-'}
                            {formatCurrency(exp.amount, exp.currency || currency)}
                          </div>
                          {exp.items && exp.items.length > 0 && (
                            <span className="text-[10px] theme-text-muted">
                              {exp.items.length} line items
                            </span>
                          )}
                        </div>

                        {/* Hover Actions */}
                        <div
                          className="flex items-center gap-1 opacity-70 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onDuplicateExpense(exp)}
                            className="p-1 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
                            title="Duplicate Entry"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 text-rose-400/60 hover:text-rose-400 rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExpenses.map((exp) => {
            const isIncome = exp.type === 'income';
            const isTransfer = exp.type === 'transfer';
            const wallet = wallets.find((w) => w.id === exp.walletAccountId);

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="theme-card rounded-2xl p-4 shadow-xs theme-border border hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon category={exp.category} size="md" />
                      <div>
                        <h4 className="text-xs font-bold theme-text-main group-hover:text-emerald-500 transition-colors">
                          {exp.merchant}
                        </h4>
                        <span className="text-[10px] theme-text-muted">{formatDate(exp.date)}</span>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-mono font-bold ${
                        isIncome ? 'text-emerald-500' : 'theme-text-main'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(exp.amount, exp.currency || currency)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] theme-text-secondary">
                    <span className="px-2 py-0.5 rounded-md theme-bg-subtle theme-border border">
                      {exp.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md theme-bg-subtle theme-border border">
                      {exp.paymentMethod}
                    </span>
                    {wallet && (
                      <span className="px-2 py-0.5 rounded-md theme-bg-subtle theme-border border">
                        {wallet.name}
                      </span>
                    )}
                  </div>

                  {exp.notes && (
                    <p className="mt-2 text-[11px] theme-text-muted italic line-clamp-2">
                      "{exp.notes}"
                    </p>
                  )}
                </div>

                <div
                  className="mt-4 pt-2.5 border-t theme-border flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] theme-text-muted font-mono">{exp.time || ''}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1 theme-text-muted hover:theme-text-main rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 text-rose-400/70 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
