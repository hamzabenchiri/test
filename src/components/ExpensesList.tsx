import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
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
} from 'lucide-react';
import { AppTheme, Expense, ExpenseCategory, PaymentMethod } from '../types';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  CATEGORY_CONFIG,
  exportExpensesToCSV,
  formatCurrency,
  formatDate,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  expenses: Expense[];
  currency: string;
  onOpenScanner: () => void;
  onOpenManualAdd: () => void;
  onSelectExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onDuplicateExpense: (expense: Expense) => void;
  theme?: AppTheme;
}

export const ExpensesList: React.FC<Props> = ({
  expenses,
  currency,
  onOpenScanner,
  onOpenManualAdd,
  onSelectExpense,
  onEditExpense,
  onDeleteExpense,
  onDuplicateExpense,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_7_days' | 'this_year'>('all');
  const [onlyReceipts, setOnlyReceipts] = useState(false);
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filter and sort logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMerchant = e.merchant.toLowerCase().includes(q);
        const matchNotes = e.notes?.toLowerCase().includes(q);
        const matchCategory = e.category.toLowerCase().includes(q);
        const matchItems = e.items?.some((it) => it.name.toLowerCase().includes(q));
        const matchTags = e.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchMerchant && !matchNotes && !matchCategory && !matchItems && !matchTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // Payment
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
      if (dateFilter === 'this_month') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (!e.date.startsWith(currentMonth)) return false;
      } else if (dateFilter === 'last_7_days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const d7Str = d.toISOString().slice(0, 10);
        if (e.date < d7Str) return false;
      } else if (dateFilter === 'this_year') {
        const currentYear = new Date().getFullYear().toString();
        if (!e.date.startsWith(currentYear)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, searchQuery, selectedCategory, selectedPayment, dateFilter, onlyReceipts, onlySubscriptions, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPayment('all');
    setDateFilter('all');
    setOnlyReceipts(false);
    setOnlySubscriptions(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedPayment !== 'all' ||
    dateFilter !== 'all' ||
    onlyReceipts ||
    onlySubscriptions;

  return (
    <div className="space-y-6 pb-12" id="expenses-list-view">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-text-main flex items-center gap-2">
            Expense Ledger
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full theme-bg-subtle theme-text-secondary theme-border border">
              {filteredExpenses.length} Records
            </span>
          </h2>
          <p className="text-xs theme-text-secondary">
            Total of current selection:{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {formatCurrency(totalFilteredAmount, currency)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportExpensesToCSV(filteredExpenses)}
            className="flex items-center gap-1.5 px-3 py-2 theme-bg-card hover:bg-slate-500/10 theme-border border rounded-xl theme-text-main text-xs font-medium shadow-xs transition-colors"
            title="Export to CSV"
            id="export-csv-btn"
          >
            <Download className="w-3.5 h-3.5 theme-text-muted" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            id="expenses-scan-receipt-btn"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>

          <button
            onClick={onOpenManualAdd}
            className="flex items-center gap-1.5 px-3 py-2 theme-bg-card hover:bg-slate-500/10 theme-border border theme-text-main text-xs font-medium rounded-xl shadow-xs transition-all"
            id="expenses-manual-add-btn"
          >
            <Plus className="w-3.5 h-3.5 theme-text-muted" />
            <span>Add Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl theme-bg-card theme-border border shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 theme-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, line item, tag, note..."
              className="w-full pl-9 pr-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              id="expense-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 theme-text-muted hover:theme-text-main"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
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
            className="px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center theme-bg-subtle rounded-xl p-1 theme-border border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'theme-bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'theme-text-muted hover:theme-text-main'
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'theme-bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'theme-text-muted hover:theme-text-main'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Chips & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t theme-border">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyReceipts(!onlyReceipts)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                onlyReceipts
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                  : 'theme-bg-subtle theme-text-secondary theme-border border hover:theme-text-main'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>With Receipt Scans</span>
            </button>

            <button
              onClick={() => setOnlySubscriptions(!onlySubscriptions)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                onlySubscriptions
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                  : 'theme-bg-subtle theme-text-secondary theme-border border hover:theme-text-main'
              }`}
            >
              <Repeat className="w-3 h-3" />
              <span>Subscriptions</span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-500 dark:text-rose-400 hover:opacity-80 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Expense Records List / Grid */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center theme-bg-card theme-border border rounded-2xl shadow-md space-y-3">
          <FileText className="w-10 h-10 mx-auto theme-text-muted" />
          <h3 className="text-sm font-semibold theme-text-main">No expenses matched your filter</h3>
          <p className="text-xs theme-text-secondary max-w-sm mx-auto">
            Try adjusting your search criteria or scan a new receipt to record transactions.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 theme-bg-subtle hover:bg-slate-500/10 theme-text-main text-xs font-medium rounded-lg transition-colors theme-border border"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Detailed List View */
        <div className="theme-bg-card theme-border border rounded-2xl overflow-hidden shadow-md">
          <div className="divide-y theme-border">
            {filteredExpenses.map((expense) => {
              const catConfig = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Miscellaneous'];
              return (
                <div
                  key={expense.id}
                  className="p-4 hover:theme-bg-subtle transition-colors flex items-center justify-between gap-4 group"
                >
                  {/* Left: Icon & Merchant & Details */}
                  <div
                    onClick={() => onSelectExpense(expense)}
                    className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${catConfig.color}15`,
                        borderColor: `${catConfig.color}30`,
                        color: catConfig.color,
                      }}
                    >
                      <CategoryIcon category={expense.category} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm theme-text-main truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {expense.merchant}
                        </span>
                        {expense.receiptImage && (
                          <span
                            className="px-1.5 py-0.5 rounded theme-bg-subtle text-emerald-600 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-0.5 theme-border border"
                            title="Receipt attached"
                          >
                            <FileText className="w-3 h-3" />
                            {expense.receiptConfidence && `${expense.receiptConfidence}%`}
                          </span>
                        )}
                        {expense.isSubscription && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20">
                            Sub
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs theme-text-secondary mt-0.5 truncate">
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{expense.paymentMethod}</span>
                        {expense.items && expense.items.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="theme-text-muted">{expense.items.length} items</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Quick Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm sm:text-base theme-text-main block">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                      {expense.tax ? (
                        <span className="text-[10px] theme-text-muted block">
                          Tax: ${expense.tax.toFixed(2)}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateExpense(expense)}
                        className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 theme-text-muted hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:theme-bg-subtle transition-colors"
                        title="Delete"
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
      ) : (
        /* Visual Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((expense) => {
            const catConfig = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Miscellaneous'];
            return (
              <div
                key={expense.id}
                className="p-4 rounded-2xl theme-bg-card theme-border border hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-md"
              >
                <div>
                  {/* Thumbnail / Header */}
                  {expense.receiptImage ? (
                    <div
                      onClick={() => onSelectExpense(expense)}
                      className="h-28 w-full bg-slate-900 rounded-xl overflow-hidden mb-3 relative cursor-pointer"
                    >
                      <img
                        src={expense.receiptImage}
                        alt={expense.merchant}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-500/30 shadow-sm">
                        {expense.receiptConfidence || 95}% OCR
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${catConfig.color}15`,
                          borderColor: `${catConfig.color}30`,
                          color: catConfig.color,
                        }}
                      >
                        <CategoryIcon category={expense.category} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold theme-text-main truncate max-w-[150px]">
                          {expense.merchant}
                        </h4>
                        <span className="text-[11px] theme-text-muted block">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm theme-text-main block">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                      <span className="text-[10px] theme-text-muted">{expense.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Notes / Items summary */}
                  {expense.notes && (
                    <p className="text-xs theme-text-secondary mt-2 line-clamp-2 italic">
                      "{expense.notes}"
                    </p>
                  )}

                  {expense.items && expense.items.length > 0 && (
                    <div className="mt-2 text-[11px] theme-text-secondary theme-bg-subtle p-2.5 rounded-xl theme-border border">
                      <div className="font-medium theme-text-main mb-1">
                        {expense.items.length} line items:
                      </div>
                      <div className="space-y-0.5">
                        {expense.items.slice(0, 2).map((it, i) => (
                          <div key={i} className="flex justify-between truncate">
                            <span className="truncate theme-text-secondary">{it.name}</span>
                            <span className="font-mono theme-text-main">${it.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {expense.items.length > 2 && (
                          <div className="text-[10px] theme-text-muted">
                            +{expense.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t theme-border text-xs">
                  <span className="theme-text-muted text-[11px]">{expense.category}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectExpense(expense)}
                      className="px-2.5 py-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 theme-bg-subtle hover:bg-slate-500/10 theme-border border rounded-md font-medium transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-1 theme-text-muted hover:theme-text-main rounded hover:theme-bg-subtle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1 theme-text-muted hover:text-rose-500 dark:hover:text-rose-400 rounded hover:theme-bg-subtle"
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
