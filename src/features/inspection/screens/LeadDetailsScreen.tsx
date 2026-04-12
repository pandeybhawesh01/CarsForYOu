import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import { useInspectionStore } from '../store/inspectionStore';
import AppButton from '../../../components/AppButton';
import AppHeader from '../../../components/AppHeader';
import StatusBadge from '../../../components/StatusBadge';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

type Props = InspectionStackScreenProps<'LeadDetails'>;

const DetailRow: React.FC<{ label: string; value: string; icon?: string }> = ({
  label,
  value,
  icon,
}) => (
  <View style={detailStyles.row}>
    <Text style={detailStyles.label}>{icon ? `${icon} ${label}` : label}</Text>
    <Text style={detailStyles.value}>{value}</Text>
  </View>
);

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
});

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={sectionStyles.container}>
    <Text style={sectionStyles.title}>{title}</Text>
  </View>
);
const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(8),
    marginBottom: vs(4),
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const LeadDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLead } = useInspectionStore();

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleStartInspection = useCallback(() => {
    navigation.replace('InspectionHome', {
      inspectionId: currentLead?.id ?? '',
    });
  }, [navigation, currentLead]);

  if (!currentLead) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lead not found.</Text>
      </View>
    );
  }

  const { car, owner, location, appointmentId, status, scheduledAt } = currentLead;
  const scheduled = new Date(scheduledAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Lead Details"
        subtitle={`Appt: ${appointmentId}`}
        onBack={handleBack}
        rightAction={<StatusBadge status={status} />}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.carIconLarge}>
            <Text style={styles.carIconText}>🚗</Text>
          </View>
          <Text style={styles.carName}>
            {car.year} {car.make} {car.model}
          </Text>
          <Text style={styles.carVariant}>{car.variant}</Text>
          <View style={styles.tagsRow}>
            <Tag label={car.fuelType} />
            <Tag label={car.transmission} />
            <Tag label={`${car.kmDriven.toLocaleString('en-IN')} km`} />
          </View>
        </View>

        {/* Car Details */}
        <SectionHeader title="Vehicle Information" />
        <View style={styles.section}>
          <DetailRow label="Registration No." value={car.registrationNumber} icon="🔖" />
          <DetailRow label="Registration State" value={car.registrationState} icon="📍" />
          <DetailRow label="Color" value={car.color} icon="🎨" />
          <DetailRow label="Owner Count" value={`${car.ownerCount}${car.ownerCount === 1 ? 'st' : car.ownerCount === 2 ? 'nd' : 'rd'} Owner`} icon="👤" />
          <DetailRow label="Insurance Valid" value={car.insuranceValidity} icon="🛡️" />
        </View>

        {/* Owner Details */}
        <SectionHeader title="Owner Information" />
        <View style={styles.section}>
          <DetailRow label="Name" value={owner.name} icon="👤" />
          <DetailRow label="Phone" value={`+91 ${owner.phone}`} icon="📱" />
          <DetailRow label="City" value={owner.city} icon="🏙️" />
          <DetailRow label="Pincode" value={owner.pincode} icon="📮" />
        </View>

        {/* Appointment */}
        <SectionHeader title="Appointment Details" />
        <View style={styles.section}>
          <DetailRow label="Scheduled At" value={scheduled} icon="📅" />
          <DetailRow label="Appointment ID" value={appointmentId} icon="🎫" />
        </View>

        {/* Location */}
        <SectionHeader title="Inspection Location" />
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{location.address}</Text>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <AppButton
          label="Start Inspection →"
          onPress={handleStartInspection}
          testID="start-inspection-btn"
        />
      </View>
    </SafeAreaView>
  );
};

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <View style={tagStyles.tag}>
    <Text style={tagStyles.text}>{label}</Text>
  </View>
);
const tagStyles = StyleSheet.create({
  tag: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    marginRight: hs(6),
    marginTop: vs(4),
  },
  text: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  heroCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: vs(28),
    paddingHorizontal: spacing.base,
    marginBottom: vs(8),
  },
  carIconLarge: {
    width: hs(72),
    height: hs(72),
    borderRadius: borderRadius.full,
    backgroundColor: colors.onPrimarySurfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  carIconText: {
    fontSize: vs(36),
  },
  carName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: vs(4),
    textAlign: 'center',
  },
  carVariant: {
    fontSize: typography.fontSize.base,
    color: colors.onPrimaryEmphasis,
    marginBottom: vs(12),
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    marginBottom: vs(4),
  },
  locationCard: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.base,
    marginBottom: vs(8),
  },
  locationIcon: {
    fontSize: vs(20),
    marginRight: spacing.sm,
  },
  locationText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
    lineHeight: typography.lineHeight.md,
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default LeadDetailsScreen;
