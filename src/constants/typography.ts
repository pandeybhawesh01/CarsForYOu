import { ms } from '../utils/scaling';

export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Font Sizes (scaled)
  fontSize: {
    xs: ms(10),
    sm: ms(12),
    base: ms(14),
    md: ms(16),
    lg: ms(18),
    xl: ms(20),
    xxl: ms(24),
    xxxl: ms(28),
    display: ms(32),
  },

  // Line Heights
  lineHeight: {
    xs: ms(14),
    sm: ms(16),
    base: ms(20),
    md: ms(22),
    lg: ms(26),
    xl: ms(28),
    xxl: ms(32),
    xxxl: ms(38),
    display: ms(42),
  },
} as const;
