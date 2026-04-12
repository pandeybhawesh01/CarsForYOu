import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions from a standard phone (375x812 — iPhone X)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const horizontalScale = (size: number): number =>
  (SCREEN_WIDTH / BASE_WIDTH) * size;

export const verticalScale = (size: number): number =>
  (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (horizontalScale(size) - size) * factor;

export const hs = horizontalScale;
export const vs = verticalScale;
export const ms = moderateScale;
