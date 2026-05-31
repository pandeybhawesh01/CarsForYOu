/**
 * DraftSyncBanner
 *
 * Shown when the draft failed to load from the server. While in this state,
 * auto-save is intentionally PAUSED (see useAutoSaveDraft) so the locally
 * empty/partial form can't overwrite the real draft stored in Redis.
 *
 * The banner reassures the user that:
 *   - their previously saved progress is NOT lost (it's safe on the server),
 *   - they can keep working,
 *   - they should Retry to reconnect, which re-loads the saved draft and
 *     resumes auto-save.
 *
 * Subscribes to its own store slice, so it re-renders only when draftStatus
 * changes — not on every keystroke.
 */

import React, { memo, useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInspectionStore } from '../store/inspectionStore';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../../constants/spacing';

const DraftSyncBanner: React.FC = () => {
  const draftStatus = useInspectionStore((s) => s.draftStatus);
  const retryLoadDraft = useInspectionStore((s) => s.retryLoadDraft);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await retryLoadDraft();
    } finally {
      setIsRetrying(false);
    }
  }, [retryLoadDraft]);

  // Only render when the load actually failed.
  if (draftStatus !== 'failed') return null;

  return (
    <View style={s.container} accessible accessibilityRole="alert">
      <View style={s.iconWrap}>
        <Text style={s.icon}>⚠️</Text>
      </View>

      <View style={s.body}>
        <Text style={s.title}>Couldn’t sync your saved progress</Text>
        <Text style={s.message}>
          Your earlier work is safe on the server — it hasn’t been lost. You can keep
          inspecting, but auto-save is paused until we reconnect. Tap retry to restore
          your saved data and resume auto-save.
        </Text>
      </View>

      <TouchableOpacity
        style={[s.retryBtn, isRetrying && s.retryBtnDisabled]}
        onPress={handleRetry}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="Retry syncing saved progress">
        {isRetrying ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <Text style={s.retryText}>Retry</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#F0B429',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: verticalSpacing.sm,
    gap: spacing.sm,
  },
  iconWrap: {
    marginTop: 1,
  },
  icon: {
    fontSize: 18,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: '#8A6100',
  },
  message: {
    fontSize: typography.fontSize.xs,
    color: '#8A6100',
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: '#F0B429',
    paddingHorizontal: spacing.base,
    paddingVertical: verticalSpacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    alignSelf: 'center',
  },
  retryBtnDisabled: {
    opacity: 0.7,
  },
  retryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
});

export default memo(DraftSyncBanner);
