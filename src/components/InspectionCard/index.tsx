import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { InspectionStatus } from '../../features/inspection/types';
import type { InspectionLead } from '../../features/inspection/types';
import StatusBadge from '../StatusBadge';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { theme } from '../../theme';
import { hs, vs } from '../../utils/scaling';

interface InspectionCardProps {
  lead: InspectionLead;
  onPress: (lead: InspectionLead) => void;
}

const InspectionCard: React.FC<InspectionCardProps> = ({ lead, onPress }) => {
  const handlePress = useCallback(() => onPress(lead), [lead, onPress]);

  const scheduledDate = new Date(lead.scheduledAt);
  const timeStr = scheduledDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = scheduledDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.carIconContainer}>
          <Text style={styles.carIcon}>🚗</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.carName} numberOfLines={1}>
            {lead.car.year} {lead.car.make} {lead.car.model}
          </Text>
          <Text style={styles.variant} numberOfLines={1}>
            {lead.car.variant} • {lead.car.fuelType}
          </Text>
        </View>
        <StatusBadge status={lead.status} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Row */}
      <View style={styles.details}>
        <DetailItem icon="📋" label="Appt ID" value={lead.appointmentId} />
        <DetailItem icon="📍" label="City" value={lead.owner.city} />
        <DetailItem icon="⏰" label="Time" value={`${dateStr} ${timeStr}`} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.kmRow}>
          <Text style={styles.kmText}>
            🏁 {lead.car.kmDriven.toLocaleString('en-IN')} km
          </Text>
          <Text style={styles.regText}>{lead.car.registrationNumber}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DetailItem: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={detailStyles.container}>
    <Text style={detailStyles.icon}>{icon}</Text>
    <Text style={detailStyles.label}>{label}</Text>
    <Text style={detailStyles.value} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: vs(16),
    marginBottom: vs(2),
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: vs(2),
  },
  value: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.base,
    marginBottom: vs(12),
    ...theme.shadow.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingBottom: vs(12),
  },
  carIconContainer: {
    width: hs(44),
    height: hs(44),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  carIcon: {
    fontSize: vs(24),
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  carName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(2),
  },
  variant: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.base,
  },
  details: {
    flexDirection: 'row',
    padding: spacing.base,
    paddingTop: vs(12),
    paddingBottom: vs(12),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: vs(12),
  },
  kmRow: {
    flex: 1,
  },
  kmText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  regText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: vs(2),
  },
  chevronContainer: {
    width: hs(28),
    height: hs(28),
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.xl,
  },
});

export default memo(InspectionCard);
