import React from 'react';

interface SpenseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showIcon?: boolean;
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'inline' | 'card' | 'mark-only' | 'transparent-full';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

/**
 * Spense Official Brand Vector Mark
 * Reconstructed with high-precision vector curves matching the exact transparent logo identity:
 * - Graceful calligraphic vertical flourish with sharp tapered tips
 * - High-contrast editorial serif 'S' with upper and lower bracketed terminal serifs
 */
export const SpenseMark: React.FC<{
  className?: string;
  color?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = 'w-full h-full', color = 'currentColor' }) => {
  return (
    <svg
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Spense Monogram"
    >
      {/* Calligraphic Vertical Slash with curved tapered top & bottom flourishes */}
      <path
        d="M57 6.5 C56.5 7.2 55.2 10.8 53.4 15.2 C51.8 19.1 50.8 23.5 50.8 28.5 L50.8 91.5 C50.8 96.5 49.5 101.2 47.2 105.8 C44.8 110.5 41.5 114.5 41.5 114.5 C41.5 114.5 44.5 111.2 47.8 106.2 C50.8 101.8 53.2 96.5 53.2 89.5 L53.2 26.5 C53.2 19.5 55.2 14.2 57.5 9.8 C58.5 7.8 57 6.5 57 6.5 Z"
        fill={color}
      />

      {/* Main High-Contrast Editorial Serif 'S' */}
      <path
        d="M74.5 30 L74.5 43.5 L70.5 43.5 C69.5 34.2 63.8 26.8 52.5 26.8 C41.5 26.8 33.2 33.2 33.2 42.5 C33.2 51.5 40.8 56.5 53.8 62 C68.8 68.2 76.5 75.8 76.5 87 C76.5 99.5 66.5 106.8 51.5 106.8 C38.2 106.8 29.8 98.5 28 88.5 L32.2 88.5 L32.2 78.5 L36.2 78.5 C36.8 86.8 42.8 101.5 52.2 101.5 C62.5 101.5 70.2 95.2 70.2 86.2 C70.2 77.8 63.5 72.8 51.2 67.2 C36.5 60.5 27.5 53.2 27.5 41.8 C27.5 30.5 37.5 21.8 52 21.8 C63.8 21.8 72.5 28.2 74.5 30 Z"
        fill={color}
      />

      {/* Bottom Serif Terminal Foot */}
      <path
        d="M28 88.5 L28 78.5 L32.2 78.5 L32.2 88.5 Z"
        fill={color}
      />

      {/* Top Right Serif Bracket */}
      <path
        d="M70.5 43.5 L74.5 43.5 L74.5 33 L70.5 33 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Complete Spense Logo component supporting the exact second design image:
 * Transparent, Card, Inline, or Header variants.
 */
export const SpenseLogo: React.FC<SpenseLogoProps> = ({
  size = 'md',
  showIcon = true,
  showText = true,
  showTagline = true,
  variant = 'inline',
  className = '',
}) => {
  const dimensions = {
    xs: { card: 'w-7 h-7 rounded-lg p-1', mark: 'w-3.5 h-4.5', text: 'text-sm tracking-[0.22em]' },
    sm: { card: 'w-8 h-8 rounded-xl p-1.5', mark: 'w-4 h-5', text: 'text-base tracking-[0.24em]' },
    md: { card: 'w-10 h-10 rounded-xl p-2', mark: 'w-5 h-6', text: 'text-lg tracking-[0.26em]' },
    lg: { card: 'w-12 h-12 rounded-2xl p-2.5', mark: 'w-6 h-7.5', text: 'text-xl tracking-[0.28em]' },
    xl: { card: 'w-16 h-16 rounded-2xl p-3', mark: 'w-8 h-10', text: 'text-2xl tracking-[0.30em]' },
    hero: { card: 'w-24 h-24 rounded-3xl p-4 shadow-xl', mark: 'w-14 h-18', text: 'text-3xl tracking-[0.32em]' },
  }[size];

  // 1. Transparent Full Lockup (Exact match to the 2nd uploaded image)
  if (variant === 'transparent-full') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 select-none ${className}`}
        id="spense-logo-transparent-full"
      >
        <div className="w-20 h-24 sm:w-28 sm:h-32 flex items-center justify-center mb-3 text-[#141416] dark:text-[#F7F6F2]">
          <SpenseMark />
        </div>
        <span
          className="font-brand-serif font-semibold text-2xl sm:text-3xl tracking-[0.26em] text-[#141416] dark:text-[#F7F6F2] uppercase pl-[0.26em]"
          style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          SPENSE
        </span>
      </div>
    );
  }

  // 2. Physical Card Presentation
  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-center justify-center theme-bg-card theme-text-main rounded-3xl theme-border border shadow-xl shadow-black/5 p-6 sm:p-8 select-none transition-transform ${className}`}
        id="spense-brand-card-logo"
      >
        <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center mb-4 text-[#141416] dark:text-[#F7F6F2]">
          <SpenseMark />
        </div>
        <span
          className="font-brand-serif font-semibold text-lg sm:text-xl tracking-[0.28em] text-[#141416] dark:text-[#F7F6F2] uppercase pl-[0.28em]"
          style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          SPENSE
        </span>
      </div>
    );
  }

  // 3. Mark Only
  if (variant === 'mark-only') {
    return (
      <div className={`flex items-center justify-center ${dimensions.mark} ${className}`}>
        <SpenseMark />
      </div>
    );
  }

  // 4. Modern Header & Navigation Brand Lockup
  return (
    <div
      className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}
      id="spense-brand-logo"
    >
      {/* Squircle Brand Icon Card */}
      {showIcon && (
        <div
          className={`relative ${dimensions.card} theme-bg-card border theme-border shadow-sm shadow-black/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200`}
        >
          {/* Vector Mark */}
          <div className={`${dimensions.mark} relative z-10 text-[#141416] dark:text-[#D2AF26]`}>
            <SpenseMark />
          </div>
        </div>
      )}

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span
              className={`font-brand-serif font-bold text-[#141416] dark:text-[#F7F6F2] uppercase pl-[0.15em] ${dimensions.text}`}
              style={{
                fontFamily: "'Cinzel', 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                letterSpacing: '0.24em',
              }}
            >
              SPENSE
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-[#D2AF26]/10 text-[#a38514] dark:text-[#D2AF26] border border-[#D2AF26]/30 rounded-md font-sans">
              AI
            </span>
          </div>

          {showTagline && (
            <span className="text-[10px] theme-text-muted mt-1 hidden sm:block font-medium tracking-wide">
              Expense & Financial Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
