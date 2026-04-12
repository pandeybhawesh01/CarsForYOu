import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import { useInspectionStore } from '../store/inspectionStore';
import type { InspectionStep } from '../types';
import AppButton from '../../../components/AppButton';
import AppHeader from '../../../components/AppHeader';
import Loader from '../../../components/Loader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs, hs } from '../../../utils/scaling';

type Props = InspectionStackScreenProps<'ReviewSubmit'>;

const SectionReviewCard: React.FC<{
  step: InspectionStep;
  index: number;
  onEdit: (index: number) => void;
}> = ({ step, index, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(index), [index, onEdit]);
  return (
    <View style={reviewStyles.card}>
      <View style={reviewStyles.left}>
        <Text style={reviewStyles.icon}>{step.icon}</Text>
        <View>
          <Text style={reviewStyles.title}>{step.title}</Text>
          <Text
            style={[
              reviewStyles.status,
              step.isCompleted ? reviewStyles.statusOk : reviewStyles.statusPending,
            ]}>
            {step.isCompleted ? '✓ Completed' : '⚠ Incomplete'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleEdit} style={reviewStyles.editBtn}>
        <Text style={reviewStyles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const reviewStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: vs(24), marginRight: spacing.md },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  status: {
    fontSize: typography.fontSize.xs,
    marginTop: vs(2),
    fontWeight: typography.fontWeight.medium,
  },
  statusOk: { color: colors.success },
  statusPending: { color: colors.warning },
  editBtn: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  editText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

const ReviewSubmitScreen: React.FC<Props> = ({ navigation, route }) => {
  const { inspectionId } = route.params;
  const { currentLead, currentSession, submitInspection } = useInspectionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleEditStep = useCallback(
    (index: number) => {
      navigation.navigate('InspectionStep', { inspectionId, stepIndex: index });
    },
    [navigation, inspectionId],
  );

  const handleSubmit = useCallback(() => {
    Alert.alert(
      'Submit Inspection',
      'Are you sure you want to submit this inspection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: () => {
            setIsSubmitting(true);
            setTimeout(() => {
              submitInspection();
              setIsSubmitting(false);
              navigation.replace('InspectionSuccess', { inspectionId });
            }, 1500);
          },
        },
      ],
    );
  }, [navigation, inspectionId, submitInspection]);

  if (!currentSession || !currentLead) {
    return <Loader fullScreen message="Loading inspection..." />;
  }

  const completedCount = currentSession.steps.filter((s) => s.isCompleted).length;
  const allComplete = completedCount === currentSession.steps.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Review & Submit"
        subtitle={`Appt: ${currentSession.appointmentId}`}
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.carName}>
            {currentLead.car.year} {currentLead.car.make} {currentLead.car.model}
          </Text>
          <Text style={styles.regNo}>{currentLead.car.registrationNumber}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedCount / currentSession.steps.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{currentSession.steps.length} sections
            </Text>
          </View>
        </View>

        {/* Sections Review */}
        <View style={styles.sectionsCard}>
          <Text style={styles.sectionsTitle}>Inspection Sections</Text>
          {currentSession.steps.map((step, index) => (
            <SectionReviewCard
              key={step.id}
              step={step}
              index={index}
              onEdit={handleEditStep}
            />
          ))}
        </View>

        {/* Owner Info */}
        <View style={styles.ownerCard}>
          <Text style={styles.ownerTitle}>Owner Details</Text>
          <Text style={styles.ownerName}>{currentLead.owner.name}</Text>
          <Text style={styles.ownerDetail}>{currentLead.owner.phone}</Text>
          <Text style={styles.ownerDetail}>{currentLead.owner.address}</Text>
        </View>

        {!allComplete && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ {currentSession.steps.length - completedCount} section(s) are incomplete.
              Please complete them before submitting.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isSubmitting ? (
          <Loader message="Submitting inspection..." />
        ) : (
          <AppButton
            label="Submit Inspection ✓"
            onPress={handleSubmit}
            isDisabled={!allComplete}
            testID="submit-inspection-btn"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: vs(40) },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(16),
  },
  carName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: vs(4),
  },
  regNo: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimaryMuted,
    marginBottom: vs(16),
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
  },
  progressTrack: {
    flex: 1,
    height: vs(8),
    backgroundColor: colors.onPrimarySurfaceMedium,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  sectionsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(16),
  },
  sectionsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(4),
  },
  ownerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(16),
  },
  ownerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(8),
  },
  ownerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  ownerDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: vs(2),
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    marginBottom: vs(16),
    borderLeftWidth: hs(4),
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    lineHeight: typography.lineHeight.base,
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default ReviewSubmitScreen;
