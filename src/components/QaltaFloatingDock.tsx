import React from 'react';
import {
  Mic,
  Camera,
  Plus,
  Sparkles,
  Building2,
  Receipt,
  Repeat,
  ArrowRightLeft,
} from 'lucide-react';
import { AppTheme } from '../types';

interface Props {
  onOpenVoice: () => void;
  onOpenScanner: () => void;
  onOpenManualAdd: () => void;
  onOpenNaturalLog: () => void;
  onOpenWallets?: () => void;
  theme?: AppTheme;
}

export const QaltaFloatingDock: React.FC<Props> = ({
  onOpenVoice,
  onOpenScanner,
  onOpenManualAdd,
  onOpenNaturalLog,
  onOpenWallets,
  theme = 'dark',
}) => {
  return (
    <div
      className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4"
      id="spense-floating-action-dock"
    >
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full theme-bg-card/90 backdrop-blur-xl border theme-border shadow-2xl shadow-black/30 transition-all hover:scale-[1.01]">
        {/* 1. Voice AI Orb (Central Spense Highlight) */}
        <button
          onClick={onOpenVoice}
          className="group relative flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Spense AI Voice Tracker: Tap to speak spending"
          id="dock-voice-ai-btn"
        >
          <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
          </div>
          <span className="font-extrabold tracking-tight">Voice AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950/50" />
        </button>

        {/* 2. Scan OCR Receipt */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Scan Receipt / Bill OCR"
          id="dock-scan-receipt-btn"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Scan</span>
        </button>

        {/* 3. AI Text QuickLog */}
        <button
          onClick={onOpenNaturalLog}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Natural Language QuickLog"
          id="dock-quicklog-btn"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">QuickLog</span>
        </button>

        {/* 4. Manual Transaction (+) */}
        <button
          onClick={onOpenManualAdd}
          className="flex items-center justify-center w-8 h-8 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main transition-colors cursor-pointer"
          title="Add Manual Entry"
          id="dock-manual-add-btn"
        >
          <Plus className="w-4 h-4 text-emerald-500" />
        </button>
      </div>
    </div>
  );
};
