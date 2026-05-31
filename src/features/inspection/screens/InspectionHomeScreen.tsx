import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
import { useAutoSaveDraft } from '../../../hooks/useAutoSaveDraft';
import { useCatalogViewModel, selectCatalog } from '../../../viewmodels/catalogViewModel';
import { computeSectionProgress, type SectionProgress } from '../utils/inspectionProgress';

type Props = InspectionStackScreenProps<'InspectionHome'>;

const SectionCard: React.FC<{
  step: InspectionStep;
  index: number;
  progress?: SectionProgress;
  onPress: (index: number) => void;
}> = ({ step, index, progress, onPress }) => {
  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  // Heading-level progress (e.g. "1/2 sections"). Falls back to the legacy
  // boolean text when this section has no countable headings.
  const hasProgress = Boolean(progress && progress.total > 0);
  const allHeadingsDone = hasProgress && progress!.completed === progress!.total;
  const isComplete = step.isCompleted || allHeadingsDone;

  const subtitle = hasProgress
    ? (allHeadingsDone
        ? 'Completed ✓'
        : `${progress!.completed}/${progress!.total} completed`)
    : (step.isCompleted ? 'Completed ✓' : 'Tap to fill');

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
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {isComplete ? (
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
  // C-1: scoped selectors instead of whole-store destructure.
  const currentLead = useInspectionStore((s) => s.currentLead);
  const currentSession = useInspectionStore((s) => s.currentSession);
  const draftStatus = useInspectionStore((s) => s.draftStatus);
  const catalog = useCatalogViewModel(selectCatalog);
  
  // Auto-save with unmount save enabled (for app close or back to dashboard)
  useAutoSaveDraft({
    session: currentSession,
    catalog,
    enabled: !!currentSession,
    saveOnUnmount: true, // Save on unmount when leaving inspection flow
    draftStatus,
  });

  const completedCount = useMemo(
    () => currentSession?.steps.filter((s) => s.isCompleted).length ?? 0,
    [currentSession],
  );
  const allComplete = useMemo(
    () => completedCount === (currentSession?.steps.length ?? 6),
    [completedCount, currentSession],
  );

  // Heading-level progress per section ("doors", "accessories", ...).
  // Computed ONLY when this screen gains focus — never during field entry
  // (which happens on the step screen). Cheap data walk, off the typing path.
  const [sectionProgress, setSectionProgress] = useState<Record<string, SectionProgress>>({});

  useFocusEffect(
    useCallback(() => {
      const formData = currentSession?.formData;
      if (!formData || catalog.sections.length === 0) return;

      const next: Record<string, SectionProgress> = {};
      for (const section of catalog.sections) {
        try {
          const sectionData = (formData[section.section as keyof typeof formData] ?? {}) as Record<string, unknown>;
          next[section.section] = computeSectionProgress(section, sectionData);
        } catch (err) {
          // Never let a single malformed section crash the home screen —
          // just skip its progress (card falls back to the legacy text).
          console.warn('[InspectionHome] progress compute failed for', section.section, err);
        }
      }
      setSectionProgress(next);
    }, [currentSession?.formData, catalog.sections]),
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
    console.log('[InspectionHome] 📋 Navigating to Review & Submit screen');
    console.log('[InspectionHome] 📊 Current session state:', {
      completedSteps: currentSession?.steps.filter(s => s.isCompleted).length,
      totalSteps: currentSession?.steps.length,
      appointmentId: currentSession?.appointmentId,
    });
    navigation.navigate('ReviewSubmit', {
      inspectionId: currentLead?.id ?? '',
    });
  }, [navigation, currentLead, currentSession]);

  const renderStep = useCallback(
    ({ item, index }: { item: InspectionStep; index: number }) => (
      <SectionCard
        step={item}
        index={index}
        progress={sectionProgress[item.id as unknown as string]}
        onPress={handleStepPress}
      />
    ),
    [handleStepPress, sectionProgress],
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
            ℹ️ You can proceed to review and submit with partial data.
          </Text>
        )}
        <AppButton
          label={allComplete ? '✓ Review & Submit' : `Review & Submit (${completedCount}/${currentSession.steps.length} completed)`}
          onPress={handleDone}
          isDisabled={false}
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
