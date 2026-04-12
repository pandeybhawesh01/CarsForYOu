import React, { memo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { theme } from '../../theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  shadow = 'sm',
  padding = 'md',
}) => {
  return (
    <View
      style={[
        styles.card,
        shadow !== 'none' && theme.shadow[shadow],
        paddingStyles[padding],
        style,
      ]}>
      {children}
    </View>
  );
};

const paddingStyles = {
  none: { padding: 0 },
  sm: { padding: spacing.sm },
  md: { padding: spacing.base },
  lg: { padding: spacing.xl },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});

export default memo(AppCard);
