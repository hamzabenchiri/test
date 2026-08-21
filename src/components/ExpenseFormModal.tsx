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
} from 'lucide-react';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../utils/formatters';
import { AppTheme, Expense, ExpenseCategory, PaymentMethod, ReceiptItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'> | Expense) => void;
  expenseToEdit?: Expense | null;
  preferredCurrency?: string;
  theme?: AppTheme;
}

export const ExpenseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  preferredCurrency = 'USD',
  theme = 'dark',
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('12:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [currency, setCurrency] = useState<string>(preferredCurrency);
  const [subtotal, setSubtotal] = useState<number | undefined>(undefined);
  const [tax, setTax] = useState<number | undefined>(undefined);
  const [tip, setTip] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setMerchant(expenseToEdit.merchant);
        setAmount(expenseToEdit.amount);
        setCategory(expenseToEdit.category);
        setDate(expenseToEdit.date);
        setTime(expenseToEdit.time || '12:00');
        setPaymentMethod(expenseToEdit.paymentMethod);
        setCurrency(expenseToEdit.currency || preferredCurrency);
        setSubtotal(expenseToEdit.subtotal);
        setTax(expenseToEdit.tax);
        setTip(expenseToEdit.tip);
        setNotes(expenseToEdit.notes || '');
        setItems(expenseToEdit.items || []);
        setIsSubscription(Boolean(expenseToEdit.isSubscription));
        setSubscriptionFrequency(expenseToEdit.subscriptionFrequency || 'monthly');
        setTagsInput(expenseToEdit.tags?.join(', ') || '');
      } else {
        setMerchant('');
        setAmount(0);
        setCategory('Food & Dining');
        setDate(new Date().toISOString().slice(0, 10));
        setTime('12:00');
        setPaymentMethod('Apple Pay');
        setCurrency(preferredCurrency);
        setSubtotal(undefined);
        setTax(undefined);
        setTip(undefined);
        setNotes('');
        setItems([]);
        setIsSubscription(false);
        setSubscriptionFrequency('monthly');
        setTagsInput('');
      }
      setErrorMsg(null);
    }
  }, [isOpen, expenseToEdit, preferredCurrency]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleUpdateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      setErrorMsg('Please enter a merchant name.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Amount must be greater than 0.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const expensePayload: any = {
      merchant: merchant.trim(),
      amount: Number(amount),
      currency,
      category,
      date,
      time,
      paymentMethod,
      subtotal: subtotal ? Number(subtotal) : undefined,
      tax: tax ? Number(tax) : undefined,
      tip: tip ? Number(tip) : undefined,
      notes: notes.trim(),
      items: items.filter((it) => it.name.trim()),
      isSubscription,
      subscriptionFrequency: isSubscription ? subscriptionFrequency : undefined,
      tags: parsedTags,
      receiptImage: expenseToEdit?.receiptImage,
      receiptConfidence: expenseToEdit?.receiptConfidence,
    };

    if (expenseToEdit?.id) {
      expensePayload.id = expenseToEdit.id;
      expensePayload.createdAt = expenseToEdit.createdAt;
    }

    onSave(expensePayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-xl overflow-hidden my-8"
        id="expense-form-modal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border theme-bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold theme-text-main">
              {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">
                Merchant / Payee *
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Target, Amazon, Uber"
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-sm theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
                id="form-merchant-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">
                Total Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 theme-text-muted text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 theme-bg-subtle theme-border border rounded-xl text-sm theme-text-main font-semibold focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
                  id="form-amount-input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {ALL_PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtotal, Tax, Tip optional breakdown */}
          <div className="grid grid-cols-3 gap-2 theme-bg-subtle p-2.5 rounded-xl theme-border border">
            <div>
              <span className="block text-[10px] theme-text-muted">Subtotal</span>
              <input
                type="number"
                step="0.01"
                value={subtotal !== undefined ? subtotal : ''}
                onChange={(e) =>
                  setSubtotal(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="w-full bg-transparent text-xs theme-text-main font-mono focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[10px] theme-text-muted">Tax</span>
              <input
                type="number"
                step="0.01"
                value={tax !== undefined ? tax : ''}
                onChange={(e) =>
                  setTax(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="w-full bg-transparent text-xs theme-text-main font-mono focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[10px] theme-text-muted">Tip</span>
              <input
                type="number"
                step="0.01"
                value={tip !== undefined ? tip : ''}
                onChange={(e) =>
                  setTip(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="w-full bg-transparent text-xs theme-text-main font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Subscription / Recurring Toggle */}
          <div className="p-3 theme-bg-subtle rounded-xl theme-border border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Repeat className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <div>
                <span className="text-xs font-semibold theme-text-main block">
                  Recurring Subscription
                </span>
                <span className="text-[11px] theme-text-muted block">
                  Track in active subscriptions & monthly bills
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSubscription && (
                <select
                  value={subscriptionFrequency}
                  onChange={(e) => setSubscriptionFrequency(e.target.value as any)}
                  className="px-2 py-1 theme-bg-card theme-border border rounded text-xs theme-text-main shadow-xs"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isSubscription}
                onChange={(e) => setIsSubscription(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Notes & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">
                Notes / Memo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lunch with Sarah, Office supplies"
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. work, tax-deductible, vacation"
                className="w-full px-3 py-2 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Itemized lines */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-text-secondary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Line Items ({items.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-1.5 theme-bg-subtle rounded-xl theme-border border text-xs"
              >
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1 theme-bg-card theme-border border rounded-lg theme-text-main shadow-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={item.price || ''}
                  onChange={(e) =>
                    handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 px-2.5 py-1 theme-bg-card theme-border border rounded-lg text-right theme-text-main font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="theme-text-muted hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium theme-text-secondary hover:theme-text-main theme-bg-subtle hover:theme-bg-card theme-border border rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              id="submit-expense-form-btn"
            >
              <Check className="w-4 h-4" />
              {expenseToEdit ? 'Save Changes' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

