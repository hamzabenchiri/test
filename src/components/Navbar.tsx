import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Sparkles,
  Camera,
  Zap,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../utils/formatters';
import { AppTheme } from '../types';

interface Props {
  activeTab: 'overview' | 'expenses' | 'budgets' | 'advisor';
  onSelectTab: (tab: 'overview' | 'expenses' | 'budgets' | 'advisor') => void;
  onOpenScanner: () => void;
  onOpenNaturalLog: () => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  onResetSampleData: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenNaturalLog,
  currency,
  onChangeCurrency,
  onResetSampleData,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Subscriptions', icon: Wallet },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
  ] as const;

  return (
    <header className="sticky top-0 z-40 theme-nav backdrop-blur-md border-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold theme-text-main tracking-tight text-base sm:text-lg">
                    Qalta
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 rounded">
                    AI
                  </span>
                </div>
                <span className="text-[10px] theme-text-muted hidden sm:block">
                  Expense & Receipt Scanner
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 theme-bg-subtle p-1 rounded-xl theme-border border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'theme-bg-card text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs theme-border border'
                      : 'theme-text-secondary hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-500/10'
                  }`}
                  id={`nav-tab-${tab.id}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Switcher Toggle (Dark #0A0A0A vs Light #EBEBEB) */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl theme-bg-card theme-border border theme-text-secondary hover:text-emerald-500 shadow-xs transition-colors"
              title={isDark ? 'Switch to Light Mode (#EBEBEB)' : 'Switch to Dark Mode (#0A0A0A)'}
              id="theme-toggle-btn"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono font-medium hidden xl:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[11px] font-mono font-medium hidden xl:inline">Dark</span>
                </>
              )}
            </button>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
              className="theme-input border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              title="Change Currency"
            >
              {Object.keys(CURRENCY_SYMBOLS).map((c) => (
                <option key={c} value={c} className="theme-bg-card theme-text-main">
                  {c} ({CURRENCY_SYMBOLS[c]})
                </option>
              ))}
            </select>

            {/* Quick Log Natural */}
            <button
              onClick={onOpenNaturalLog}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-card hover:bg-slate-500/10 theme-border border theme-text-main text-xs font-medium shadow-xs transition-colors"
              id="header-quick-log-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Log</span>
            </button>

            {/* Scan Receipt Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              id="header-scan-receipt-btn"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Receipt</span>
            </button>

            {/* Reset Demo Data dropdown/button */}
            <button
              onClick={onResetSampleData}
              className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:bg-slate-500/10 transition-colors"
              title="Reset to sample demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 theme-border border-t overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
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

