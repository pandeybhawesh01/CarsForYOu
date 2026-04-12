import React, { useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, Condition, YesNoNA } from '../../types';
import ConditionSelector from '../../components/ConditionSelector';
import YesNoSelector from '../../components/YesNoSelector';
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

const Step3Interior: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.engine ?? {};

  const updateCond = useCallback(
    (key: keyof typeof data, val: Condition) =>
      updateFormData(InspectionStepId.Engine, { [key]: val }),
    [updateFormData],
  );

  const updateYN = useCallback(
    (key: keyof typeof data, val: YesNoNA) =>
      updateFormData(InspectionStepId.Engine, { [key]: val }),
    [updateFormData],
  );

  const isComplete =
    (data as Record<string, Condition>).steeringPlay !== undefined &&
    (data as Record<string, Condition>).frontBrakes !== undefined &&
    (data as Record<string, YesNoNA>).handBrakeWorking !== undefined;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Engine);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Steering + Brakes" subtitle="Step 4 of 6" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steering</Text>
          <ConditionSelector label="Steering Free Play" value={(data as Record<string, Condition>).steeringPlay} onChange={(v) => updateCond('steeringPlay' as keyof typeof data, v)} isRequired />
          <ConditionSelector label="Steering Noise Condition" value={(data as Record<string, Condition>).steeringNoise} onChange={(v) => updateCond('steeringNoise' as keyof typeof data, v)} />
          <ConditionSelector label="Power Steering / EPS condition" value={(data as Record<string, Condition>).powerSteering} onChange={(v) => updateCond('powerSteering' as keyof typeof data, v)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Braking</Text>
          <ConditionSelector label="Front Brakes Condition" value={(data as Record<string, Condition>).frontBrakes} onChange={(v) => updateCond('frontBrakes' as keyof typeof data, v)} isRequired />
          <ConditionSelector label="Rear Brakes Condition" value={(data as Record<string, Condition>).rearBrakes} onChange={(v) => updateCond('rearBrakes' as keyof typeof data, v)} />
          <ConditionSelector label="Brake Pedal Feel" value={(data as Record<string, Condition>).brakePedalFeel} onChange={(v) => updateCond('brakePedalFeel' as keyof typeof data, v)} />
          <YesNoSelector label="Hand brake working?" value={(data as Record<string, YesNoNA>).handBrakeWorking} onChange={(v) => updateYN('handBrakeWorking' as keyof typeof data, v)} isRequired />
          <YesNoSelector label="ABS warning light ON?" value={(data as Record<string, YesNoNA>).absWarning} onChange={(v) => updateYN('absWarning' as keyof typeof data, v)} />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        {!isComplete && <Text style={styles.hint}>* Complete required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step4-next-btn" />
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

export default Step3Interior;
