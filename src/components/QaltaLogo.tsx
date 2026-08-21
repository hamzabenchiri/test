import React from 'react';

interface QaltaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const QaltaLogo: React.FC<QaltaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="qalta-brand-logo">
      {/* Qalta Squircle Icon Mark */}
      <div
        className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
      >
        <div className="w-full h-full bg-[#0d0d12] dark:bg-[#070709] rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/30 via-teal-500/10 to-transparent opacity-80" />

          {/* Futuristic Stylized "Q" Vector */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5/6 h-5/6 relative z-10"
          >
            <defs>
              <linearGradient id="qaltaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="qaltaSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Main Outer Ring of Q */}
            <circle
              cx="15"
              cy="15"
              r="8.5"
              stroke="url(#qaltaGrad1)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Inner AI Iris / Neural Core */}
            <circle cx="15" cy="15" r="3.2" fill="url(#qaltaSparkGrad)" />

            {/* Tail of Q pointing dynamically outward */}
            <path
              d="M20.5 20.5L25.5 25.5"
              stroke="url(#qaltaGrad1)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Sparkle Nodes */}
            <circle cx="8" cy="8" r="1.2" fill="#34D399" opacity="0.8" />
            <circle cx="23" cy="7" r="1" fill="#38BDF8" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black theme-text-main tracking-tight font-sans ${titleSizes}`}
            >
              Qalta
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 rounded-md">
              AI
            </span>
          </div>
          <span className="text-[10px] theme-text-muted mt-1 hidden sm:block font-medium tracking-wide">
            Expense Manager & Voice Tracker
          </span>
        </div>
      )}
    </div>
  );
};
