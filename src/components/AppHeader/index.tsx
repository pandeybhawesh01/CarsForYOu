import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, verticalSpacing, iconSize } from '../../constants/spacing';
import { hs, vs } from '../../utils/scaling';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'primary' | 'white';
  style?: ViewStyle;
}

const BackArrow: React.FC<{ color: string }> = ({ color }) => (
  <Text style={[styles.backArrow, { color }]}>{'←'}</Text>
);

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  variant = 'primary',
  style,
}) => {
  const insets = useSafeAreaInsets();
  const isPrimary = variant === 'primary';

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  return (
    <>
      <StatusBar
        barStyle={isPrimary ? 'light-content' : 'dark-content'}
        backgroundColor={isPrimary ? colors.primary : colors.surface}
      />
      <View
        style={[
          styles.container,
          isPrimary ? styles.containerPrimary : styles.containerWhite,
          { paddingTop: insets.top + vs(12) },
          style,
        ]}>
        <View style={styles.row}>
          {onBack !== undefined && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="header-back-btn">
              <BackArrow color={isPrimary ? colors.white : colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                isPrimary ? styles.titlePrimary : styles.titleWhite,
              ]}
              numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  isPrimary ? styles.subtitlePrimary : styles.subtitleWhite,
                ]}
                numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightAction ? (
            <View style={styles.rightAction}>{rightAction}</View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingBottom: vs(12),
  },
  containerPrimary: {
    backgroundColor: colors.primary,
  },
  containerWhite: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  backArrow: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  titlePrimary: {
    color: colors.white,
  },
  titleWhite: {
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: vs(2),
  },
  subtitlePrimary: {
    color: colors.onPrimaryMuted,
  },
  subtitleWhite: {
    color: colors.textSecondary,
  },
  rightAction: {
    marginLeft: spacing.sm,
  },
  placeholder: {
    width: hs(36),
  },
});

export default memo(AppHeader);
