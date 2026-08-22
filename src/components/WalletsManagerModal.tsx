import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Building2,
  PiggyBank,
  Banknote,
  TrendingUp,
  Coins,
  ArrowRightLeft,
  Check,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { AppTheme, WalletAccount, WalletType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
  onAddWallet: (wallet: Omit<WalletAccount, 'id'>) => void;
  onUpdateWallet: (wallet: WalletAccount) => void;
  onDeleteWallet: (id: string) => void;
  onOpenTransfer: () => void;
}

export const WalletsManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  wallets,
  currency,
  theme,
  onAddWallet,
  onUpdateWallet,
  onDeleteWallet,
  onOpenTransfer,
}) => {
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('checking');
  const [balance, setBalance] = useState<number | ''>('');
  const [color, setColor] = useState('#D2AF26');
  const [accountNumberMask, setAccountNumberMask] = useState('');

  if (!isOpen) return null;

  // Net worth calculation (Assets minus liabilities/credit cards)
  const totalAssets = wallets
    .filter((w) => w.type !== 'credit')
    .reduce((sum, w) => sum + Math.max(0, w.balance), 0);

  const totalLiabilities = wallets
    .filter((w) => w.type === 'credit')
    .reduce((sum, w) => sum + Math.abs(Math.min(0, w.balance)), 0);

  const netWorth = totalAssets - totalLiabilities;

  const openAddForm = () => {
    setEditingWallet(null);
    setName('');
    setType('checking');
    setBalance('');
    setColor('#D2AF26');
    setAccountNumberMask('');
    setIsFormOpen(true);
  };

  const openEditForm = (wallet: WalletAccount) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    setType(wallet.type);
    setBalance(wallet.balance);
    setColor(wallet.color || '#D2AF26');
    setAccountNumberMask(wallet.accountNumberMask || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || balance === '') return;

    const data = {
      name: name.trim(),
      type,
      balance: Number(balance),
      currency,
      color,
      icon:
        type === 'savings'
          ? 'PiggyBank'
          : type === 'credit'
          ? 'CreditCard'
          : type === 'cash'
          ? 'Banknote'
          : type === 'investment'
          ? 'TrendingUp'
          : 'Building2',
      accountNumberMask: accountNumberMask.trim() || undefined,
    };

    if (editingWallet) {
      onUpdateWallet({
        ...editingWallet,
        ...data,
      });
    } else {
      onAddWallet(data);
    }

    setIsFormOpen(false);
  };

  const getWalletIcon = (wType: WalletType) => {
    switch (wType) {
      case 'savings':
        return PiggyBank;
      case 'credit':
        return CreditCard;
      case 'cash':
        return Banknote;
      case 'investment':
        return TrendingUp;
      case 'crypto':
        return Coins;
      default:
        return Building2;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-xl overflow-hidden my-8 animate-scale-up"
        id="wallets-manager-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D2AF26]/10 border border-[#D2AF26]/20 flex items-center justify-center text-[#a38514] dark:text-[#D2AF26]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold theme-text-main font-brand-serif">Accounts & Wallets</h2>
              <p className="text-xs theme-text-secondary">Manage bank accounts, cards, cash & net worth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Net Worth Summary Bar */}
        <div className="px-6 py-4 bg-[#D2AF26]/5 border-b theme-border grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] theme-text-muted uppercase tracking-wider block">
              Total Assets
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#a38514] dark:text-[#D2AF26]">
              {formatCurrency(totalAssets, currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] theme-text-muted uppercase tracking-wider block">
              Liabilities / Debt
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-rose-500">
              {formatCurrency(totalLiabilities, currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] theme-text-muted uppercase tracking-wider block">
              Net Worth
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono theme-text-main">
              {formatCurrency(netWorth, currency)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold theme-text-main">Your Accounts ({wallets.length})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-subtle hover:theme-bg-card theme-border border text-xs font-medium theme-text-main transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#D2AF26]" />
                <span>Transfer Funds</span>
              </button>
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>
            </div>
          </div>

          {/* Form inside Modal if open */}
          {isFormOpen && (
            <form
              onSubmit={handleSave}
              className="p-4 rounded-xl theme-bg-subtle theme-border border space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b theme-border">
                <span className="text-xs font-bold theme-text-main">
                  {editingWallet ? 'Edit Account' : 'Add New Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs theme-text-muted hover:theme-text-main"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chase Checking"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg theme-bg-card theme-border border theme-text-main focus:outline-none focus:border-[#D2AF26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium">Account Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WalletType)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg theme-bg-card theme-border border theme-text-main focus:outline-none focus:border-[#D2AF26] cursor-pointer"
                  >
                    <option value="checking">Checking / Bank</option>
                    <option value="savings">Savings / High-Yield</option>
                    <option value="credit">Credit Card</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="investment">Investment / Brokerage</option>
                    <option value="crypto">Crypto Wallet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium">Current Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg theme-bg-card theme-border border theme-text-main font-mono font-bold focus:outline-none focus:border-[#D2AF26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium">Mask / Last 4 digits</label>
                  <input
                    type="text"
                    placeholder="e.g. •••• 4129"
                    value={accountNumberMask}
                    onChange={(e) => setAccountNumberMask(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg theme-bg-card theme-border border theme-text-main focus:outline-none focus:border-[#D2AF26]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                >
                  Save Account
                </button>
              </div>
            </form>
          )}

          {/* Wallets List */}
          <div className="space-y-2.5">
            {wallets.map((w) => {
              const IconComponent = getWalletIcon(w.type);
              const isCredit = w.type === 'credit';

              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-xl theme-bg-subtle theme-border border hover:theme-bg-card transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-950 font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: w.color || '#D2AF26' }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold theme-text-main">{w.name}</span>
                        {w.isDefault && (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] theme-text-muted capitalize">
                        {w.type} {w.accountNumberMask ? `(${w.accountNumberMask})` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`text-xs sm:text-sm font-mono font-bold ${
                          isCredit && w.balance < 0 ? 'text-rose-500' : 'theme-text-main'
                        }`}
                      >
                        {formatCurrency(w.balance, w.currency || currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => openEditForm(w)}
                        className="p-1 theme-text-muted hover:theme-text-main rounded hover:theme-bg-subtle transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {wallets.length > 1 && (
                        <button
                          onClick={() => onDeleteWallet(w.id)}
                          className="p-1 text-rose-400/60 hover:text-rose-400 rounded hover:theme-bg-subtle transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
