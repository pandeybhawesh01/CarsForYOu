import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, Condition, YesNoNA } from '../../types';
import ConditionSelector from '../../components/ConditionSelector';
import YesNoSelector from '../../components/YesNoSelector';
import InspectionPhotoSummaryRow from '../../components/InspectionPhotoSummaryRow';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import { AC_PANEL_ISSUE_OPTIONS } from '../../../../constants/inspectionSchema';
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

const Step2Exterior: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.interior ?? {};
  const media = currentSession?.formData.media ?? { additionalImages: [] };
  const [acPanelOpen, setAcPanelOpen] = useState(false);

  const updateCond = useCallback(
    (key: keyof typeof data, val: Condition) =>
      updateFormData(InspectionStepId.Exterior, { [key]: val }),
    [updateFormData],
  );

  const updateYN = useCallback(
    (key: keyof typeof data, val: YesNoNA) =>
      updateFormData(InspectionStepId.Exterior, { [key]: val }),
    [updateFormData],
  );

  const isComplete =
    (data as Record<string, Condition>).acCompressor !== undefined &&
    (data as Record<string, YesNoNA>).acCoolingAtIdle !== undefined &&
    (data as Record<string, YesNoNA>).acCoolingAt2000Rpm !== undefined;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Interior);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Air Conditioning" subtitle="Step 3 of 6" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooling Performance</Text>
          <YesNoSelector label="AC cooling at idle?" value={(data as Record<string, YesNoNA>).acCoolingAtIdle} onChange={(v) => updateYN('acCoolingAtIdle' as keyof typeof data, v)} isRequired />
          <YesNoSelector label="AC cooling at 2000 rpm?" value={(data as Record<string, YesNoNA>).acCoolingAt2000Rpm} onChange={(v) => updateYN('acCoolingAt2000Rpm' as keyof typeof data, v)} isRequired />
          <ConditionSelector label="AC Compressor Condition" value={(data as Record<string, Condition>).acCompressor} onChange={(v) => updateCond('acCompressor' as keyof typeof data, v)} isRequired />
          <ConditionSelector label="Condenser Condition" value={(data as Record<string, Condition>).acCondenser} onChange={(v) => updateCond('acCondenser' as keyof typeof data, v)} />
          <ConditionSelector label="Blower Speed & Noise" value={(data as Record<string, Condition>).acBlower} onChange={(v) => updateCond('acBlower' as keyof typeof data, v)} />
          <YesNoSelector label="Any foul smell from vents?" value={(data as Record<string, YesNoNA>).acFoulSmell} onChange={(v) => updateYN('acFoulSmell' as keyof typeof data, v)} />
          <InspectionPhotoSummaryRow
            label="AC Panel / Temperature"
            block={media.acPanelInspection}
            onEdit={() => setAcPanelOpen(true)}
          />
        </View>

      </ScrollView>

      <Modal visible={acPanelOpen} animationType="slide" onRequestClose={() => setAcPanelOpen(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
          <InspectionImageDetailPanel
            title="AC Panel / Temperature"
            issueOptions={AC_PANEL_ISSUE_OPTIONS}
            value={media.acPanelInspection}
            onChange={(block) =>
              updateFormData(InspectionStepId.Media, {
                acPanelInspection: block,
                acPanelImage: block.photos?.[0] ?? '',
              })
            }
            onBack={() => setAcPanelOpen(false)}
            layout="photoFirstSubmit"
            listBackTitle="Air Conditioning"
            photoLabel="Photo"
          />
        </SafeAreaView>
      </Modal>

      <View style={styles.footer}>
        {!isComplete && <Text style={styles.hint}>* Complete required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step3-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  section: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.base, marginBottom: vs(16) },
  sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: vs(16) },
  footer: { padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  hint: { fontSize: typography.fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: vs(8) },
});

export default Step2Exterior;
