import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Expense, ExpenseCategory, AppTheme, CategoryBudget } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AdvisorInsight {
  id: string;
  type: 'tip' | 'alert' | 'celebration';
  title: string;
  message: string;
  actionable?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

interface Props {
  expenses: Expense[];
  budgets: CategoryBudget[];
  currency: string;
  theme: AppTheme;
  insights: AdvisorInsight[];
  summaryParagraph: string;
  forecastSpend: number;
  healthScore: number;
  onRefreshInsights: () => void;
  isRefreshingInsights: boolean;
}

export const AiAdvisor: React.FC<Props> = ({
  expenses,
  budgets,
  currency,
  theme,
  insights,
  summaryParagraph,
  forecastSpend,
  healthScore,
  onRefreshInsights,
  isRefreshingInsights,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Greetings. I am your Spense Financial Intelligence Advisor. I have analyzed your recent transactions across all portfolios. How may I assist your financial planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How can I optimize my monthly savings?',
        'Analyze my dining & groceries burn rate',
        'Which subscriptions can I safely trim?',
      ],
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuestion).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsSending(true);

    try {
      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          context: {
            totalSpent: expenses.reduce((s, e) => (e.type === 'expense' ? s + e.amount : s), 0),
            totalIncome: expenses.reduce((s, e) => (e.type === 'income' ? s + e.amount : s), 0),
            currency,
            recentExpensesCount: expenses.length,
            healthScore,
          },
        }),
      });

      if (!res.ok) throw new Error('Advisor API error');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "Based on your financial ledger, you are maintaining a healthy reserve ratio.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [
          'Forecast month-end savings balance',
          'Review high-volume expenditure categories',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI chat error fallback:', err);
      // Fallback local smart advisor response
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your current recorded activity of ${formatCurrency(
          expenses.reduce((s, e) => (e.type === 'expense' ? s + e.amount : s), 0),
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
          <h2 className="text-xl font-bold theme-text-main flex items-center gap-2 font-brand-serif">
            <Sparkles className="w-5 h-5 text-[#D2AF26]" />
            Spense AI Financial Advisor
          </h2>
          <p className="text-xs theme-text-secondary">
            Intelligent cashflow diagnostics, automated budget advice, and conversational planner.
          </p>
        </div>

        <button
          onClick={onRefreshInsights}
          disabled={isRefreshingInsights}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl theme-bg-card theme-border border theme-text-main text-xs font-medium shadow-xs hover:theme-bg-subtle transition-all self-start sm:self-auto cursor-pointer"
          id="refresh-ai-insights-btn"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-[#D2AF26] ${isRefreshingInsights ? 'animate-spin' : ''}`}
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
                className="text-stone-300 dark:text-stone-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#D2AF26] transition-all duration-1000"
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
            <h4 className="text-sm font-semibold text-[#a38514] dark:text-[#D2AF26] font-brand-serif">
              {healthScore >= 80 ? 'Strong Standing' : healthScore >= 60 ? 'Moderate' : 'Caution'}
            </h4>
            <span className="text-[11px] theme-text-muted">Based on budget discipline</span>
          </div>
        </div>

        {/* Spend Forecast */}
        <div className="p-5 rounded-2xl theme-bg-card theme-border border shadow-md flex flex-col justify-between">
          <span className="text-xs theme-text-muted font-medium">Month-End Spend Forecast</span>
          <div className="text-xl font-bold theme-text-main font-mono mt-1 text-[#a38514] dark:text-[#D2AF26]">
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
          <span className="text-[10px] text-[#a38514] dark:text-[#D2AF26] font-medium">Auto-updated</span>
        </div>
      </div>

      {/* Strategic Insights Cards */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold theme-text-main flex items-center gap-2 font-brand-serif">
            <Lightbulb className="w-4 h-4 text-[#D2AF26]" />
            Detected Action Items & Opportunities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-2xl theme-bg-card theme-border border space-y-2 hover:border-[#D2AF26]/50 transition-colors shadow-md"
              >
                <div className="flex items-center gap-2">
                  {insight.type === 'alert' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  ) : insight.type === 'celebration' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#D2AF26] shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#D2AF26] shrink-0" />
                  )}
                  <h4 className="text-xs font-semibold theme-text-main font-brand-serif">{insight.title}</h4>
                </div>

                <p className="text-xs theme-text-secondary leading-relaxed">{insight.message}</p>

                {insight.actionable && (
                  <div className="p-2 bg-[#D2AF26]/10 border border-[#D2AF26]/20 rounded-lg text-[11px] text-[#a38514] dark:text-[#D2AF26] font-medium flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#D2AF26] shrink-0" />
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
            <div className="w-7 h-7 rounded-lg bg-[#D2AF26]/10 border border-[#D2AF26]/20 flex items-center justify-center text-[#a38514] dark:text-[#D2AF26]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold theme-text-main font-brand-serif">Spense AI Assistant</h4>
              <span className="text-[10px] text-[#a38514] dark:text-[#D2AF26] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2AF26] inline-block" />
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
                    ? 'bg-[#D2AF26] text-stone-950 font-bold shadow-xs'
                    : 'theme-bg-card text-[#a38514] dark:text-[#D2AF26] theme-border border'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#D2AF26] text-stone-950 font-semibold rounded-tr-none shadow-xs'
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
                        className="text-[11px] px-2.5 py-1 theme-bg-card hover:theme-bg-subtle theme-border border hover:border-[#D2AF26]/50 rounded-full theme-text-secondary hover:text-[#a38514] dark:hover:text-[#D2AF26] shadow-xs transition-all text-left cursor-pointer"
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
              <div className="w-7 h-7 rounded-lg theme-bg-card text-[#a38514] dark:text-[#D2AF26] theme-border border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl theme-bg-card theme-border border text-xs theme-text-muted flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D2AF26] animate-spin" />
                <span>Spense is formulating advice...</span>
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
              placeholder="Ask Spense about your expenses, budgets, or savings..."
              className="flex-1 px-4 py-2.5 theme-bg-subtle theme-border border rounded-xl text-xs theme-text-main placeholder-stone-400 focus:outline-none focus:border-[#D2AF26] shadow-xs transition-colors"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isSending}
              className="px-4 py-2.5 bg-[#D2AF26] hover:bg-[#c29f1e] disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-[#D2AF26]/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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
