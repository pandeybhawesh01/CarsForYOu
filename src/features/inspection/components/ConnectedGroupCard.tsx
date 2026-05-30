/**
 * ConnectedGroupCard
 *
 * A store-connected card for a catalog GROUP node (the cards that open a
 * sub-section modal full of photo/issue fields).
 *
 * WHY THIS EXISTS / PERFORMANCE:
 *   Just like ConnectedPhotoCapture / ConnectedVideoCapture, this card
 *   subscribes to ONLY its own group's image slots in the store. When the
 *   user captures an image inside this group, only THIS card re-renders —
 *   every other card on the screen (the exterior section can have 8+ cards
 *   covering 40+ images) is untouched because its selector returns the same
 *   signature string and React/`memo` bail out.
 *
 *   The selector returns a single PRIMITIVE string
 *   `${firstUrl}|${firstCapturedAt}|${filled}|${total}` so Zustand v5's
 *   `===` comparison works (returning an object would loop forever — see the
 *   ConnectedVideoCapture header for the v5 gotcha).
 *
 * TIME COMPLEXITY:
 *   Per store update: O(imageSlotsInThisGroup) string lookups (typically 1-6),
 *   evaluated once per card. Only the card whose signature changed re-renders.
 *   No full-tree walk, no parent re-render.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInspectionStore } from '../store/inspectionStore';
import { getByPath, stripSectionPrefix } from '../utils/nestedFormData';
import type {
  CatalogField,
  CatalogGroup,
  CatalogInput,
  CatalogNode,
} from '../../../services/api/types';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../constants/spacing';

// ── Local structural helpers (self-contained; kept in sync with DynamicInspectionStep) ──

function getInputs(node: CatalogNode): CatalogInput[] {
  const g = node as CatalogGroup;
  if (Array.isArray(g.inputs) && g.inputs.length > 0) return g.inputs;
  const f = node as CatalogField;
  if (f.inputType) {
    return [{
      inputType: f.inputType,
      dataType: f.dataType ?? 'STRING',
      allowsMultiple: f.allowsMultiple ?? false,
      options: f.options ?? [],
    }];
  }
  return [];
}

function getChildren(node: CatalogNode): CatalogNode[] {
  return (node as CatalogGroup).children ?? [];
}

/**
 * Walk this group (and descendants) and collect every IMAGE upload slot's
 * dotted storage path. Structural only — depends on the catalog node, never
 * on formData — so it's memoised by `node` reference.
 */
function collectImagePaths(node: CatalogNode): string[] {
  const paths: string[] = [];
  for (const input of getInputs(node)) {
    if (input.inputType === 'file-upload') {
      for (const opt of input.options) {
        // Skip video slots — the card thumbnail represents photos.
        if (String(opt.value).toLowerCase() !== 'video') {
          paths.push(`${node.path}.${String(opt.value)}`);
        }
      }
    }
  }
  for (const child of getChildren(node)) {
    paths.push(...collectImagePaths(child));
  }
  return paths;
}

interface PhotoBlock {
  photos?: Array<{ url?: string; capturedAt?: string }>;
}

interface ConnectedGroupCardProps {
  node: CatalogGroup;
  label: string;
  sectionKey: string;
  onPress: () => void;
}

const ConnectedGroupCard: React.FC<ConnectedGroupCardProps> = ({
  node,
  label,
  sectionKey,
  onPress,
}) => {
  // Structural — recomputed only if the catalog node changes (≈ never).
  const imagePaths = useMemo(() => collectImagePaths(node), [node]);

  // Scoped selector → single primitive signature string.
  const signature = useInspectionStore(
    useCallback(
      (state) => {
        const sectionData = (state.currentSession?.formData[sectionKey] ?? {}) as Record<string, unknown>;
        let firstUrl = '';
        let firstCapturedAt = '';
        let filled = 0;
        for (const p of imagePaths) {
          const block = getByPath(sectionData, stripSectionPrefix(p)) as PhotoBlock | undefined;
          const photo = block?.photos?.[0];
          if (photo?.url) {
            filled++;
            if (!firstUrl) {
              firstUrl = photo.url;
              firstCapturedAt = photo.capturedAt ?? '';
            }
          }
        }
        return `${firstUrl}|${firstCapturedAt}|${filled}|${imagePaths.length}`;
      },
      [sectionKey, imagePaths],
    ),
  );

  const { thumbnailUrl, filledCount, totalCount } = useMemo(() => {
    const [url, capturedAt, f, t] = signature.split('|');
    let display: string | undefined = url || undefined;
    // Cache-bust public S3 thumbnails so a re-captured image updates the card.
    if (display && (display.startsWith('http://') || display.startsWith('https://')) && capturedAt) {
      const ts = new Date(capturedAt).getTime();
      const sep = display.includes('?') ? '&' : '?';
      display = `${display}${sep}_t=${ts}`;
    }
    return {
      thumbnailUrl: display,
      filledCount: Number(f) || 0,
      totalCount: Number(t) || 0,
    };
  }, [signature]);

  const hasImage = Boolean(thumbnailUrl);
  const isComplete = totalCount > 0 && filledCount === totalCount;
  const subtitle = totalCount > 0
    ? (isComplete ? '✓ All captured' : `${filledCount}/${totalCount} captured`)
    : (filledCount > 0 ? '✓ Submitted' : 'Tap to capture & review');

  return (
    <TouchableOpacity
      style={[s.card, isComplete && s.cardComplete]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${subtitle}`}>

      {/* Thumbnail / icon */}
      <View style={s.thumbWrap}>
        {hasImage ? (
          <>
            <Image source={{ uri: thumbnailUrl }} style={s.thumb} resizeMode="cover" />
            {filledCount > 1 && (
              <View style={s.countBadge}>
                <Text style={s.countBadgeText}>{filledCount}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={s.iconBox}>
            <Text style={s.icon}>📷</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={s.body}>
        <Text style={s.label} numberOfLines={1}>{label}</Text>
        <View style={s.subRow}>
          {isComplete && <View style={s.statusDot} />}
          <Text style={[s.sub, isComplete && s.subComplete]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Progress bar (only when there are countable slots) */}
        {totalCount > 0 && (
          <View style={s.track}>
            <View
              style={[
                s.fill,
                { width: `${Math.round((filledCount / totalCount) * 100)}%` as `${number}%` },
                isComplete && s.fillComplete,
              ]}
            />
          </View>
        )}
      </View>

      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const THUMB = 56;

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: verticalSpacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.base,
  },
  cardComplete: {
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  iconBox: {
    width: THUMB,
    height: THUMB,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  countBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: typography.fontWeight.bold,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  sub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  subComplete: {
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  fillComplete: {
    backgroundColor: colors.success,
  },
  chevron: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default memo(ConnectedGroupCard);
