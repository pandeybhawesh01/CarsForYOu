import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { hs, vs } from '../../utils/scaling';

interface StepIndicatorProps {
  totalSteps: number;
  completedSteps: number;
  currentStep?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  completedSteps,
  currentStep,
}) => {
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Your progress</Text>
        <Text style={styles.count}>
          {completedSteps}/{totalSteps}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      {currentStep !== undefined && (
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: vs(12),
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimaryStrong,
    fontWeight: typography.fontWeight.medium,
  },
  count: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  track: {
    height: vs(6),
    backgroundColor: colors.onPrimarySurfaceMedium,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  stepText: {
    fontSize: typography.fontSize.xs,
    color: colors.onPrimarySubtle,
    marginTop: vs(4),
    textAlign: 'right',
  },
});

export default memo(StepIndicator);
