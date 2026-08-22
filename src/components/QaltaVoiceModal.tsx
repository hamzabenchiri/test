import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  Check,
  RotateCcw,
  ArrowRight,
  Zap,
  Tag,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppTheme, Expense, ExpenseCategory, PaymentMethod, WalletAccount } from '../types';
import { CATEGORY_CONFIG, formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  preferredCurrency: string;
  wallets?: WalletAccount[];
  theme?: AppTheme;
}

const VOICE_EXAMPLES = [
  'Spent $18.50 on lunch at Chipotle with Apple Pay',
  'Purchased OpenAI ChatGPT subscription for $20 a month',
  'Paid $64.80 for groceries at Whole Foods on Debit Card',
  'Uber ride to the airport for $42.50 yesterday',
  'Monthly gym membership fee of $49.99 from Primary Checking',
  'Bought design books for $59.99 on Amazon',
];

export const QaltaVoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveExpense,
  preferredCurrency,
  wallets = [],
  theme = 'dark',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Extracted Result for Review
  const [extractedData, setExtractedData] = useState<{
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paymentMethod: PaymentMethod;
    currency: string;
    notes?: string;
    isSubscription?: boolean;
    walletAccountId?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setExtractedData(null);
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setExtractedData(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorMsg('Speech recognition is not supported in this browser. Please type or choose an example below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions or type below.');
        } else {
          setErrorMsg(`Voice input: ${event.error}. You can also type or use examples below.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setErrorMsg('Could not start microphone. You can type or click an example below.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        processWithAI(transcript);
      }
    } else {
      startListening();
    }
  };

  const processWithAI = async (textToProcess: string) => {
    if (!textToProcess.trim()) {
      setErrorMsg('Please speak or type a transaction description.');
      return;
    }

    stopListening();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/parse-natural-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          referenceDate: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
        throw new Error('AI failed to parse your input.');
      }

      const data = await res.json();

      // Find matching wallet if mentioned
      let matchedWalletId: string | undefined = undefined;
      const lower = textToProcess.toLowerCase();
      for (const w of wallets) {
        if (lower.includes(w.name.toLowerCase())) {
          matchedWalletId = w.id;
          break;
        }
      }

      setExtractedData({
        merchant: data.merchant || 'Quick Expense',
        amount: Number(data.amount) || 0,
        category: (data.category as ExpenseCategory) || 'Miscellaneous',
        date: data.date || new Date().toISOString().slice(0, 10),
        paymentMethod: (data.paymentMethod as PaymentMethod) || 'Apple Pay',
        currency: data.currency || preferredCurrency,
        notes: data.notes || textToProcess,
        isSubscription: Boolean(data.isSubscription),
        walletAccountId: matchedWalletId || (wallets.length > 0 ? wallets[0].id : undefined),
      });
    } catch (err: any) {
      console.error('Error parsing voice expense:', err);
      // Fallback manual regex parser if server is offline
      fallbackRegexParse(textToProcess);
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackRegexParse = (text: string) => {
    const amountMatch = text.match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 15.0;

    let category: ExpenseCategory = 'Food & Dining';
    const lower = text.toLowerCase();
    if (lower.includes('grocer') || lower.includes('market') || lower.includes('trader')) category = 'Groceries';
    else if (lower.includes('uber') || lower.includes('gas') || lower.includes('transit') || lower.includes('flight')) category = 'Transportation';
    else if (lower.includes('subscription') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('openai')) category = 'Subscriptions';
    else if (lower.includes('gym') || lower.includes('fitness') || lower.includes('doctor')) category = 'Health & Fitness';
    else if (lower.includes('amazon') || lower.includes('shop') || lower.includes('bought') || lower.includes('clothes')) category = 'Shopping';

    setExtractedData({
      merchant: text.slice(0, 30),
      amount,
      category,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Apple Pay',
      currency: preferredCurrency,
      notes: text,
      walletAccountId: wallets.length > 0 ? wallets[0].id : undefined,
    });
  };

  const handleConfirmAndSave = () => {
    if (!extractedData) return;

    onSaveExpense({
      type: 'expense',
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      currency: extractedData.currency,
      category: extractedData.category,
      date: extractedData.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      paymentMethod: extractedData.paymentMethod,
      walletAccountId: extractedData.walletAccountId,
      isSubscription: extractedData.isSubscription,
      notes: extractedData.notes,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl theme-bg-card theme-border border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 theme-modal-header border-b theme-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#D2AF26]/10 border border-[#D2AF26]/20 p-[1.5px] flex items-center justify-center shadow-md shadow-[#D2AF26]/10">
              <div className="w-full h-full bg-[#121216] dark:bg-[#121216] rounded-[13px] flex items-center justify-center">
                <Mic className="w-4 h-4 text-[#D2AF26]" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black theme-text-main flex items-center gap-1.5 font-brand-serif">
                <span>Spense Voice Tracker</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-[#D2AF26]/15 text-[#a38514] dark:text-[#D2AF26] rounded font-mono">
                  Live
                </span>
              </h2>
              <p className="text-[11px] theme-text-secondary">
                Speak naturally to instantly log and auto-categorize spending
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full theme-bg-subtle theme-border border flex items-center justify-center theme-text-muted hover:theme-text-main transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Voice Pulsating Interactive Orb */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Glowing Ripple Rings */}
              {isListening && (
                <>
                  <div className="absolute w-36 h-36 rounded-full bg-[#D2AF26]/20 animate-ping" />
                  <div className="absolute w-44 h-44 rounded-full bg-[#D2AF26]/10 animate-pulse" />
                </>
              )}

              {/* Central Voice Button */}
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 shadow-rose-500/30 scale-105 ring-4 ring-rose-500/30'
                    : isProcessing
                    ? 'bg-[#b8951a] shadow-[#D2AF26]/30 animate-pulse'
                    : 'bg-[#D2AF26] hover:bg-[#c29f1e] shadow-[#D2AF26]/30 hover:scale-105 active:scale-95'
                }`}
                title={isListening ? 'Tap to finish speaking' : 'Tap to speak'}
                id="qalta-voice-orb-btn"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8 text-white" />
                    <span className="text-[10px] font-bold text-white mt-1">Tap to Stop</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <Sparkles className="w-8 h-8 text-stone-950 animate-spin" />
                    <span className="text-[10px] font-bold text-stone-950 mt-1">Thinking...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-stone-950 font-bold" />
                    <span className="text-[10px] font-extrabold text-stone-950 mt-1 font-mono">Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Audio Waveform Simulation */}
            {isListening && (
              <div className="flex items-center gap-1.5 mt-6 h-6">
                {[40, 75, 100, 50, 90, 60, 80, 45, 95, 30].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[#D2AF26] rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '600ms',
                    }}
                  />
                ))}
              </div>
            )}

            <p className="text-xs font-semibold theme-text-secondary mt-4 text-center">
              {isListening
                ? 'Listening... say merchant, amount, category, or payment method'
                : isProcessing
                ? 'Spense AI is categorizing and structuring your transaction...'
                : 'Tap microphone or type/select an example below'}
            </p>
          </div>

          {/* Transcript / Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold theme-text-secondary flex items-center gap-1 font-brand-serif">
                <Volume2 className="w-3.5 h-3.5 text-[#D2AF26]" />
                Voice Transcript / Query
              </span>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder='e.g., "Spent $16.50 on iced matcha latte at Blue Bottle using Apple Pay"'
                rows={2}
                className="w-full theme-input border rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-[#D2AF26] shadow-inner resize-none font-sans"
                id="qalta-voice-transcript-input"
              />

              {transcript.trim() && !isProcessing && !extractedData && (
                <button
                  onClick={() => processWithAI(transcript)}
                  className="absolute right-2.5 bottom-2.5 px-3 py-1.5 rounded-xl bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <span>Process AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Extracted Result Review Card */}
          {extractedData && (
            <div className="p-4.5 rounded-2xl bg-[#D2AF26]/5 border border-[#D2AF26]/30 space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D2AF26]/20 text-[#a38514] dark:text-[#D2AF26] flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold theme-text-main font-brand-serif">AI Extraction Verified</span>
                </div>
                <span className="text-base font-bold font-mono text-[#a38514] dark:text-[#D2AF26]">
                  {formatCurrency(extractedData.amount, extractedData.currency)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Merchant</span>
                  <span className="font-bold theme-text-main truncate block font-brand-serif">
                    {extractedData.merchant}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Category</span>
                  <span className="font-bold text-[#a38514] dark:text-[#D2AF26] truncate block">
                    {extractedData.category}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Payment Method</span>
                  <span className="font-semibold theme-text-main truncate block">
                    {extractedData.paymentMethod}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Date</span>
                  <span className="font-medium theme-text-main truncate block">
                    {extractedData.date}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Type</span>
                  <span className="font-semibold theme-text-main truncate block">
                    {extractedData.isSubscription ? 'Recurring Plan' : 'One-Time Expense'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl theme-bg-card theme-border border">
                  <span className="text-[10px] theme-text-muted block">Account</span>
                  <span className="font-semibold text-[#a38514] dark:text-[#D2AF26] truncate block">
                    {wallets.find((w) => w.id === extractedData.walletAccountId)?.name || 'Default Account'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setExtractedData(null)}
                  className="flex-1 py-2.5 rounded-xl theme-bg-subtle theme-border border hover:theme-bg-card theme-text-secondary text-xs font-semibold transition-colors cursor-pointer"
                >
                  Re-speak
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="flex-2 py-2.5 rounded-xl bg-[#D2AF26] hover:bg-[#c29f1e] text-stone-950 text-xs font-extrabold shadow-lg shadow-[#D2AF26]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  id="confirm-voice-expense-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>Save to Ledger</span>
                </button>
              </div>
            </div>
          )}

          {/* Preset Voice Example Chips */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold theme-text-secondary flex items-center gap-1 font-brand-serif">
              <Zap className="w-3 h-3 text-[#D2AF26]" />
              Try Example Voice Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(ex);
                    processWithAI(ex);
                  }}
                  className="px-2.5 py-1.5 rounded-xl theme-bg-subtle theme-border border hover:border-[#D2AF26]/40 hover:text-[#a38514] dark:hover:text-[#D2AF26] theme-text-secondary text-[11px] transition-colors text-left cursor-pointer"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 theme-modal-header border-t theme-border flex items-center justify-between text-[11px] theme-text-muted">
          <span>Powered by Spense AI engine</span>
          <button
            onClick={onClose}
            className="hover:theme-text-main font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
