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
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-full theme-bg-card/95 backdrop-blur-xl border theme-border shadow-2xl shadow-black/25 transition-all hover:scale-[1.01]">
        {/* 1. Voice AI Orb (Central Spense Highlight) */}
        <button
          onClick={onOpenVoice}
          className="group relative flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full bg-[#D2AF26] text-stone-950 font-bold text-xs shadow-lg hover:bg-[#c29f1e] active:scale-95 transition-all cursor-pointer"
          title="Spense AI Voice Tracker: Tap to speak spending"
          id="dock-voice-ai-btn"
        >
          <div className="w-5 h-5 rounded-full bg-stone-950/15 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
          </div>
          <span className="font-bold tracking-tight">Voice AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-stone-950/60" />
        </button>

        {/* 2. Scan OCR Receipt */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Scan Receipt / Bill OCR"
          id="dock-scan-receipt-btn"
        >
          <Camera className="w-3.5 h-3.5 text-[#D2AF26]" />
          <span className="hidden sm:inline">Scan</span>
        </button>

        {/* 3. AI Text QuickLog */}
        <button
          onClick={onOpenNaturalLog}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Natural Language QuickLog"
          id="dock-quicklog-btn"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D2AF26]" />
          <span className="hidden md:inline">QuickLog</span>
        </button>

        {/* 4. Manual Transaction (+) */}
        <button
          onClick={onOpenManualAdd}
          className="flex items-center justify-center w-8 h-8 rounded-full theme-bg-subtle theme-border border hover:theme-bg-card theme-text-main transition-colors cursor-pointer"
          title="Add Manual Entry"
          id="dock-manual-add-btn"
        >
          <Plus className="w-4 h-4 text-[#D2AF26]" />
        </button>
      </div>
    </div>
  );
};
