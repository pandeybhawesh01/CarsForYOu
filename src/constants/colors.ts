export const colors = {
  // Brand
  primary: '#1A56DB',
  primaryDark: '#1342B0',
  primaryLight: '#EBF0FF',
  accent: '#FF6B00',
  accentLight: '#FFF3EB',

  // Semantic
  success: '#22C55E',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',

  // Neutrals
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textAccent: '#FF6B00',
  textPrimary: '#1A56DB',

  // Status
  pending: '#F59E0B',
  inProgress: '#3B82F6',
  completed: '#22C55E',
  cancelled: '#EF4444',

  // Utility
  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.08)',

  /** Condition / rating chips (between success and warning) */
  ratingGood: '#84CC16',

  /** Text on primary or dark blue headers */
  onPrimaryMuted: 'rgba(255,255,255,0.75)',
  onPrimarySubtle: 'rgba(255,255,255,0.7)',
  onPrimaryStrong: 'rgba(255,255,255,0.85)',
  onPrimaryEmphasis: 'rgba(255,255,255,0.8)',

  /** Translucent surfaces on primary backgrounds */
  onPrimarySurfaceLow: 'rgba(255,255,255,0.2)',
  onPrimarySurfaceMedium: 'rgba(255,255,255,0.3)',
} as const;

export type ColorKey = keyof typeof colors;
