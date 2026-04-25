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

// ─── Constants ───────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type EditorState =
  | { mode: 'list' }
  | { mode: 'part'; partId: string; label: string };

const TAB_ORDER: ExteriorTyreTabId[] = ['front', 'left', 'rear', 'right'];

/** Directional arrow per tab to communicate walkaround direction */
const TAB_DIRECTION_ICON: Record<ExteriorTyreTabId, string> = {
  front: '⬆️',
  left: '⬅️',
  rear: '⬇️',
  right: '➡️',
};

/** Total required fields outside of walkaround photos */
const REQUIRED_FORM_FIELDS = 3; // frontBumper, frontTyreLeft, spareTyre

// ─── Component ───────────────────────────────────────────────────────────────

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

  // ── Completion summary ──────────────────────────────────────────────────────

  /** Count how many required walkaround parts are done across all tabs */
  const { completedRequired, totalRequired } = useMemo(() => {
    let completed = 0;
    let total = 0;
    TAB_ORDER.forEach((tid) => {
      EXTERIOR_TYRE_TAB_PARTS[tid].forEach((p) => {
        if (!p.required) return;
        total += 1;
        if (isPhotoIssueBlockComplete(exteriorTyreParts[p.id], { requirePhoto: true, photoOnlyOk: true })) {
          completed += 1;
        }
      });
    });
    // Add the 3 required form fields
    total += REQUIRED_FORM_FIELDS;
    if (data.frontBumper !== undefined) completed += 1;
    if (data.frontTyreLeft !== undefined) completed += 1;
    if (data.spareTyre !== undefined) completed += 1;
    return { completedRequired: completed, totalRequired: total };
  }, [exteriorTyreParts, data.frontBumper, data.frontTyreLeft, data.spareTyre]);

  const progressFraction = totalRequired > 0 ? completedRequired / totalRequired : 0;

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

  // ── Part detail view ────────────────────────────────────────────────────────

  if (editor.mode === 'part') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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

  // ── Main list view ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Exterior + Tyres"
        subtitle={`Appl. ID : ${appointmentId}`}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Walkaround tab strip with fade-right scroll hint ── */}
        <View style={styles.tabScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}>
            {TAB_ORDER.map((tid) => {
              const done = tabComplete(tid);
              const active = tab === tid;
              return (
                <TouchableOpacity
                  key={tid}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setTab(tid)}
                  activeOpacity={0.85}>
                  <Text style={styles.tabIcon}>{TAB_DIRECTION_ICON[tid]}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {EXTERIOR_TYRE_TAB_LABELS[tid]}
                  </Text>
                  {done && (
                    <Text style={styles.tabCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {/* Subtle right-edge fade to hint at horizontal scrollability */}
          <View style={styles.tabScrollFade} pointerEvents="none" />
        </View>

        {/* ── Walkaround photo rows ── */}
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

        {/* ── Body panels ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body panels</Text>
          <View style={styles.sectionTitleDivider} />
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
          <ConditionSelector
            label="Bonnet"
            value={data.bonnet}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { bonnet: v })}
          />
          <ConditionSelector
            label="Boot Lid"
            value={data.bootLid}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { bootLid: v })}
          />
          <YesNoSelector
            label="Any rust visible?"
            value={data.rust}
            onChange={(v) => updateFormData(InspectionStepId.Exterior, { rust: v })}
          />
        </View>

        {/* ── Tyres (condition) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tyres (condition)</Text>
          <View style={styles.sectionTitleDivider} />
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

        {/* ── Additional photos ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional photos (optional)</Text>
          <View style={styles.sectionTitleDivider} />
          <PhotoCapture
            label="Any damage / issues"
            hint="Optional: capture any visible damage or defects"
            imageUri={undefined}
            onCapture={(uri) => {
              const existing = (media.additionalImages as string[]) || [];
              updateFormData(InspectionStepId.Media, {
                additionalImages: [...existing, uri],
              });
            }}
          />
        </View>

        {/* ── Info card ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>Complete walkaround photos and grading before review.</Text>
        </View>

      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        {/* Completion summary row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {completedRequired} of {totalRequired} required parts inspected
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: progressFraction }]} />
            <View style={{ flex: 1 - progressFraction }} />
          </View>
        </View>

        {/* Consolidated hint — only shown when incomplete */}
        {!isComplete && (
          <Text style={styles.footerHint}>
            ⚠️ Complete all required walkaround photos and fields
          </Text>
        )}

        <AppButton
          label="Next"
          onPress={handleNext}
          isDisabled={!isComplete}
          testID="step6-next-btn"
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const TAB_CHIP_MIN_WIDTH = hs(80);
const TAB_SCROLL_FADE_WIDTH = hs(40);
const PROGRESS_TRACK_HEIGHT = vs(4);
const SECTION_TITLE_DIVIDER_HEIGHT = vs(1);
const INFO_CARD_BORDER_WIDTH = 3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.base,
    paddingBottom: vs(20),
  },

  // ── Tab strip ──────────────────────────────────────────────────────────────

  tabScrollWrapper: {
    marginBottom: vs(12),
    position: 'relative',
    overflow: 'hidden',
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabScrollContent: {
    paddingRight: TAB_SCROLL_FADE_WIDTH, // leave room so last chip isn't hidden by fade
  },
  /** Gradient approximation: opaque-to-transparent white fade on the right edge */
  tabScrollFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: TAB_SCROLL_FADE_WIDTH,
    backgroundColor: colors.background,
    opacity: 0.75,
  },

  tabChip: {
    minWidth: TAB_CHIP_MIN_WIDTH,
    paddingVertical: vs(10),
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
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
  tabIcon: {
    fontSize: vs(20),
    marginBottom: vs(2),
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  /** Inline checkmark below the label — no absolute positioning */
  tabCheck: {
    marginTop: vs(3),
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },

  // ── Sections ───────────────────────────────────────────────────────────────

  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(16),
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(8),
  },
  /** Thin separator line below section title */
  sectionTitleDivider: {
    height: SECTION_TITLE_DIVIDER_HEIGHT,
    backgroundColor: colors.border,
    marginBottom: vs(12),
  },

  // ── Info card ──────────────────────────────────────────────────────────────

  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    borderLeftWidth: INFO_CARD_BORDER_WIDTH,
    borderLeftColor: colors.primary,
    padding: spacing.base,
    marginBottom: vs(16),
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: vs(18),
    marginRight: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    flex: 1,
    lineHeight: typography.lineHeight.base,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────

  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  summaryRow: {
    marginBottom: vs(8),
  },
  summaryText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: vs(4),
  },
  progressTrack: {
    flexDirection: 'row',
    height: PROGRESS_TRACK_HEIGHT,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  footerHint: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: vs(8),
  },
});

export default Step6Media;
