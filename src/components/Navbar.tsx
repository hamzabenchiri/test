import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Repeat,
  Calendar,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Building2,
  Settings,
  X,
  Check,
  Globe,
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
  showVoiceBanner?: boolean;
  onToggleVoiceBanner?: () => void;
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
  showVoiceBanner = true,
  onToggleVoiceBanner,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

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
              <SpenseLogo size="md" showText={true} showIcon={false} />
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
                      ? 'theme-bg-card text-[#9a7d13] dark:text-[#D2AF26] font-semibold shadow-xs border border-[#D2AF26]/30 dark:border-[#D2AF26]/40'
                      : 'theme-text-secondary hover:text-[#9a7d13] dark:hover:text-[#D2AF26] hover:bg-stone-500/10'
                  }`}
                  id={`nav-tab-${tab.id}`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#9a7d13] dark:text-[#D2AF26]' : 'theme-text-muted'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 relative" ref={settingsRef}>
            {/* Wallets & Accounts Button */}
            {onOpenWallets && (
              <button
                onClick={onOpenWallets}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl theme-bg-card theme-border border hover:theme-bg-subtle theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                id="header-wallets-btn"
                title="Manage Multi-Currency Accounts"
              >
                <Building2 className="w-3.5 h-3.5 text-[#D2AF26]" />
                <span className="hidden xl:inline">Accounts</span>
              </button>
            )}

            {/* Single Settings Button */}
            <button
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl theme-bg-card theme-border border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isSettingsOpen
                  ? 'border-[#D2AF26] text-[#9a7d13] dark:text-[#D2AF26] ring-2 ring-[#D2AF26]/20'
                  : 'theme-text-secondary hover:theme-text-main hover:theme-bg-subtle'
              }`}
              id="header-settings-btn"
              title="Settings & Preferences"
              aria-label="Settings"
            >
              <Settings className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Settings Dropdown Popover */}
            {isSettingsOpen && (
              <div
                className="absolute right-0 top-12 w-72 rounded-2xl theme-bg-card theme-border border shadow-2xl p-4 z-50 animate-fade-in space-y-4"
                id="header-settings-dropdown"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b theme-border pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-[#D2AF26]" />
                    <h3 className="text-xs font-bold theme-text-main font-brand-serif">Settings & Preferences</h3>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold theme-text-secondary">Appearance Theme</span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl theme-bg-subtle theme-border border">
                    <button
                      onClick={() => {
                        if (isDark) onToggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        !isDark
                          ? 'theme-bg-card theme-text-main shadow-xs font-bold'
                          : 'theme-text-secondary hover:theme-text-main'
                      }`}
                    >
                      <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-[#9a7d13]' : ''}`} />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!isDark) onToggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isDark
                          ? 'theme-bg-card text-[#D2AF26] shadow-xs font-bold'
                          : 'theme-text-secondary hover:theme-text-main'
                      }`}
                    >
                      <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-[#D2AF26]' : ''}`} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Currency Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold theme-text-secondary flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#D2AF26]" />
                      <span>Primary Currency</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#9a7d13] dark:text-[#D2AF26] font-bold">
                      {currency} ({CURRENCY_SYMBOLS[currency] || '$'})
                    </span>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => onChangeCurrency(e.target.value)}
                    className="w-full theme-input border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D2AF26] shadow-xs cursor-pointer font-mono font-medium"
                    id="settings-currency-select"
                  >
                    {Object.keys(CURRENCY_SYMBOLS).map((c) => (
                      <option key={c} value={c} className="theme-bg-card theme-text-main">
                        {c} — {CURRENCY_SYMBOLS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice AI Banner Visibility Preference */}
                {onToggleVoiceBanner && (
                  <div className="border-t theme-border pt-3 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-semibold theme-text-main block">
                        Voice AI Hero Banner
                      </span>
                      <span className="text-[10px] theme-text-muted block">
                        {showVoiceBanner ? 'Visible on Overview' : 'Hidden from Overview'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleVoiceBanner}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showVoiceBanner ? 'bg-[#D2AF26]' : 'theme-bg-muted'
                      }`}
                      id="settings-toggle-voice-banner"
                      role="switch"
                      aria-checked={showVoiceBanner}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          showVoiceBanner ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Reset Data Option */}
                <div className="border-t theme-border pt-3">
                  <button
                    onClick={() => {
                      onResetSampleData();
                      setIsSettingsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl theme-bg-subtle hover:bg-rose-500/10 theme-border border hover:border-rose-500/30 text-rose-500 text-xs font-semibold transition-colors cursor-pointer"
                    id="settings-reset-demo-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </div>
            )}
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
                    ? 'bg-[#D2AF26] text-stone-950 font-bold shadow-xs'
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
