import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../constants/spacing';

export const theme = {
  colors,
  typography,
  spacing,
  verticalSpacing,
  borderRadius,

  shadow: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
