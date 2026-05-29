/**
 * InspectionStepScreen
 *
 * Fully dynamic — renders one CatalogSection per step.
 * The number of steps, their titles, and their fields all come from the
 * catalog API. No hardcoded step list.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import DynamicInspectionStep from './steps/DynamicInspectionStep';
import { useInspectionStore } from '../store/inspectionStore';
import { useAutoSaveDraft } from '../../../hooks/useAutoSaveDraft';
import { useCatalogViewModel, selectCatalog } from '../../../viewmodels/catalogViewModel';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, verticalSpacing } from '../../../constants/spacing';

type Props = InspectionStackScreenProps<'InspectionStep'>;

const InspectionStepScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stepIndex, inspectionId } = route.params;
  // C-1: scoped selector
  const currentSession = useInspectionStore((s) => s.currentSession);
  const catalog = useCatalogViewModel(selectCatalog);
  const loadingState = useCatalogViewModel((s) => s.loadingState);

  useAutoSaveDraft({
    session: currentSession,
    catalog,
    enabled: !!currentSession,
    saveOnUnmount: false,
  });

  const sections = catalog.sections;
  const totalSections = sections.length;

  const handleNext = useCallback(() => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < totalSections) {
      navigation.replace('InspectionStep', { inspectionId, stepIndex: nextIndex });
    } else {
      navigation.navigate('ReviewSubmit', { inspectionId });
    }
  }, [navigation, stepIndex, inspectionId, totalSections]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('InspectionHome', { inspectionId });
    }
  }, [navigation, inspectionId]);

  // Catalog still loading and no sections yet
  if (loadingState === 'loading' && totalSections === 0) {
    return (
      <SafeAreaView style={s.centredSafe} edges={['bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Loading inspection form…</Text>
      </SafeAreaView>
    );
  }

  // No sections available (error or empty catalog)
  if (totalSections === 0) {
    return (
      <SafeAreaView style={s.centredSafe} edges={['bottom']}>
        <Text style={s.errorText}>⚠️ No inspection sections found.</Text>
      </SafeAreaView>
    );
  }

  // Guard against out-of-range index
  if (stepIndex < 0 || stepIndex >= totalSections) {
    navigation.navigate('InspectionHome', { inspectionId });
    return null;
  }

  const section = sections[stepIndex];

  return (
    <DynamicInspectionStep
      section={section}
      sectionIndex={stepIndex}
      totalSections={totalSections}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};

const s = StyleSheet.create({
  centredSafe: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: verticalSpacing.base, padding: spacing.xl },
  loadingText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  errorText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});

export default InspectionStepScreen;
