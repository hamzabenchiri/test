import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertCircle,
  Mic,
  MicOff,
  Send,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  Store,
} from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  formatCurrency,
} from '../utils/formatters';
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

  // Parsed structured result
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    isSubscription?: boolean;
  } | null>(null);

  // Quick prompt suggestions
  const quickPrompts = [
    'Coffee at Blue Bottle for $6.50 on Apple Pay',
    'Uber ride to airport $42.80 with credit card yesterday',
    'Monthly Netflix subscription $19.99',
    'Whole Foods grocery run $124.50 on debit card',
    'Dinner at Nobu $215 with client',
  ];

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setParsedData(null);
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const parseExpenseWithAI = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Local smart rule-based extraction fallback & simulated NLP
      const lower = text.toLowerCase();

      // Extract amount
      let extractedAmount = 0;
      const amountMatch = text.match(/\$?\s*([0-9]+(?:[.,][0-9]{2})?)/);
      if (amountMatch) {
        extractedAmount = parseFloat(amountMatch[1].replace(',', '.'));
      }

      // Extract Category
      let extractedCategory: ExpenseCategory = 'Miscellaneous';
      if (
        lower.includes('coffee') ||
        lower.includes('dinner') ||
        lower.includes('lunch') ||
        lower.includes('restaurant') ||
        lower.includes('food') ||
        lower.includes('bistro') ||
        lower.includes('cafe') ||
        lower.includes('drink') ||
        lower.includes('starbucks') ||
        lower.includes('nobu') ||
        lower.includes('pizza') ||
        lower.includes('burger')
      ) {
        extractedCategory = 'Food & Dining';
      } else if (
        lower.includes('grocery') ||
        lower.includes('whole foods') ||
        lower.includes('trader joe') ||
        lower.includes('supermarket') ||
        lower.includes('market')
      ) {
        extractedCategory = 'Groceries';
      } else if (
        lower.includes('uber') ||
        lower.includes('lyft') ||
        lower.includes('taxi') ||
        lower.includes('gas') ||
        lower.includes('fuel') ||
        lower.includes('parking') ||
        lower.includes('train') ||
        lower.includes('flight') ||
        lower.includes('transit')
      ) {
        extractedCategory = 'Transportation';
      } else if (
        lower.includes('netflix') ||
        lower.includes('spotify') ||
        lower.includes('subscription') ||
        lower.includes('icloud') ||
        lower.includes('gym') ||
        lower.includes('monthly')
      ) {
        extractedCategory = 'Subscriptions';
      } else if (
        lower.includes('amazon') ||
        lower.includes('clothes') ||
        lower.includes('shoes') ||
        lower.includes('shopping') ||
        lower.includes('store') ||
        lower.includes('target')
      ) {
        extractedCategory = 'Shopping';
      } else if (
        lower.includes('rent') ||
        lower.includes('utility') ||
        lower.includes('electric') ||
        lower.includes('water') ||
        lower.includes('internet') ||
        lower.includes('wifi')
      ) {
        extractedCategory = 'Housing & Utilities';
      } else if (
        lower.includes('movie') ||
        lower.includes('concert') ||
        lower.includes('game') ||
        lower.includes('ticket')
      ) {
        extractedCategory = 'Entertainment';
      }

      // Extract Payment Method
      let extractedPayment: PaymentMethod = 'Credit Card';
      if (lower.includes('apple pay') || lower.includes('applepay')) {
        extractedPayment = 'Apple Pay';
      } else if (lower.includes('cash')) {
        extractedPayment = 'Cash';
      } else if (lower.includes('debit')) {
        extractedPayment = 'Debit Card';
      } else if (lower.includes('google pay')) {
        extractedPayment = 'Google Pay';
      } else if (lower.includes('transfer') || lower.includes('wire')) {
        extractedPayment = 'Bank Transfer';
      }

      // Extract Date
      let extractedDate = new Date().toISOString().slice(0, 10);
      if (lower.includes('yesterday')) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        extractedDate = d.toISOString().slice(0, 10);
      }

      // Extract Merchant / Title
      let extractedMerchant = 'Purchase';
      const cleanTokens = text
        .replace(/\$?\s*([0-9]+(?:[.,][0-9]{2})?)/g, '')
        .replace(/yesterday|today|on|for|with|at|using|my|paid|via/gi, ' ')
        .replace(/credit card|apple pay|debit card|cash|google pay/gi, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (cleanTokens.length > 0) {
        extractedMerchant = cleanTokens.slice(0, 3).join(' ');
        extractedMerchant =
          extractedMerchant.charAt(0).toUpperCase() + extractedMerchant.slice(1);
      }

      const isSub =
        lower.includes('subscription') ||
        lower.includes('monthly') ||
        lower.includes('netflix') ||
        lower.includes('spotify');

      // Small simulate delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      setParsedData({
        merchant: extractedMerchant || 'Quick Expense',
        amount: extractedAmount > 0 ? extractedAmount : 15.0,
        category: extractedCategory,
        date: extractedDate,
        paymentMethod: extractedPayment,
        notes: `Logged via Spense AI Quick Log: "${text}"`,
        isSubscription: isSub,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not parse text. Please check format or try an example.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMsg('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
        parseExpenseWithAI(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setErrorMsg('Microphone error or permission denied.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setErrorMsg('Microphone service unavailable.');
      setIsListening(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData) return;

    onSaveExpense({
      type: 'expense',
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
            <div className="w-8 h-8 rounded-lg bg-[#D2AF26]/10 border border-[#D2AF26]/20 flex items-center justify-center text-[#a38514] dark:text-[#D2AF26]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold theme-text-main font-brand-serif">AI Quick Log</h2>
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
              className="w-full p-4 theme-bg-subtle theme-border border rounded-2xl text-sm theme-text-main placeholder-stone-400 focus:outline-none focus:border-[#D2AF26] shadow-xs transition-colors resize-none"
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-bold rounded-xl shadow-lg shadow-[#D2AF26]/20 disabled:opacity-40 transition-all cursor-pointer"
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
                    className="text-xs text-left px-2.5 py-1.5 theme-bg-subtle hover:theme-bg-card theme-border border hover:border-[#D2AF26]/50 rounded-xl theme-text-secondary hover:text-[#a38514] dark:hover:text-[#D2AF26] shadow-xs transition-all cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-[#D2AF26]/10 border border-[#D2AF26]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#a38514] dark:text-[#D2AF26] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D2AF26]" />
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
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-[#D2AF26]"
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
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs font-semibold text-[#a38514] dark:text-[#D2AF26] font-mono shadow-xs focus:outline-none focus:border-[#D2AF26]"
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
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-[#D2AF26] cursor-pointer"
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
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-[#D2AF26] cursor-pointer"
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
                    className="w-full px-2.5 py-1.5 theme-bg-card theme-border border rounded-xl text-xs theme-text-main shadow-xs focus:outline-none focus:border-[#D2AF26] cursor-pointer"
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-[#D2AF26]/20 transition-all cursor-pointer"
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
