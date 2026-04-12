import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, type PhotoIssueInspectionBlock } from '../../types';
import ConditionSelector from '../../components/ConditionSelector';
import YesNoSelector from '../../components/YesNoSelector';
import PhotoCapture from '../../components/PhotoCapture';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import InspectionPhotoSummaryRow from '../../components/InspectionPhotoSummaryRow';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import {
  EXTERIOR_PART_ISSUE_OPTIONS,
  EXTERIOR_TYRE_TAB_LABELS,
  EXTERIOR_TYRE_TAB_PARTS,
  type ExteriorTyreTabId,
} from '../../../../constants/inspectionSchema';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, borderRadius } from '../../../../constants/spacing';
import { vs, hs } from '../../../../utils/scaling';
import { isPhotoIssueBlockComplete } from '../../utils/photoInspection';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type EditorState =
  | { mode: 'list' }
  | { mode: 'part'; partId: string; label: string };

const TAB_ORDER: ExteriorTyreTabId[] = ['front', 'left', 'rear', 'right'];

const Step6Media: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const media = currentSession?.formData.media ?? { additionalImages: [] };
  const data = currentSession?.formData.exterior ?? {};
  const appointmentId = currentSession?.appointmentId ?? '';

  const [tab, setTab] = useState<ExteriorTyreTabId>('front');
  const [editor, setEditor] = useState<EditorState>({ mode: 'list' });

  const exteriorTyreParts = media.exteriorTyreParts ?? {};

  const updatePart = useCallback(
    (partId: string, block: PhotoIssueInspectionBlock) => {
      updateFormData(InspectionStepId.Media, {
        exteriorTyreParts: { ...exteriorTyreParts, [partId]: block },
      });
    },
    [exteriorTyreParts, updateFormData],
  );

  const tabComplete = useCallback(
    (tid: ExteriorTyreTabId) =>
      EXTERIOR_TYRE_TAB_PARTS[tid].every(
        (p) =>
          !p.required ||
          isPhotoIssueBlockComplete(exteriorTyreParts[p.id], { requirePhoto: true, photoOnlyOk: true }),
      ),
    [exteriorTyreParts],
  );

  const allExteriorPartsDone = useMemo(
    () => TAB_ORDER.every((tid) => tabComplete(tid)),
    [tabComplete],
  );

  const isComplete =
    allExteriorPartsDone &&
    data.frontBumper !== undefined &&
    data.frontTyreLeft !== undefined &&
    data.spareTyre !== undefined;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Media);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  const parts = EXTERIOR_TYRE_TAB_PARTS[tab];

  if (editor.mode === 'part') {
    return (
      <SafeAreaView style={[styles.safeArea, styles.partDetailSafe]} edges={['bottom']}>
        <InspectionImageDetailPanel
          title={editor.label}
          subtitle={`Appl. ID : ${appointmentId}`}
          issueOptions={EXTERIOR_PART_ISSUE_OPTIONS}
          value={exteriorTyreParts[editor.partId]}
          onChange={(block) => updatePart(editor.partId, block)}
          onBack={() => setEditor({ mode: 'list' })}
          layout="photoFirstSubmit"
          photoLabel="Photo"
          listBackTitle="Exterior + Tyres"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Exterior + Tyres"
        subtitle={`Appl. ID : ${appointmentId}`}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {TAB_ORDER.map((tid) => {
            const done = tabComplete(tid);
            const active = tab === tid;
            return (
              <TouchableOpacity
                key={tid}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setTab(tid)}
                activeOpacity={0.85}>
                <Text style={styles.tabIcon}>🚗</Text>
                {done ? <Text style={styles.tabCheck}>✓</Text> : null}
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {EXTERIOR_TYRE_TAB_LABELS[tid]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.section}>
          {parts.map((p) => (
            <InspectionPhotoSummaryRow
              key={p.id}
              label={p.label}
              isRequired={p.required}
              block={exteriorTyreParts[p.id]}
              onEdit={() => setEditor({ mode: 'part', partId: p.id, label: p.label })}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body panels</Text>
          <ConditionSelector
            label="Front Bumper"
            value={data.frontBumper}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { frontBumper: v })}
            isRequired
          />
          <ConditionSelector
            label="Rear Bumper"
            value={data.rearBumper}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { rearBumper: v })}
          />
          <ConditionSelector label="Bonnet" value={data.bonnet} onChange={(v) => updateFormData(InspectionStepId.Exterior, { bonnet: v })} />
          <ConditionSelector label="Boot Lid" value={data.bootLid} onChange={(v) => updateFormData(InspectionStepId.Exterior, { bootLid: v })} />
          <YesNoSelector label="Any rust visible?" value={data.rust} onChange={(v) => updateFormData(InspectionStepId.Exterior, { rust: v })} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tyres (condition)</Text>
          <ConditionSelector
            label="Front Left Tyre"
            value={data.frontTyreLeft}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { frontTyreLeft: v })}
            isRequired
          />
          <ConditionSelector
            label="Front Right Tyre"
            value={data.frontTyreRight}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { frontTyreRight: v })}
          />
          <ConditionSelector
            label="Rear Left Tyre"
            value={data.rearTyreLeft}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { rearTyreLeft: v })}
          />
          <ConditionSelector
            label="Rear Right Tyre"
            value={data.rearTyreRight}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { rearTyreRight: v })}
          />
          <YesNoSelector
            label="Spare Tyre Present?"
            value={data.spareTyre}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { spareTyre: v })}
            isRequired
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional photos (optional)</Text>
          <PhotoCapture
            label="Any damage / issues"
            hint="Close-up of any damage, scratches or defects"
            imageUri={undefined}
            onCapture={(uri) => {
              const existing = (media.additionalImages as string[]) || [];
              updateFormData(InspectionStepId.Media, {
                additionalImages: [...existing, uri],
              });
            }}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>Complete walkaround photos and grading before review.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>You may go to next section once this is completed.</Text>
        {!isComplete && (
          <Text style={styles.hint}>* Complete all required walkaround photos and fields</Text>
        )}
        <AppButton label="Next" onPress={handleNext} isDisabled={!isComplete} testID="step6-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  partDetailSafe: { backgroundColor: colors.surface },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  tabScroll: { marginBottom: vs(12) },
  tabChip: {
    position: 'relative',
    minWidth: hs(76),
    paddingVertical: vs(10),
    paddingHorizontal: hs(12),
    marginRight: hs(10),
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tabIcon: { fontSize: vs(20), marginBottom: vs(2) },
  tabCheck: {
    position: 'absolute',
    top: vs(4),
    right: hs(6),
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  tabLabelActive: { color: colors.primary },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: vs(16),
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(16),
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: vs(16),
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: vs(18), marginRight: spacing.sm },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    flex: 1,
    lineHeight: typography.lineHeight.base,
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
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(8),
  },
});

export default Step6Media;
