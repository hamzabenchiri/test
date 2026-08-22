import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Repeat,
  DollarSign,
  AlertCircle,
  Plus,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  CalendarCheck2,
} from 'lucide-react';
import { AppTheme, Expense, Subscription } from '../types';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getDaysUntilDate,
} from '../utils/formatters';

interface Props {
  expenses: Expense[];
  subscriptions: Subscription[];
  currency: string;
  theme: AppTheme;
  onSelectExpense?: (expense: Expense) => void;
  onQuickAddExpenseForDate?: (date: string) => void;
}

export const PaymentCalendar: React.FC<Props> = ({
  expenses,
  subscriptions,
  currency,
  theme,
  onSelectExpense,
  onQuickAddExpenseForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.toISOString().slice(0, 10));
  };

  // Generate days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Aggregate expenses and subscriptions by date
  const eventsByDate: Record<
    string,
    {
      expenses: Expense[];
      renewals: Subscription[];
      trials: Subscription[];
      totalSpent: number;
      totalIncome: number;
    }
  > = {};

  // Map expenses
  for (const exp of expenses) {
    if (!eventsByDate[exp.date]) {
      eventsByDate[exp.date] = {
        expenses: [],
        renewals: [],
        trials: [],
        totalSpent: 0,
        totalIncome: 0,
      };
    }
    eventsByDate[exp.date].expenses.push(exp);
    if (!exp.type || exp.type === 'expense') {
      eventsByDate[exp.date].totalSpent += exp.amount;
    } else if (exp.type === 'income') {
      eventsByDate[exp.date].totalIncome += exp.amount;
    }
  }

  // Map subscriptions upcoming renewals and trials
  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;

    // Map next billing date
    const rDate = sub.nextBillingDate;
    if (rDate) {
      if (!eventsByDate[rDate]) {
        eventsByDate[rDate] = {
          expenses: [],
          renewals: [],
          trials: [],
          totalSpent: 0,
          totalIncome: 0,
        };
      }
      eventsByDate[rDate].renewals.push(sub);
    }

    // Map free trial expiration
    if (sub.isFreeTrial && sub.freeTrialEndDate) {
      const tDate = sub.freeTrialEndDate;
      if (!eventsByDate[tDate]) {
        eventsByDate[tDate] = {
          expenses: [],
          renewals: [],
          trials: [],
          totalSpent: 0,
          totalIncome: 0,
        };
      }
      eventsByDate[tDate].trials.push(sub);
    }
  }

  // Selected Day Details
  const selectedDayData = eventsByDate[selectedDay] || {
    expenses: [],
    renewals: [],
    trials: [],
    totalSpent: 0,
    totalIncome: 0,
  };

  const isToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dateStr === todayStr;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="payment-calendar-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text-main tracking-tight flex items-center gap-2.5 font-brand-serif">
            <CalendarIcon className="w-6 h-6 text-[#D2AF26]" />
            Payment & Recurring Calendar
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            Day-by-day cash flow ledger, subscription renewals, and bill deadlines
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl theme-bg-card theme-border border theme-text-main text-xs font-semibold hover:theme-bg-subtle shadow-xs transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-1 theme-bg-card theme-border border rounded-xl p-1 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 theme-text-secondary hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold theme-text-main px-2 min-w-28 text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 theme-text-secondary hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 theme-card rounded-2xl p-5 shadow-xs theme-border border">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Prev month fill */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const dayNum = prevMonthTotalDays - firstDayIndex + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-18 p-1.5 rounded-xl theme-bg-subtle/40 opacity-30 text-[10px] text-stone-400 select-none"
                >
                  <span>{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const data = eventsByDate[dateStr];
              const isSelected = selectedDay === dateStr;
              const hasSpend = data && data.totalSpent > 0;
              const hasIncome = data && data.totalIncome > 0;
              const hasRenewals = data && data.renewals.length > 0;
              const hasTrials = data && data.trials.length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`min-h-18 p-1.5 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer relative border ${
                    isSelected
                      ? 'border-[#D2AF26] ring-2 ring-[#D2AF26]/20 theme-bg-card'
                      : isToday(dateStr)
                      ? 'border-[#D2AF26]/40 theme-bg-card'
                      : 'theme-border hover:theme-bg-subtle theme-bg-card'
                  }`}
                  id={`cal-day-${dateStr}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] font-bold rounded-md px-1 ${
                        isToday(dateStr)
                          ? 'bg-[#D2AF26] text-stone-950'
                          : 'theme-text-main'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicators */}
                    <div className="flex items-center gap-1">
                      {hasTrials && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-[#D2AF26]"
                          title="Free Trial Expiration"
                        />
                      )}
                      {hasRenewals && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-stone-400"
                          title="Subscription Renewal"
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges / Amounts */}
                  <div className="space-y-0.5 mt-1 w-full">
                    {hasSpend && (
                      <div className="text-[10px] font-mono font-semibold text-rose-500/90 truncate leading-none">
                        -{formatCurrency(data.totalSpent, currency)}
                      </div>
                    )}
                    {hasIncome && (
                      <div className="text-[10px] font-mono font-semibold text-[#a38514] dark:text-[#D2AF26] truncate leading-none">
                        +{formatCurrency(data.totalIncome, currency)}
                      </div>
                    )}
                    {hasRenewals && (
                      <div className="text-[9px] theme-text-secondary truncate flex items-center gap-0.5 leading-none">
                        <Repeat className="w-2.5 h-2.5 shrink-0 text-[#D2AF26]" />
                        <span>{data.renewals[0].name}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        <div className="theme-card rounded-2xl p-5 shadow-xs theme-border border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div>
                <span className="text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                  Date Ledger
                </span>
                <h2 className="text-base font-bold theme-text-main font-brand-serif">
                  {formatDate(selectedDay)}
                </h2>
              </div>

              {onQuickAddExpenseForDate && (
                <button
                  onClick={() => onQuickAddExpenseForDate(selectedDay)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#D2AF26]/10 hover:bg-[#D2AF26]/20 text-[#a38514] dark:text-[#D2AF26] border border-[#D2AF26]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Add transaction on this date"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log on Date</span>
                </button>
              )}
            </div>

            {/* Daily Net Flow */}
            <div className="grid grid-cols-2 gap-3 py-4 border-b theme-border">
              <div>
                <span className="text-[10px] theme-text-muted block">Total Spent</span>
                <span className="text-sm font-bold font-mono text-rose-500">
                  {formatCurrency(selectedDayData.totalSpent, currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] theme-text-muted block">Income / Inflow</span>
                <span className="text-sm font-bold font-mono text-[#a38514] dark:text-[#D2AF26]">
                  {formatCurrency(selectedDayData.totalIncome, currency)}
                </span>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {/* Free Trial Warning Alert */}
              {selectedDayData.trials.map((trial) => (
                <div
                  key={trial.id}
                  className="p-3 rounded-xl bg-[#D2AF26]/10 border border-[#D2AF26]/30 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[#a38514] dark:text-[#D2AF26] font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      Free Trial Ends
                    </span>
                    <span className="font-mono">{formatCurrency(trial.amount, currency)}/mo</span>
                  </div>
                  <p className="text-[11px] theme-text-secondary">
                    <strong>{trial.name}</strong> will auto-renew into paid subscription.
                  </p>
                </div>
              ))}

              {/* Scheduled Renewals */}
              {selectedDayData.renewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="p-3 rounded-xl theme-bg-subtle theme-border border space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold theme-text-main">
                    <span className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-[#D2AF26]" />
                      {renewal.name}
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(renewal.amount, currency)}
                    </span>
                  </div>
                  <span className="text-[10px] theme-text-muted block">
                    Scheduled Recurring Renewal ({renewal.billingCycle})
                  </span>
                </div>
              ))}

              {/* Transactions on this date */}
              {selectedDayData.expenses.map((exp) => {
                const isIncome = exp.type === 'income';
                return (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExpense?.(exp)}
                    className="p-3 rounded-xl theme-bg-subtle theme-border border hover:border-[#D2AF26]/40 transition-all cursor-pointer text-xs group"
                  >
                    <div className="flex items-center justify-between font-semibold theme-text-main">
                      <div className="flex items-center gap-2">
                        {isIncome ? (
                          <div className="w-6 h-6 rounded-lg bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center">
                            <ArrowDownLeft className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          <div className="group-hover:text-[#a38514] dark:group-hover:text-[#D2AF26] transition-colors">
                            {exp.merchant}
                          </div>
                          <span className="text-[10px] theme-text-muted font-normal">
                            {exp.time || ''} • {exp.category}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`font-mono font-bold ${
                          isIncome ? 'text-[#a38514] dark:text-[#D2AF26]' : 'theme-text-main'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(exp.amount, currency)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedDayData.expenses.length === 0 &&
                selectedDayData.renewals.length === 0 &&
                selectedDayData.trials.length === 0 && (
                  <div className="text-center py-10 theme-text-muted text-xs">
                    <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No activity or renewals scheduled for this day</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
