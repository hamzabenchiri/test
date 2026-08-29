import { AppTheme } from './types';

export const COLORS = {
  gold: '#D2AF26',
  goldDark: '#9a7d13',
  goldLight: '#c29f1e',
  goldBg: 'rgba(210, 175, 38, 0.1)',
  goldBorder: 'rgba(210, 175, 38, 0.3)',
  goldShadow: 'rgba(210, 175, 38, 0.2)',
};

export const darkTheme = {
  background: '#08080A',
  card: '#161619',
  cardSubtle: '#222227',
  border: '#2a2a30',
  inputBg: '#1f1f24',
  textPrimary: '#f3f3f3',
  textSecondary: '#8a8a93',
  textMuted: '#5a5a63',
  accent: COLORS.gold,
  accentDark: COLORS.goldDark,
  accentBg: COLORS.goldBg,
  accentBorder: COLORS.goldBorder,
  danger: '#f43f5e',
  success: '#22c55e',
  warning: '#f59e0b',
};

export const lightTheme = {
  background: '#F4F5F8',
  card: '#ffffff',
  cardSubtle: '#f0f0f3',
  border: '#e2e2e7',
  inputBg: '#f8f8fa',
  textPrimary: '#141416',
  textSecondary: '#6c6c75',
  textMuted: '#9a9aa3',
  accent: COLORS.gold,
  accentDark: COLORS.goldDark,
  accentBg: COLORS.goldBg,
  accentBorder: COLORS.goldBorder,
  danger: '#f43f5e',
  success: '#22c55e',
  warning: '#f59e0b',
};

export function getTheme(theme: AppTheme) {
  return theme === 'dark' ? darkTheme : lightTheme;
}
