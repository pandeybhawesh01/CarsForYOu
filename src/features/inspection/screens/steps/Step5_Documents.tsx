import React, { useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, YesNoNA, Condition } from '../../types';
import YesNoSelector from '../../components/YesNoSelector';
import ConditionSelector from '../../components/ConditionSelector';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing } from '../../../../constants/spacing';
import { vs } from '../../../../utils/scaling';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const Step5Documents: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.documents ?? {};

  const updateYN = useCallback(
    (key: keyof typeof data, val: YesNoNA) =>
      updateFormData(InspectionStepId.Documents, { [key]: val }),
    [updateFormData],
  );

  const updateCond = useCallback(
    (key: keyof typeof data, val: Condition) =>
      updateFormData(InspectionStepId.Documents, { [key]: val }),
    [updateFormData],
  );

  const isComplete =
    (data as Record<string, YesNoNA>).powerWindows !== undefined &&
    (data as Record<string, YesNoNA>).acBlower !== undefined &&
    (data as Record<string, Condition>).dashboardCondition !== undefined;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Documents);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Electricals + Interiors" subtitle="Step 5 of 6" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Electrical Checks</Text>
          <YesNoSelector label="Power Windows Working?" value={(data as Record<string, YesNoNA>).powerWindows} onChange={(v) => updateYN('powerWindows' as keyof typeof data, v)} isRequired />
          <YesNoSelector label="Central Locking Working?" value={(data as Record<string, YesNoNA>).centralLocking} onChange={(v) => updateYN('centralLocking' as keyof typeof data, v)} />
          <YesNoSelector label="Headlamps Working?" value={(data as Record<string, YesNoNA>).headlamps} onChange={(v) => updateYN('headlamps' as keyof typeof data, v)} />
          <YesNoSelector label="Tail Lamps Working?" value={(data as Record<string, YesNoNA>).tailLamps} onChange={(v) => updateYN('tailLamps' as keyof typeof data, v)} />
          <YesNoSelector label="Horn Working?" value={(data as Record<string, YesNoNA>).horn} onChange={(v) => updateYN('horn' as keyof typeof data, v)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Checks</Text>
          <ConditionSelector label="Dashboard Condition" value={(data as Record<string, Condition>).dashboardCondition} onChange={(v) => updateCond('dashboardCondition' as keyof typeof data, v)} isRequired />
          <ConditionSelector label="Seats & Upholstery" value={(data as Record<string, Condition>).seatsCondition} onChange={(v) => updateCond('seatsCondition' as keyof typeof data, v)} />
          <YesNoSelector label="AC Blower Working?" value={(data as Record<string, YesNoNA>).acBlower} onChange={(v) => updateYN('acBlower' as keyof typeof data, v)} isRequired />
          <YesNoSelector label="Music System Working?" value={(data as Record<string, YesNoNA>).musicSystem} onChange={(v) => updateYN('musicSystem' as keyof typeof data, v)} includeNA />
          <YesNoSelector label="Instrument Cluster Lights OK?" value={(data as Record<string, YesNoNA>).clusterLights} onChange={(v) => updateYN('clusterLights' as keyof typeof data, v)} />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        {!isComplete && <Text style={styles.hint}>* Complete required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step5-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  section: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.base, marginBottom: vs(16) },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: vs(16) },
  footer: { padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  hint: { fontSize: typography.fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: vs(8) },
});

export default Step5Documents;
