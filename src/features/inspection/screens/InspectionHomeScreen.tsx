import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import { useInspectionStore } from '../store/inspectionStore';
import type { InspectionStep } from '../types';
import StepIndicator from '../../../components/StepIndicator';
import AppButton from '../../../components/AppButton';
import AppHeader from '../../../components/AppHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { theme } from '../../../theme';
import { hs, vs } from '../../../utils/scaling';

type Props = InspectionStackScreenProps<'InspectionHome'>;

const SectionCard: React.FC<{
  step: InspectionStep;
  index: number;
  onPress: (index: number) => void;
}> = ({ step, index, onPress }) => {
  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  return (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={handlePress}
      activeOpacity={0.85}>
      <View style={styles.sectionIcon}>
        <Text style={styles.sectionIconText}>{step.icon}</Text>
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{step.title}</Text>
        <Text style={styles.sectionSubtitle}>
          {step.isCompleted ? 'Completed ✓' : 'Tap to fill'}
        </Text>
      </View>
      {step.isCompleted ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedIcon}>✓</Text>
        </View>
      ) : (
        <View style={styles.pendingBadge}>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const InspectionHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLead, currentSession } = useInspectionStore();

  const completedCount = useMemo(
    () => currentSession?.steps.filter((s) => s.isCompleted).length ?? 0,
    [currentSession],
  );
  const allComplete = useMemo(
    () => completedCount === (currentSession?.steps.length ?? 6),
    [completedCount, currentSession],
  );

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleStepPress = useCallback(
    (index: number) => {
      navigation.navigate('InspectionStep', {
        inspectionId: currentLead?.id ?? '',
        stepIndex: index,
      });
    },
    [navigation, currentLead],
  );

  const handleDone = useCallback(() => {
    navigation.navigate('ReviewSubmit', {
      inspectionId: currentLead?.id ?? '',
    });
  }, [navigation, currentLead]);

  const renderStep = useCallback(
    ({ item, index }: { item: InspectionStep; index: number }) => (
      <SectionCard step={item} index={index} onPress={handleStepPress} />
    ),
    [handleStepPress],
  );

  const keyExtractor = useCallback((item: InspectionStep) => item.id, []);

  if (!currentSession) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Blue Header with progress */}
      <AppHeader
        title="Inspection"
        subtitle={`Appt ID: ${currentSession.appointmentId}`}
        onBack={handleBack}
      />
      <StepIndicator
        totalSteps={currentSession.steps.length}
        completedSteps={completedCount}
      />

      {/* Car info strip */}
      <View style={styles.carStrip}>
        <Text style={styles.carName}>
          {currentLead?.car.year} {currentLead?.car.make} {currentLead?.car.model}
        </Text>
        <Text style={styles.regNumber}>{currentLead?.car.registrationNumber}</Text>
      </View>

      <FlatList
        data={currentSession.steps}
        renderItem={renderStep}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Done Button */}
      <View style={styles.footer}>
        {!allComplete && (
          <Text style={styles.footerHint}>
            ℹ️ You may proceed to review once all sections are completed.
          </Text>
        )}
        <AppButton
          label={allComplete ? '✓ Review & Submit' : `Complete All Sections (${completedCount}/${currentSession.steps.length})`}
          onPress={handleDone}
          isDisabled={!allComplete}
          testID="done-btn"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carStrip: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  regNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimaryMuted,
  },
  listContent: {
    padding: spacing.base,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    ...theme.shadow.sm,
  },
  sectionIcon: {
    width: hs(44),
    height: hs(44),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionIconText: {
    fontSize: vs(22),
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(2),
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  completedBadge: {
    width: hs(30),
    height: hs(30),
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  pendingBadge: {
    width: hs(30),
    height: hs(30),
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: typography.fontSize.xl,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.bold,
  },
  separator: {
    height: vs(10),
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(8),
  },
});

export default InspectionHomeScreen;
