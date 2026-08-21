import React from 'react';

interface SpenseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'inline' | 'card' | 'mark-only';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

/**
 * Spense Official Brand Vector Mark
 * Recreated with exact mathematical bezier curves to match the Spense Brand Identity
 * (Stylized Serif '$' Monogram with curved calligraphic vertical flourish).
 */
export const SpenseMark: React.FC<{
  className?: string;
  color?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = 'w-full h-full', color = 'currentColor' }) => {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Spense Logo Mark"
    >
      {/* 1. Curved Calligraphic Vertical Slash with Tapered Terminals */}
      <path
        d="M59.5 8.5 C59.5 8.5, 58.2 12.8, 54.8 17.5 C52.2 21.2, 50.2 25.8, 50.2 31.5 L50.2 88.5 C50.2 94.2, 47.8 98.8, 45.2 102.5 C41.8 107.2, 40.5 111.5, 40.5 111.5 C40.5 111.5, 42.8 108.2, 46.2 103.5 C49.2 99.4, 52.8 93.8, 52.8 86.5 L52.8 33.5 C52.8 26.2, 56.4 20.6, 59.5 16.5 C62.8 11.8, 59.5 8.5, 59.5 8.5 Z"
        fill={color}
      />

      {/* 2. Elegant High-Contrast Serif 'S' */}
      {/* Upper Terminal Serif Bracket */}
      <path
        d="M72 32 L72 43.5 L68.2 43.5 C67.5 35.8, 62.5 28.5, 51.5 28.5 C40.8 28.5, 33.5 34.2, 33.5 42.8 C33.5 50.8, 40.2 55.4, 52.2 60.5 C67.2 66.8, 73.8 73.8, 73.8 84.5 C73.8 96.2, 64.5 103.5, 50.2 103.5 C37.5 103.5, 29.8 95.8, 28.2 86.5 L32 86.5 L32 76.5 L35.8 76.5 C36.5 84.8, 42.2 99, 51.2 99 C60.5 99, 67.5 93.2, 67.5 84.5 C67.5 76.5, 61.2 71.8, 49.5 66.5 C35.2 60.2, 27.2 53.5, 27.2 42.8 C27.2 31.8, 36.8 24.2, 50.2 24.2 C61.8 24.2, 70.2 30.5, 72 32 Z"
        fill={color}
      />

      {/* Bottom Terminal Serif Foot */}
      <path
        d="M28 87 L28 76.5 L32.2 76.5 L32.2 87 Z"
        fill={color}
      />
    </svg>
  );
};

export const SpenseLogo: React.FC<SpenseLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  variant = 'inline',
  theme = 'auto',
  className = '',
}) => {
  // Dimension definitions
  const dimensions = {
    xs: { card: 'w-7 h-7 rounded-lg p-1', mark: 'w-3.5 h-4.5', text: 'text-sm tracking-[0.2em]' },
    sm: { card: 'w-8 h-8 rounded-xl p-1.5', mark: 'w-4 h-5', text: 'text-base tracking-[0.22em]' },
    md: { card: 'w-10 h-10 rounded-xl p-2', mark: 'w-5 h-6', text: 'text-lg tracking-[0.24em]' },
    lg: { card: 'w-12 h-12 rounded-2xl p-2.5', mark: 'w-6 h-7.5', text: 'text-xl tracking-[0.25em]' },
    xl: { card: 'w-16 h-16 rounded-2xl p-3', mark: 'w-8 h-10', text: 'text-2xl tracking-[0.26em]' },
    hero: { card: 'w-24 h-24 rounded-3xl p-4 shadow-xl', mark: 'w-12 h-15', text: 'text-3xl tracking-[0.28em]' },
  }[size];

  // 1. Exact Physical Card Display (from user's brand identity selection)
  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-white text-[#111827] rounded-3xl border border-black/5 shadow-xl shadow-black/5 p-6 sm:p-8 select-none transition-transform ${className}`}
        id="spense-brand-card-logo"
      >
        <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center mb-4 text-[#111827]">
          <SpenseMark color="#111827" />
        </div>
        <span
          className="font-serif font-medium text-lg sm:text-xl tracking-[0.28em] text-[#111827] uppercase pl-[0.28em]"
          style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          SPENSE
        </span>
      </div>
    );
  }

  // 2. Mark Only
  if (variant === 'mark-only') {
    return (
      <div className={`flex items-center justify-center ${dimensions.mark} ${className}`}>
        <SpenseMark />
      </div>
    );
  }

  // 3. Modern Responsive Navbar & Header Brand
  return (
    <div
      className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}
      id="spense-brand-logo"
    >
      {/* Squircle Brand Icon Card */}
      <div
        className={`relative ${dimensions.card} bg-white dark:bg-[#15171e] border border-black/[0.08] dark:border-white/[0.12] shadow-sm shadow-black/5 dark:shadow-emerald-500/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200`}
      >
        {/* Subtle glowing backlight in dark mode */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-[2px] opacity-0 dark:opacity-100 transition-opacity" />

        {/* Vector Mark */}
        <div className={`${dimensions.mark} relative z-10 text-[#111827] dark:text-emerald-400`}>
          <SpenseMark />
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span
              className={`font-serif font-bold theme-text-main uppercase pl-[0.15em] ${dimensions.text}`}
              style={{
                fontFamily: "'Cinzel', 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                letterSpacing: '0.22em',
              }}
            >
              SPENSE
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 rounded-md font-sans">
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
