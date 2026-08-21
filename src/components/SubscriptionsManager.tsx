import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Edit2,
  X,
  Zap,
} from 'lucide-react';
import {
  AppTheme,
  BillingCycle,
  ExpenseCategory,
  PaymentMethod,
  Subscription,
  SubscriptionStatus,
  WalletAccount,
} from '../types';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  formatCurrency,
  formatDate,
  formatShortDate,
  getDaysUntilDate,
  getSubscriptionAnnualCost,
  getSubscriptionMonthlyCost,
} from '../utils/formatters';
import { POPULAR_SUBSCRIPTION_TEMPLATES } from '../data/sampleData';

interface Props {
  subscriptions: Subscription[];
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
  onAddSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onUpdateSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  onLogRenewalExpense?: (sub: Subscription) => void;
}

export const SubscriptionsManager: React.FC<Props> = ({
  subscriptions,
  wallets,
  currency,
  theme,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onLogRenewalExpense,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'trials' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Subscriptions');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().slice(0, 10));
  const [walletAccountId, setWalletAccountId] = useState<string>(wallets[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Apple Pay');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [freeTrialEndDate, setFreeTrialEndDate] = useState('');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const trialSubs = subscriptions.filter((s) => s.isFreeTrial && s.status === 'active');
  const pausedSubs = subscriptions.filter((s) => s.status === 'paused' || s.status === 'cancelled');

  const totalMonthlyCost = activeSubs.reduce((sum, s) => sum + getSubscriptionMonthlyCost(s), 0);
  const totalAnnualCost = totalMonthlyCost * 12;

  // Filtered List
  const filteredSubs = subscriptions.filter((sub) => {
    if (activeFilter === 'active' && sub.status !== 'active') return false;
    if (activeFilter === 'trials' && (!sub.isFreeTrial || sub.status !== 'active')) return false;
    if (activeFilter === 'paused' && sub.status === 'active') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sub.name.toLowerCase().includes(q) ||
        sub.category.toLowerCase().includes(q) ||
        (sub.notes && sub.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort by upcoming billing date
  const sortedSubs = [...filteredSubs].sort((a, b) => {
    const daysA = getDaysUntilDate(a.isFreeTrial && a.freeTrialEndDate ? a.freeTrialEndDate : a.nextBillingDate);
    const daysB = getDaysUntilDate(b.isFreeTrial && b.freeTrialEndDate ? b.freeTrialEndDate : b.nextBillingDate);
    return daysA - daysB;
  });

  const openNewSubModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setCategory('Subscriptions');
    setBillingCycle('monthly');
    setNextBillingDate(new Date().toISOString().slice(0, 10));
    setWalletAccountId(wallets[0]?.id || '');
    setPaymentMethod('Apple Pay');
    setStatus('active');
    setIsFreeTrial(false);
    setFreeTrialEndDate('');
    setReminderDaysBefore(3);
    setNotes('');
    setWebsiteUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount);
    setCategory(sub.category);
    setBillingCycle(sub.billingCycle);
    setNextBillingDate(sub.nextBillingDate);
    setWalletAccountId(sub.walletAccountId || wallets[0]?.id || '');
    setPaymentMethod(sub.paymentMethod);
    setStatus(sub.status);
    setIsFreeTrial(sub.isFreeTrial);
    setFreeTrialEndDate(sub.freeTrialEndDate || '');
    setReminderDaysBefore(sub.reminderDaysBefore || 3);
    setNotes(sub.notes || '');
    setWebsiteUrl(sub.websiteUrl || '');
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tpl: (typeof POPULAR_SUBSCRIPTION_TEMPLATES)[0]) => {
    setName(tpl.name);
    setAmount(tpl.defaultAmount);
    setCategory(tpl.category);
    setBillingCycle(tpl.billingCycle);
    setWebsiteUrl(tpl.websiteUrl);
    setIsTemplatesOpen(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount === '' || Number(amount) < 0) return;

    const subData = {
      name: name.trim(),
      amount: Number(amount),
      currency,
      category,
      billingCycle,
      nextBillingDate,
      walletAccountId,
      paymentMethod,
      status,
      isFreeTrial,
      freeTrialEndDate: isFreeTrial ? freeTrialEndDate : undefined,
      reminderDaysBefore,
      notes: notes.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
    };

    if (editingSub) {
      onUpdateSubscription({
        ...editingSub,
        ...subData,
      });
    } else {
      onAddSubscription(subData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="subscriptions-manager-view">
      {/* Header & Subo Style Projections */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text-main tracking-tight flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-emerald-500" />
            Subscriptions & Recurring Hub
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            Track active plans, upcoming renewals, free trial expirations, and annualized commitments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplatesOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="browse-sub-templates-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Services</span>
          </button>

          <button
            onClick={openNewSubModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            id="add-new-subscription-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Subo-Style Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Cost */}
        <div className="theme-card p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-secondary">Monthly Recurring</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(totalMonthlyCost, currency)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>Across {activeSubs.length} active subscriptions</span>
          </div>
        </div>

        {/* Annualized Cost */}
        <div className="theme-card p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-secondary">Annualized Cost</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(totalAnnualCost, currency)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>Projected 12-month commitment</span>
          </div>
        </div>

        {/* Free Trials in Progress */}
        <div className="theme-card p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-secondary">Free Trials Active</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {trialSubs.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
            {trialSubs.length > 0 ? (
              <span>⚠️ Review before automatic rollover</span>
            ) : (
              <span className="theme-text-muted">No pending trials</span>
            )}
          </div>
        </div>

        {/* Average per Plan */}
        <div className="theme-card p-5 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium theme-text-secondary">Avg Plan Cost</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold theme-text-main font-mono mt-3">
            {formatCurrency(activeSubs.length > 0 ? totalMonthlyCost / activeSubs.length : 0, currency)}
            <span className="text-xs theme-text-muted font-sans font-normal"> /mo</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] theme-text-muted mt-2">
            <span>{pausedSubs.length} paused/cancelled plans</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 theme-bg-subtle p-1 rounded-xl theme-border border w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${subscriptions.length})` },
            { id: 'active', label: `Active (${activeSubs.length})` },
            { id: 'trials', label: `Free Trials (${trialSubs.length})` },
            { id: 'paused', label: `Paused (${pausedSubs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'theme-bg-card theme-text-main font-semibold shadow-xs theme-border border'
                  : 'theme-text-secondary hover:theme-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl theme-bg-card theme-border border theme-text-main placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Subscriptions Grid */}
      {sortedSubs.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center theme-border border">
          <Repeat className="w-10 h-10 mx-auto theme-text-muted mb-3 opacity-50" />
          <h3 className="text-sm font-semibold theme-text-main">No subscriptions found</h3>
          <p className="text-xs theme-text-secondary mt-1 max-w-sm mx-auto">
            Add recurring memberships, streaming subscriptions, or SaaS tools to track automatic renewal dates.
          </p>
          <button
            onClick={openNewSubModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSubs.map((sub) => {
            const isTrial = sub.isFreeTrial && sub.status === 'active';
            const renewalTargetDate = isTrial && sub.freeTrialEndDate ? sub.freeTrialEndDate : sub.nextBillingDate;
            const daysLeft = getDaysUntilDate(renewalTargetDate);
            const isUrgent = daysLeft <= (sub.reminderDaysBefore || 3) && daysLeft >= 0;
            const isOverdue = daysLeft < 0;
            const wallet = wallets.find((w) => w.id === sub.walletAccountId);

            return (
              <div
                key={sub.id}
                className={`theme-card rounded-2xl p-5 relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group ${
                  isTrial ? 'border-amber-500/40' : isUrgent ? 'border-emerald-500/40' : ''
                }`}
                id={`subscription-card-${sub.id}`}
              >
                <div>
                  {/* Top Row: Name, Status & Cost */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: sub.color || '#10b981' }}
                      >
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold theme-text-main tracking-tight leading-snug">
                          {sub.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] theme-text-muted capitalize">
                            {sub.billingCycle}
                          </span>
                          <span className="text-[10px] theme-text-muted">•</span>
                          <span className="text-[10px] theme-text-secondary">{sub.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono theme-text-main">
                        {formatCurrency(sub.amount, sub.currency || currency)}
                      </div>
                      <span className="text-[10px] theme-text-muted">
                        /{sub.billingCycle === 'monthly' ? 'mo' : sub.billingCycle === 'yearly' ? 'yr' : 'cycle'}
                      </span>
                    </div>
                  </div>

                  {/* Free Trial or Renewal Countdown Badge */}
                  <div className="mt-4">
                    {isTrial ? (
                      <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>
                            {daysLeft === 0
                              ? 'Trial ends TODAY'
                              : daysLeft === 1
                              ? 'Trial ends TOMORROW'
                              : `Trial ends in ${daysLeft} days`}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-mono">
                          {formatShortDate(sub.freeTrialEndDate || '')}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs ${
                          isUrgent
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'theme-bg-subtle theme-border border theme-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 opacity-75" />
                          <span>
                            {isOverdue
                              ? `Renewed ${Math.abs(daysLeft)}d ago`
                              : daysLeft === 0
                              ? 'Renews TODAY'
                              : daysLeft === 1
                              ? 'Renews TOMORROW'
                              : `Renews in ${daysLeft} days`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">
                          {formatShortDate(sub.nextBillingDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes / Account metadata */}
                  <div className="mt-3 space-y-1.5 text-xs theme-text-secondary">
                    {wallet && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="theme-text-muted">Paid from:</span>
                        <span className="font-medium theme-text-main">{wallet.name}</span>
                      </div>
                    )}
                    {sub.notes && (
                      <p className="text-[11px] theme-text-muted italic line-clamp-1">
                        "{sub.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 theme-border border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Status indicator button */}
                    <button
                      onClick={() =>
                        onUpdateSubscription({
                          ...sub,
                          status: sub.status === 'active' ? 'paused' : 'active',
                        })
                      }
                      className="p-1.5 rounded-lg theme-text-muted hover:theme-text-main hover:theme-bg-subtle transition-colors cursor-pointer"
                      title={sub.status === 'active' ? 'Pause subscription' : 'Activate subscription'}
                    >
                      {sub.status === 'active' ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 rounded-lg theme-text-muted hover:theme-text-main hover:theme-bg-subtle transition-colors cursor-pointer"
                      title="Edit Subscription"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteSubscription(sub.id)}
                      className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-500 hover:theme-bg-subtle transition-colors cursor-pointer"
                      title="Delete Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Manual Log Renewal to ledger */}
                  {onLogRenewalExpense && sub.status === 'active' && (
                    <button
                      onClick={() => onLogRenewalExpense(sub)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Record this payment in transactions ledger"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Log Charge</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popular Subscriptions Catalog Drawer / Modal */}
      {isTemplatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-xl overflow-hidden my-8 animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold theme-text-main">Popular Service Templates</h2>
              </div>
              <button
                onClick={() => setIsTemplatesOpen(false)}
                className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              <p className="text-xs theme-text-secondary">
                Select a service below to pre-fill billing details, official category, and default pricing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {POPULAR_SUBSCRIPTION_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="flex items-center justify-between p-3 rounded-xl theme-bg-subtle hover:theme-bg-card theme-border border hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: tpl.color }}
                      >
                        {tpl.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold theme-text-main group-hover:text-emerald-500 transition-colors">
                          {tpl.name}
                        </div>
                        <div className="text-[10px] theme-text-muted">{tpl.category}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold theme-text-main">
                        {formatCurrency(tpl.defaultAmount, currency)}
                      </div>
                      <span className="text-[9px] theme-text-muted">/mo</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-lg overflow-hidden my-8 animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
              <h2 className="text-base font-bold theme-text-main flex items-center gap-2">
                <Repeat className="w-5 h-5 text-emerald-500" />
                {editingSub ? 'Edit Subscription' : 'New Subscription & Recurring Bill'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Name & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Service / Subscription Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Spotify, Gym"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Cost per Cycle *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main font-mono font-semibold focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Billing Cycle & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly (every 3 months)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next Billing Date & Renewal Alert Lead-Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Next Renewal / Billing Date</label>
                  <input
                    type="date"
                    required
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Renewal Warning Lead Time</label>
                  <select
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                  >
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>7 days before (1 week)</option>
                  </select>
                </div>
              </div>

              {/* Free Trial Toggle (Subo Feature) */}
              <div className="p-3.5 rounded-xl theme-bg-subtle theme-border border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold theme-text-main flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Free Trial Tracker
                    </span>
                    <p className="text-[10px] theme-text-secondary">
                      Alert me before this free trial converts into a paid recurring plan
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFreeTrial}
                    onChange={(e) => setIsFreeTrial(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {isFreeTrial && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Free Trial Expiration Date
                    </label>
                    <input
                      type="date"
                      required={isFreeTrial}
                      value={freeTrialEndDate}
                      onChange={(e) => setFreeTrialEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl theme-bg-card theme-border border theme-text-main focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                    />
                  </div>
                )}
              </div>

              {/* Wallet Account & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium theme-text-secondary">Funding Wallet / Account</label>
                  <select
                    value={walletAccountId}
                    onChange={(e) => setWalletAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatCurrency(w.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium theme-text-secondary">Notes & Cancellation Link</label>
                <input
                  type="text"
                  placeholder="e.g. Shared with roommates, cancel if unused"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-bg-subtle theme-border border theme-text-main focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium theme-text-secondary hover:theme-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  {editingSub ? 'Save Changes' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
