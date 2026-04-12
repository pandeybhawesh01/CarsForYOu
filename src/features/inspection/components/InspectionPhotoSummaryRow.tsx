import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PhotoIssueInspectionBlock } from '../types';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';
import { isPhotoIssueBlockComplete, PHOTO_STATUS_GOOD } from '../utils/photoInspection';

interface Props {
  label: string;
  isRequired?: boolean;
  block: PhotoIssueInspectionBlock | undefined;
  onEdit: () => void;
}

const InspectionPhotoSummaryRow: React.FC<Props> = ({ label, isRequired, block, onEdit }) => {
  const hasPhoto = Boolean(block?.photos?.[0]);
  const complete = isPhotoIssueBlockComplete(block, { requirePhoto: true, photoOnlyOk: true });
  const allOk = block?.status === PHOTO_STATUS_GOOD && (block?.issues?.length ?? 0) === 0;
  const issueCount = block?.issues?.length ?? 0;

  let badgeText = 'Pending';
  let badgeVariant: 'ok' | 'issues' | 'pending' = 'pending';
  if (complete) {
    if (allOk) {
      badgeText = 'ALL OK';
      badgeVariant = 'ok';
    } else if (issueCount > 0) {
      badgeText = `${issueCount} ISSUE${issueCount === 1 ? '' : 'S'} SUBMITTED`;
      badgeVariant = 'issues';
    }
  } else if (!hasPhoto) {
    badgeText = 'Photo required';
  }

  const badgeStyle =
    badgeVariant === 'ok' ? styles.badgeOk : badgeVariant === 'issues' ? styles.badgeIssues : styles.badgePending;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.thumbWrap} onPress={onEdit} activeOpacity={0.8} accessibilityRole="button">
        <View style={[styles.thumb, hasPhoto && styles.thumbFilled]}>
          <Text style={styles.thumbIcon}>{hasPhoto ? '📷' : '—'}</Text>
        </View>
        <View style={styles.eyeBadge}>
          <Text style={styles.eyeText}>👁</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.label}>
          {label}
          {isRequired ? <Text style={styles.req}> *</Text> : null}
        </Text>
        <View style={[styles.badge, badgeStyle]}>
          <Text
            style={[
              styles.badgeText,
              badgeVariant === 'ok' && styles.badgeTextOk,
              badgeVariant === 'issues' && styles.badgeTextIssues,
              badgeVariant === 'pending' && styles.badgeTextPending,
            ]}>
            {badgeText === 'ALL OK' ? '✓ ' : badgeText.includes('ISSUE') ? 'ⓘ ' : ''}
            {badgeText}
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editRow} hitSlop={8}>
          <Text style={styles.editIcon}>↻</Text>
          <Text style={styles.editLabel}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbWrap: {
    marginRight: spacing.sm,
  },
  thumb: {
    width: hs(72),
    height: vs(72),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFilled: {
    backgroundColor: colors.primaryLight,
  },
  thumbIcon: {
    fontSize: vs(22),
  },
  eyeBadge: {
    position: 'absolute',
    right: hs(4),
    bottom: vs(4),
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.full,
    width: hs(26),
    height: hs(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: vs(12),
    color: colors.white,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    marginBottom: vs(6),
  },
  req: {
    color: colors.error,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: borderRadius.sm,
    marginBottom: vs(6),
  },
  badgeOk: {
    backgroundColor: colors.successLight,
  },
  badgeIssues: {
    backgroundColor: colors.warningLight,
  },
  badgePending: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  badgeTextOk: {
    color: colors.success,
  },
  badgeTextIssues: {
    color: colors.warning,
  },
  badgeTextPending: {
    color: colors.textSecondary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginRight: hs(4),
  },
  editLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(InspectionPhotoSummaryRow);
