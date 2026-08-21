import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  Layers,
  Repeat,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Wallet,
} from 'lucide-react';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../utils/formatters';
import {
  AppTheme,
  Expense,
  ExpenseCategory,
  PaymentMethod,
  ReceiptItem,
  TransactionType,
  WalletAccount,
} from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'> | Expense) => void;
  expenseToEdit?: Expense | null;
  preferredCurrency?: string;
  wallets?: WalletAccount[];
  theme?: AppTheme;
  initialDate?: string;
}

export const ExpenseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  preferredCurrency = 'USD',
  wallets = [],
  theme = 'dark',
  initialDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [merchant, setMerchant] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('12:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Apple Pay');
  const [walletAccountId, setWalletAccountId] = useState<string>(wallets[0]?.id || '');
  const [destinationWalletId, setDestinationWalletId] = useState<string>(wallets[1]?.id || '');
  const [currency, setCurrency] = useState<string>(preferredCurrency);
  const [subtotal, setSubtotal] = useState<number | undefined>(undefined);
  const [tax, setTax] = useState<number | undefined>(undefined);
  const [tip, setTip] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setType(expenseToEdit.type || 'expense');
        setMerchant(expenseToEdit.merchant);
        setPayee(expenseToEdit.payee || '');
        setAmount(expenseToEdit.amount);
        setCategory(expenseToEdit.category);
        setDate(expenseToEdit.date);
        setTime(expenseToEdit.time || '12:00');
        setPaymentMethod(expenseToEdit.paymentMethod);
        setWalletAccountId(expenseToEdit.walletAccountId || wallets[0]?.id || '');
        setDestinationWalletId(expenseToEdit.destinationWalletId || wallets[1]?.id || '');
        setCurrency(expenseToEdit.currency || preferredCurrency);
        setSubtotal(expenseToEdit.subtotal);
        setTax(expenseToEdit.tax);
        setTip(expenseToEdit.tip);
        setNotes(expenseToEdit.notes || '');
        setItems(expenseToEdit.items || []);
        setIsSubscription(Boolean(expenseToEdit.isSubscription));
        setTagsInput(expenseToEdit.tags?.join(', ') || '');
      } else {
        setType('expense');
        setMerchant('');
        setPayee('');
        setAmount('');
        setCategory('Food & Dining');
        setDate(initialDate || new Date().toISOString().slice(0, 10));
        setTime(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        );
        setPaymentMethod('Apple Pay');
        setWalletAccountId(wallets[0]?.id || '');
        setDestinationWalletId(wallets[1]?.id || '');
        setCurrency(preferredCurrency);
        setSubtotal(undefined);
        setTax(undefined);
        setTip(undefined);
        setNotes('');
        setItems([]);
        setIsSubscription(false);
        setTagsInput('');
      }
      setErrorMsg(null);
    }
  }, [isOpen, expenseToEdit, preferredCurrency, initialDate, wallets]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleUpdateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      setErrorMsg('Merchant or description title is required.');
      return;
    }
    if (amount === '' || Number(amount) <= 0) {
      setErrorMsg('Amount must be greater than 0.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const expenseData = {
      type,
      merchant: merchant.trim(),
      payee: payee.trim() || undefined,
      amount: Number(amount),
      currency,
      category: type === 'income' ? 'Salary & Income' : category,
      date,
      time,
      paymentMethod,
      walletAccountId: walletAccountId || undefined,
      destinationWalletId: type === 'transfer' ? destinationWalletId : undefined,
      subtotal: subtotal ? Number(subtotal) : undefined,
      tax: tax ? Number(tax) : undefined,
      tip: tip ? Number(tip) : undefined,
      notes: notes.trim() || undefined,
      items: items.length > 0 ? items.filter((it) => it.name.trim()) : undefined,
      isSubscription,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (expenseToEdit) {
      onSave({
        ...expenseToEdit,
        ...expenseData,
      });
    } else {
      onSave(expenseData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-xl overflow-hidden my-8 animate-scale-up"
        id="expense-form-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div>
            <h2 className="text-base font-bold theme-text-main">
              {expenseToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs theme-text-secondary">
              Fineyo & Kelo unified multi-type ledger entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs (Expense / Income / Transfer) */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl theme-bg-subtle theme-border border">
            {[
              { id: 'expense', label: 'Expense', icon: ArrowUpRight, color: 'text-rose-500' },
              { id: 'income', label: 'Income', icon: ArrowDownLeft, color: 'text-emerald-500' },
              { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: 'text-indigo-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = type === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setType(tab.id as TransactionType)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'theme-bg-card theme-text-main shadow-xs theme-border border'
                      : 'theme-text-secondary hover:theme-text-main'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount & Merchant/Payee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">
                {type === 'transfer'
                  ? 'Transfer Title / Memo *'
                  : type === 'income'
                  ? 'Payer / Source Name *'
                  : 'Merchant / Payee *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  type === 'income'
                    ? 'e.g. Salary, Client Payout'
                    : type === 'transfer'
                    ? 'e.g. Move to Savings'
                    : 'e.g. Blue Bottle Coffee, Target'
                }
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono theme-text-muted">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Category & Payment / Wallet Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {type === 'expense' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {ALL_CATEGORIES.filter((c) => c !== 'Salary & Income').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Account (Wallet)</label>
                <select
                  value={walletAccountId}
                  onChange={(e) => setWalletAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === 'transfer' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">To Account</label>
                <select
                  value={destinationWalletId}
                  onChange={(e) => setDestinationWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === walletAccountId}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {ALL_PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
              />
            </div>
          </div>

          {/* Tags & Recurring flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. coffee, work, vacation"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            {type === 'expense' && (
              <div className="flex items-center justify-between p-3 rounded-xl theme-bg-subtle theme-border border mt-4">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium theme-text-main">Is Recurring Bill</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium theme-text-secondary">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Split with Sarah, business expense"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium theme-text-secondary hover:theme-text-main cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{expenseToEdit ? 'Save Changes' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
