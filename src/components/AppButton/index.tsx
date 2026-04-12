import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../constants/spacing';
import { hs, vs } from '../../utils/scaling';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  isDisabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  testID?: string;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.accent },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.textInverse },
  },
  outline: {
    container: { backgroundColor: colors.transparent, borderWidth: 1.5, borderColor: colors.primary },
    text: { color: colors.primary },
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    text: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.error },
    text: { color: colors.textInverse },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: spacing.base, paddingVertical: vs(8) },
    text: { fontSize: typography.fontSize.sm },
  },
  md: {
    container: { paddingHorizontal: spacing.xl, paddingVertical: vs(12) },
    text: { fontSize: typography.fontSize.base },
  },
  lg: {
    container: { paddingHorizontal: spacing.xl, paddingVertical: vs(16) },
    text: { fontSize: typography.fontSize.md },
  },
};

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  isDisabled = false,
  style,
  textStyle,
  fullWidth = true,
  testID,
}) => {
  const handlePress = useCallback(() => {
    if (!isLoading && !isDisabled) onPress();
  }, [isLoading, isDisabled, onPress]);

  const containerStyle = [
    styles.base,
    variantStyles[variant].container,
    sizeStyles[size].container,
    fullWidth && styles.fullWidth,
    (isDisabled || isLoading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    variantStyles[variant].text,
    sizeStyles[size].text,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      testID={testID}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: typography.fontWeight.semiBold,
    letterSpacing: 0.2,
  },
});

export default memo(AppButton);
