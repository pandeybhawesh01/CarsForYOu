import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { InspectionStatus } from '../../features/inspection/types';
import { hs, vs } from '../../utils/scaling';

interface StatusBadgeProps {
  status: InspectionStatus;
}

const statusConfig: Record<
  InspectionStatus,
  { label: string; bg: string; text: string }
> = {
  [InspectionStatus.Pending]: {
    label: 'Pending',
    bg: colors.warningLight,
    text: colors.warning,
  },
  [InspectionStatus.InProgress]: {
    label: 'In Progress',
    bg: colors.primaryLight,
    text: colors.primary,
  },
  [InspectionStatus.Completed]: {
    label: 'Completed',
    bg: colors.successLight,
    text: colors.success,
  },
  [InspectionStatus.Cancelled]: {
    label: 'Cancelled',
    bg: colors.errorLight,
    text: colors.error,
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: hs(6),
    height: hs(6),
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(StatusBadge);
