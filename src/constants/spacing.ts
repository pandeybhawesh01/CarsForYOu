import { hs, vs } from '../utils/scaling';

export const spacing = {
  none: 0,
  xxs: hs(2),
  xs: hs(4),
  sm: hs(8),
  md: hs(12),
  base: hs(16),
  lg: hs(20),
  xl: hs(24),
  xxl: hs(32),
  xxxl: hs(40),
  huge: hs(48),
  giant: hs(64),
} as const;

export const verticalSpacing = {
  none: 0,
  xxs: vs(2),
  xs: vs(4),
  sm: vs(8),
  md: vs(12),
  base: vs(16),
  lg: vs(20),
  xl: vs(24),
  xxl: vs(32),
  xxxl: vs(40),
  huge: vs(48),
  giant: vs(64),
} as const;

export const borderRadius = {
  none: 0,
  xs: hs(4),
  sm: hs(8),
  md: hs(12),
  lg: hs(16),
  xl: hs(20),
  xxl: hs(24),
  full: 9999,
} as const;

export const iconSize = {
  xs: hs(12),
  sm: hs(16),
  md: hs(20),
  lg: hs(24),
  xl: hs(28),
  xxl: hs(32),
  xxxl: hs(40),
} as const;
