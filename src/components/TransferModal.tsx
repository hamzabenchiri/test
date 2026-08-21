import React, { useState } from 'react';
import { ArrowRightLeft, X, Check, DollarSign } from 'lucide-react';
import { AppTheme, WalletAccount } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
  onExecuteTransfer: (
    sourceWalletId: string,
    destWalletId: string,
    amount: number,
    date: string,
    notes?: string
  ) => void;
}

export const TransferModal: React.FC<Props> = ({
  isOpen,
  onClose,
  wallets,
  currency,
  theme,
  onExecuteTransfer,
}) => {
  const [sourceWalletId, setSourceWalletId] = useState<string>(wallets[0]?.id || '');
  const [destWalletId, setDestWalletId] = useState<string>(wallets[1]?.id || wallets[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWalletId || !destWalletId) {
      setErrorMsg('Please select both source and destination accounts.');
      return;
    }
    if (sourceWalletId === destWalletId) {
      setErrorMsg('Source and destination accounts must be different.');
      return;
    }
    if (amount === '' || Number(amount) <= 0) {
      setErrorMsg('Please specify a positive transfer amount.');
      return;
    }

    setErrorMsg(null);
    onExecuteTransfer(sourceWalletId, destWalletId, Number(amount), date, notes.trim() || undefined);
    onClose();
  };

  const sourceWallet = wallets.find((w) => w.id === sourceWalletId);
  const destWallet = wallets.find((w) => w.id === destWalletId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-md overflow-hidden my-8 animate-scale-up"
        id="transfer-funds-modal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold theme-text-main">Transfer Funds</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium theme-text-secondary">Transfer Amount *</label>
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
                className="w-full pl-12 pr-3 py-2 text-sm rounded-xl theme-bg-subtle theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>
          </div>

          {/* From Account */}
          <div className="space-y-1">
            <label className="text-xs font-medium theme-text-secondary">From Account (Source)</label>
            <select
              value={sourceWalletId}
              onChange={(e) => setSourceWalletId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — Balance: {formatCurrency(w.balance, currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Arrow divider */}
          <div className="flex justify-center -my-1">
            <div className="w-7 h-7 rounded-full theme-bg-subtle theme-border border flex items-center justify-center text-indigo-400">
              <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>

          {/* To Account */}
          <div className="space-y-1">
            <label className="text-xs font-medium theme-text-secondary">To Account (Destination)</label>
            <select
              value={destWalletId}
              onChange={(e) => setDestWalletId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === sourceWalletId}>
                  {w.name} — Balance: {formatCurrency(w.balance, currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium theme-text-secondary">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Monthly savings"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
