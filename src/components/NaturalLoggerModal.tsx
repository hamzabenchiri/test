import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  Store,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../utils/formatters';
import { AppTheme, Expense, ExpenseCategory, PaymentMethod } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  preferredCurrency?: string;
  theme?: AppTheme;
}

export const NaturalLoggerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveExpense,
  preferredCurrency = 'USD',
  theme = 'dark',
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted preview
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    isSubscription?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setParsedData(null);
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const quickPrompts = [
    'Bought groceries at Whole Foods for $64.20 with Visa',
    'Paid $14.50 for Uber ride downtown',
    'Starbucks cold brew $5.40 yesterday on Apple Pay',
    'Netflix subscription $19.99 monthly',
  ];

  // Speech Recognition support
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Voice input is not supported in this browser. Please type your expense below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto parse
        parseExpenseWithAI(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event);
        setIsListening(false);
        setErrorMsg('Could not detect speech. Please try again or type manually.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setErrorMsg('Microphone access failed.');
    }
  };

  const parseExpenseWithAI = async (textToParse: string) => {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/parse-natural-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          referenceDate: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse natural language expense');
      }

      const result = await res.json();
      setParsedData({
        merchant: result.merchant || 'Expense',
        amount: Number(result.amount) || 0,
        category: ALL_CATEGORIES.includes(result.category)
          ? result.category
          : 'Food & Dining',
        date: result.date || new Date().toISOString().slice(0, 10),
        paymentMethod: ALL_PAYMENT_METHODS.includes(result.paymentMethod)
          ? result.paymentMethod
          : 'Apple Pay',
        notes: result.notes || text,
        isSubscription: Boolean(result.isSubscription),
      });
    } catch (err: any) {
      console.warn('AI Parser fallback:', err);
      // Client-side regex fallback
      const amountMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 20.0;
      setParsedData({
        merchant: text.replace(/\$?(\d+(?:\.\d{1,2})?)/, '').slice(0, 25).trim() || 'Quick Expense',
        amount,
        category: 'Food & Dining',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Apple Pay',
        notes: text,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData || parsedData.amount <= 0) {
      setErrorMsg('Please specify a valid expense.');
      return;
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    onSaveExpense({
      merchant: parsedData.merchant,
      amount: parsedData.amount,
      currency: preferredCurrency,
      category: parsedData.category,
      date: parsedData.date,
      paymentMethod: parsedData.paymentMethod,
      notes: parsedData.notes,
      isSubscription: parsedData.isSubscription,
      tags: ['natural-log', parsedData.category.toLowerCase()],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-lg overflow-hidden my-8"
        id="natural-logger-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border theme-bg-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold theme-text-main">AI Quick Log</h2>
              <p className="text-xs theme-text-secondary">Type or speak your expense naturally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Text Input with Microphone */}
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  parseExpenseWithAI(inputText);
                }
              }}
              placeholder='e.g. "Dinner at Italian bistro for $54 on credit card yesterday with friends"'
              className="w-full p-4 theme-bg-subtle theme-border border rounded-2xl text-sm theme-text-main placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors resize-none"
              id="natural-input-textarea"
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'theme-bg-card hover:theme-bg-subtle theme-border border theme-text-secondary hover:theme-text-main'
                }`}
                title={isListening ? 'Stop listening' : 'Speak expense'}
                id="mic-record-btn"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => parseExpenseWithAI(inputText)}
                disabled={!inputText.trim() || isProcessing}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer"
                id="parse-expense-submit-btn"
              >
                {isProcessing ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Extract</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          {!parsedData && (
            <div className="space-y-2">
              <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wider">
                Or try an example:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(prompt);
                      parseExpenseWithAI(prompt);
                    }}
                    className="text-xs text-left px-2.5 py-1.5 theme-bg-subtle hover:theme-bg-card theme-border border hover:border-emerald-500/50 rounded-xl theme-text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs transition-all cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  AI Extracted Details
                </span>
                <span className="text-[11px] theme-text-secondary">Click fields to adjust</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium flex items-center gap-1">
                    <Store className="w-3 h-3 theme-text-muted" /> Merchant
                  </label>
                  <input
                    type="text"
                    value={parsedData.merchant}
                    onChange={(e) =>
                      setParsedData({ ...parsedData, merchant: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium flex items-center gap-1">
                    <DollarSign className="w-3 h-3 theme-text-muted" /> Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={parsedData.amount}
                    onChange={(e) =>
                      setParsedData({
                        ...parsedData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono shadow-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3 theme-text-muted" /> Category
                  </label>
                  <select
                    value={parsedData.category}
                    onChange={(e) =>
                      setParsedData({
                        ...parsedData,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 theme-text-muted" /> Date
                  </label>
                  <input
                    type="date"
                    value={parsedData.date}
                    onChange={(e) =>
                      setParsedData({ ...parsedData, date: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] theme-text-secondary font-medium flex items-center gap-1">
                    <CreditCard className="w-3 h-3 theme-text-muted" /> Payment Method
                  </label>
                  <select
                    value={parsedData.paymentMethod}
                    onChange={(e) =>
                      setParsedData({
                        ...parsedData,
                        paymentMethod: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {ALL_PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="px-3 py-1.5 text-xs theme-text-muted hover:theme-text-main cursor-pointer"
                >
                  Edit Prompt
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  id="confirm-natural-expense-btn"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

