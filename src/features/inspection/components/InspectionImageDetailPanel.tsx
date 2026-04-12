import React, { memo, useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { PhotoIssueInspectionBlock } from '../types';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';
import PhotoCapture from './PhotoCapture';
import AppButton from '../../../components/AppButton';
import { PHOTO_STATUS_ATTENTION, PHOTO_STATUS_GOOD } from '../utils/photoInspection';

const STATUS_OPTIONS = [
  { label: 'Good', value: PHOTO_STATUS_GOOD },
  { label: 'Attention needed', value: PHOTO_STATUS_ATTENTION },
] as const;

export type InspectionImageDetailLayout = 'coolant' | 'photoFirstSubmit';

interface Props {
  title: string;
  subtitle?: string;
  issueOptions: readonly string[];
  value: PhotoIssueInspectionBlock | undefined;
  onChange: (next: PhotoIssueInspectionBlock) => void;
  onBack: () => void;
  photoLabel?: string;
  layout: InspectionImageDetailLayout;
  /** Shown on the back row for `photoFirstSubmit` (e.g. Car Details, Engine components). */
  listBackTitle?: string;
  /** Optional content below the photo (e.g. chassis number) before the submit bar. */
  extraBottom?: ReactNode;
  /** When the screen already has an `AppHeader`, hide the panel's back row. */
  hideBackRow?: boolean;
}

const InspectionImageDetailPanel: React.FC<Props> = ({
  title,
  subtitle,
  issueOptions,
  value,
  onChange,
  onBack,
  photoLabel = 'Photo',
  layout,
  listBackTitle = 'Exterior + Tyres',
  extraBottom,
  hideBackRow = false,
}) => {
  const [draft, setDraft] = useState<PhotoIssueInspectionBlock>(() => value ?? {});

  useEffect(() => {
    setDraft(value ?? {});
  }, [value, title, layout]);

  const primaryPhoto = draft.photos?.[0];
  const issues = draft.issues ?? [];
  const status = draft.status;

  const setPatch = useCallback(
    (patch: Partial<PhotoIssueInspectionBlock>) => {
      if (layout === 'coolant') {
        onChange({ ...value, ...patch });
        return;
      }
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [layout, onChange, value],
  );

  const setStatusCoolant = useCallback(
    (s: string) => {
      if (s === PHOTO_STATUS_GOOD) {
        onChange({ ...value, status: s, issues: [] });
      } else {
        setPatch({ status: s });
      }
    },
    [onChange, setPatch, value],
  );

  const toggleIssue = useCallback(
    (issue: string) => {
      const list = layout === 'coolant' ? value?.issues ?? [] : issues;
      const next = list.includes(issue) ? list.filter((i) => i !== issue) : [...list, issue];
      setPatch({ issues: next, status: PHOTO_STATUS_ATTENTION });
    },
    [issues, layout, setPatch, value?.issues],
  );

  const onPhoto = useCallback(
    (uri: string) => {
      if (!uri) {
        setPatch({ photos: [] });
        return;
      }
      setPatch({ photos: [uri] });
    },
    [setPatch],
  );

  const pressAllOk = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      status: PHOTO_STATUS_GOOD,
      issues: [],
    }));
  }, []);

  const canSubmitPhotoFirst = (() => {
    if (!primaryPhoto) {
      return false;
    }
    if (issueOptions.length === 0) {
      return true;
    }
    return status === PHOTO_STATUS_GOOD || (status === PHOTO_STATUS_ATTENTION && issues.length > 0);
  })();

  const handleSubmit = useCallback(() => {
    if (!canSubmitPhotoFirst) {
      return;
    }
    const next: PhotoIssueInspectionBlock = {
      ...draft,
      photos: primaryPhoto ? [primaryPhoto] : [],
    };
    if (issueOptions.length === 0 && !next.status) {
      next.status = PHOTO_STATUS_GOOD;
      next.issues = [];
    }
    onChange(next);
    onBack();
  }, [canSubmitPhotoFirst, draft, issueOptions.length, onBack, onChange, primaryPhoto]);

  const renderIssueChips = (list: string[], activeIssues: string[]) => (
    <View style={styles.issueWrap}>
      {list.map((issue) => {
        const on = activeIssues.includes(issue);
        return (
          <TouchableOpacity
            key={issue}
            style={[styles.issueChip, on && styles.issueChipOn]}
            onPress={() => toggleIssue(issue)}
            activeOpacity={0.85}>
            <Text style={[styles.issueChipText, on && styles.issueChipTextOn]}>{issue}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (layout === 'coolant') {
    const coolantIssues = value?.issues ?? [];
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {!hideBackRow && (
          <TouchableOpacity onPress={onBack} style={styles.backRow} hitSlop={12} accessibilityRole="button">
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backLabel}>Engine components</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setStatusCoolant(opt.value)}
                activeOpacity={0.85}>
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Issues</Text>
        <Text style={styles.hint}>Select all that apply (matches inspection schema).</Text>
        {renderIssueChips([...issueOptions], coolantIssues)}

        <PhotoCapture label={photoLabel} imageUri={value?.photos?.[0]} onCapture={onPhoto} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {!hideBackRow && (
        <TouchableOpacity onPress={onBack} style={styles.backRow} hitSlop={12} accessibilityRole="button">
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>{listBackTitle}</Text>
        </TouchableOpacity>
      )}

      {!hideBackRow ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <PhotoCapture label={photoLabel} imageUri={primaryPhoto} onCapture={onPhoto} />

      {issueOptions.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Please select issue(s) if any</Text>
          {renderIssueChips([...issueOptions], issues)}
        </>
      )}

      {extraBottom}

      <View style={styles.submitBar}>
        {issueOptions.length > 0 ? (
          <TouchableOpacity onPress={pressAllOk} style={styles.allOkBtn} accessibilityRole="button">
            <Text style={styles.allOkText}>All OK</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.allOkBtn} />
        )}
        <View style={styles.submitBtnWrap}>
          <AppButton
            label="Submit"
            onPress={handleSubmit}
            isDisabled={!canSubmitPhotoFirst}
            testID="inspection-photo-submit"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: vs(8),
    paddingBottom: vs(32),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  backChevron: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    marginRight: hs(4),
  },
  backLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(4),
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: vs(16),
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(8),
    marginTop: vs(4),
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: vs(10),
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: vs(20),
  },
  statusChip: {
    flex: 1,
    paddingVertical: vs(12),
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  statusChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statusChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  statusChipTextActive: {
    color: colors.primary,
  },
  issueWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: vs(16),
  },
  issueChip: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(12),
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  issueChipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  issueChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  issueChipTextOn: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  submitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(20),
    marginBottom: vs(24),
    gap: spacing.sm,
  },
  allOkBtn: {
    flex: 1,
    paddingVertical: vs(12),
    justifyContent: 'center',
  },
  allOkText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  submitBtnWrap: {
    flex: 1.4,
  },
});

export default memo(InspectionImageDetailPanel);
