import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Repeat,
  Calendar,
  Sparkles,
  Camera,
  RotateCcw,
  Sun,
  Moon,
  Building2,
  Mic,
} from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../utils/formatters';
import { AppTheme } from '../types';
import { SpenseLogo } from './SpenseLogo';

export type NavTabType =
  | 'overview'
  | 'expenses'
  | 'subscriptions'
  | 'calendar'
  | 'budgets'
  | 'advisor';

interface Props {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenVoice: () => void;
  onOpenScanner: () => void;
  onOpenNaturalLog: () => void;
  onOpenWallets?: () => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  onResetSampleData: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenVoice,
  onOpenScanner,
  onOpenNaturalLog,
  onOpenWallets,
  currency,
  onChangeCurrency,
  onResetSampleData,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Transactions', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'budgets', label: 'Budgets & Goals', icon: Wallet },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
  ] as const;

  return (
    <header className="sticky top-0 z-40 theme-nav backdrop-blur-md border-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Spense Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('overview')}
              className="cursor-pointer group flex items-center text-left bg-transparent border-0 p-0 focus:outline-none"
              id="spense-navbar-brand-btn"
            >
              <SpenseLogo size="md" showText={true} />
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 theme-bg-subtle p-1 rounded-2xl theme-border border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as NavTabType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'theme-bg-card text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs theme-border border'
                      : 'theme-text-secondary hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-500/10'
                  }`}
                  id={`nav-tab-${tab.id}`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Qalta Voice AI Quick Trigger */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
              title="Qalta Voice AI: Tap to speak spending"
              id="header-voice-ai-btn"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Wallets & Accounts Button */}
            {onOpenWallets && (
              <button
                onClick={onOpenWallets}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                id="header-wallets-btn"
                title="Manage Multi-Currency Accounts"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden xl:inline">Accounts</span>
              </button>
            )}

            {/* Theme Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl theme-bg-card theme-border border theme-text-secondary hover:text-emerald-500 shadow-xs transition-colors cursor-pointer"
              title={isDark ? 'Switch to Qalta Light Mode' : 'Switch to Qalta Dark Mode'}
              id="theme-toggle-btn"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono font-medium hidden 2xl:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[11px] font-mono font-medium hidden 2xl:inline">Dark</span>
                </>
              )}
            </button>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
              className="theme-input border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer font-mono font-medium"
              title="Change Currency"
            >
              {Object.keys(CURRENCY_SYMBOLS).map((c) => (
                <option key={c} value={c} className="theme-bg-card theme-text-main">
                  {c} ({CURRENCY_SYMBOLS[c]})
                </option>
              ))}
            </select>

            {/* Scan Receipt Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              id="header-scan-receipt-btn"
              title="Scan Receipt OCR"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Scan</span>
            </button>

            {/* Reset Demo Data button */}
            <button
              onClick={onResetSampleData}
              className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:bg-slate-500/10 transition-colors cursor-pointer"
              title="Reset sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden items-center justify-start py-2 theme-border border-t overflow-x-auto gap-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'theme-text-secondary hover:theme-text-main'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
