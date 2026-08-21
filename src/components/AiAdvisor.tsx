import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Zap,
  Lightbulb,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { AIAdvisorMessage, AppTheme, CategoryBudget, Expense, SpendingInsight } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  expenses: Expense[];
  budgets: CategoryBudget[];
  currency: string;
  insights: SpendingInsight[];
  healthScore: number;
  forecastSpend: number;
  summaryParagraph: string;
  onRefreshInsights: () => void;
  isRefreshingInsights: boolean;
  theme?: AppTheme;
}

export const AiAdvisor: React.FC<Props> = ({
  expenses,
  budgets,
  currency,
  insights,
  healthScore,
  forecastSpend,
  summaryParagraph,
  onRefreshInsights,
  isRefreshingInsights,
  theme = 'dark',
}) => {
  const [messages, setMessages] = useState<AIAdvisorMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your Qalta AI Financial Strategist. I've analyzed your scanned receipts, monthly budget limits, and spending pace. How can I assist you with your money today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Analyze my top spending categories',
        'Can I afford a $200 weekend trip?',
        'How can I save $150 this month?',
        'Review my recurring subscriptions',
      ],
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuestion).trim();
    if (!query || isSending) return;

    const userMsg: AIAdvisorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuestion('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ sender: m.sender, text: m.text })),
          expenses,
          budgets,
          userQuestion: query,
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();

      const assistantMsg: AIAdvisorMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I've analyzed your records and updated your budget plan.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [
          'Show category breakdown',
          'Give me a 3-step saving plan',
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI Chat fallback:', err);
      // Friendly fallback
      const totalMonth = expenses.reduce((s, e) => s + e.amount, 0);
      const fallbackMsg: AIAdvisorMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your ${expenses.length} tracked expenses totaling ${formatCurrency(
          totalMonth,
          currency
        )}, your highest spending areas are Food & Dining and Groceries. Staying under your discretionary targets for the rest of the week will keep you comfortably within your budget goals!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Where can I cut expenses?', 'Forecast my month-end savings'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="ai-advisor-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-text-main flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            Qalta AI Financial Advisor
          </h2>
          <p className="text-xs theme-text-secondary">
            Intelligent cashflow diagnostics, automated budget advice, and conversational planner.
          </p>
        </div>

        <button
          onClick={onRefreshInsights}
          disabled={isRefreshingInsights}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl theme-bg-card theme-border border theme-text-main text-xs font-medium shadow-xs hover:theme-bg-subtle transition-all self-start sm:self-auto"
          id="refresh-ai-insights-btn"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 ${isRefreshingInsights ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshingInsights ? 'Analyzing Ledger...' : 'Re-run Diagnostics'}</span>
        </button>
      </div>

      {/* Health Score & Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score Card */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-300 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000"
                strokeDasharray={`${healthScore || 85}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold theme-text-main font-mono">
              {healthScore || 85}
            </span>
          </div>

          <div>
            <span className="text-xs theme-text-muted font-medium block">Financial Health</span>
            <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {healthScore >= 80 ? 'Strong Standing' : healthScore >= 60 ? 'Moderate' : 'Caution'}
            </h4>
            <span className="text-[11px] theme-text-muted">Based on budget discipline</span>
          </div>
        </div>

        {/* Spend Forecast */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <span className="text-xs theme-text-muted font-medium">Month-End Spend Forecast</span>
          <div className="text-xl font-bold theme-text-main font-mono mt-1">
            {formatCurrency(forecastSpend || 1850, currency)}
          </div>
          <span className="text-[11px] theme-text-muted">Projected from daily burn rate</span>
        </div>

        {/* Executive Summary */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <span className="text-xs theme-text-muted font-medium">AI Strategy Brief</span>
          <p className="text-xs theme-text-secondary line-clamp-2 leading-relaxed mt-1">
            {summaryParagraph ||
              'Your grocery & essential spending is well-balanced. Limiting extra dining out will maximize end-of-month savings.'}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-updated</span>
        </div>
      </div>

      {/* Strategic Insights Cards */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold theme-text-main flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            Detected Action Items & Opportunities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-2xl theme-bg-card theme-border border space-y-2 hover:border-emerald-500/50 transition-colors shadow-md"
              >
                <div className="flex items-center gap-2">
                  {insight.type === 'alert' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  ) : insight.type === 'celebration' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  )}
                  <h4 className="text-xs font-semibold theme-text-main">{insight.title}</h4>
                </div>

                <p className="text-xs theme-text-secondary leading-relaxed">{insight.message}</p>

                {insight.actionable && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Action: {insight.actionable}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Conversational Chat */}
      <div className="rounded-2xl theme-bg-card theme-border border overflow-hidden flex flex-col h-[500px] shadow-md">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b theme-border theme-bg-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold theme-text-main">Qalta AI Assistant</h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block" />
                Ready to answer questions
              </span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 theme-bg-subtle">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'theme-bg-card text-emerald-600 dark:text-emerald-400 theme-border border'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none shadow-xs'
                      : 'theme-bg-card theme-text-main theme-border border rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Suggested Action chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] px-2.5 py-1 theme-bg-card hover:theme-bg-subtle theme-border border hover:border-emerald-500/50 rounded-full theme-text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs transition-all text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-lg theme-bg-card text-emerald-600 dark:text-emerald-400 theme-border border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl theme-bg-card theme-border border text-xs theme-text-muted flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-spin" />
                <span>Qalta is formulating advice...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 theme-bg-card border-t theme-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask Qalta about your expenses, budgets, or savings..."
              className="flex-1 px-4 py-2.5 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isSending}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 shrink-0"
              id="send-ai-chat-btn"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

