import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import {
  InspectionStepId,
  Condition,
  YesNoNA,
  type CoolantInspectionBlock,
  type MediaData,
  type PhotoIssueInspectionBlock,
} from '../../types';
import ConditionSelector from '../../components/ConditionSelector';
import YesNoSelector from '../../components/YesNoSelector';
import PhotoCapture from '../../components/PhotoCapture';
import CoolantInspectionPanel from '../../components/CoolantInspectionPanel';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import { ENGINE_COMPONENT_ISSUE_OPTIONS } from '../../../../constants/inspectionSchema';
import { isPhotoIssueBlockComplete, PHOTO_STATUS_GOOD } from '../../utils/photoInspection';
import AppInput from '../../../../components/AppInput';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, borderRadius } from '../../../../constants/spacing';
import { vs, hs } from '../../../../utils/scaling';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type EngineImageMode =
  | 'list'
  | 'coolant'
  | 'battery'
  | 'dipstick'
  | 'sump'
  | 'chassis';

type TabKey = 'engineImage' | 'roadTest' | 'engineSound' | 'engine';

type MediaUriKey = Exclude<keyof MediaData, 'additionalImages'>;

interface TabConfig {
  key: TabKey;
  label: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: TabConfig[] = [
  { key: 'engineImage', label: 'Engine Image' },
  { key: 'roadTest', label: 'Road Test' },
  { key: 'engineSound', label: 'Engine Sound' },
  { key: 'engine', label: 'Engine' },
];

const ENGINE_PHOTO_LEGACY: Record<'battery' | 'dipstick' | 'sump', keyof MediaData> = {
  battery: 'batteryAlternatorImage',
  dipstick: 'dipstickImage',
  sump: 'sumpImage',
};

/** Subtitles that indicate the item is NOT yet complete */
const INCOMPLETE_SUBTITLES = new Set(['Photo, status & issues', 'Photo, issues & submit']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function coolantRowSubtitle(c?: CoolantInspectionBlock): string {
  if (!c?.status && !(c?.photos?.length) && !(c?.issues?.length)) {
    return 'Photo, status & issues';
  }
  const bits: string[] = [];
  if (c.status) bits.push(c.status);
  if (c.issues?.length) bits.push(`${c.issues.length} issue(s)`);
  if (c.photos?.length) bits.push('photo');
  return bits.join(' · ');
}

function enginePhotoRowSubtitle(block?: PhotoIssueInspectionBlock): string {
  if (!isPhotoIssueBlockComplete(block, { requirePhoto: true, photoOnlyOk: true })) {
    return 'Photo, issues & submit';
  }
  if (block?.status === PHOTO_STATUS_GOOD && !(block?.issues?.length)) {
    return 'All OK';
  }
  return `${block?.issues?.length ?? 0} issue(s) submitted`;
}

function isSubtitleComplete(subtitle: string): boolean {
  return !INCOMPLETE_SUBTITLES.has(subtitle);
}

// ─── Component ───────────────────────────────────────────────────────────────

const Step4Engine: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.engine ?? {};
  const mediaData = currentSession?.formData.media ?? { additionalImages: [] };
  const [tab, setTab] = useState<TabKey>('engineImage');
  const [engineImageMode, setEngineImageMode] = useState<EngineImageMode>('list');

  useEffect(() => {
    if (tab !== 'engineImage') {
      setEngineImageMode('list');
    }
  }, [tab]);

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

  const updateMediaField = useCallback(
    (key: MediaUriKey, val: string) =>
      updateFormData(InspectionStepId.Media, { [key]: val }),
    [updateFormData],
  );

  const enginePhotos = mediaData.engineComponentPhotos ?? {};

  const updateEnginePhoto = useCallback(
    (key: keyof typeof ENGINE_PHOTO_LEGACY, block: PhotoIssueInspectionBlock) => {
      const uriKey = ENGINE_PHOTO_LEGACY[key];
      const uri = block.photos?.[0] ?? '';
      updateFormData(InspectionStepId.Media, {
        engineComponentPhotos: { ...enginePhotos, [key]: block },
        [uriKey]: uri,
      });
    },
    [enginePhotos, updateFormData],
  );

  const isComplete =
    data.engineSound !== undefined &&
    data.engineOilLevel !== undefined &&
    Boolean((data as Record<string, string>).initialOdometer);

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Exterior);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  // ── Sub-renderers ──────────────────────────────────────────────────────────

  const renderHealthListRow = useCallback(
    (label: string, subtitle: string, mode: EngineImageMode) => {
      const complete = isSubtitleComplete(subtitle);
      return (
        <TouchableOpacity
          key={mode}
          style={styles.healthRow}
          onPress={() => setEngineImageMode(mode)}
          activeOpacity={0.7}>
          <View style={styles.healthRowText}>
            <Text style={styles.healthRowTitle}>{label}</Text>
            <Text style={styles.healthRowSubtitle} numberOfLines={2}>
              {complete ? <Text style={styles.completeMark}>✓ </Text> : null}
              {subtitle}
            </Text>
          </View>
          {/* Border-based chevron */}
          <View style={styles.chevronContainer}>
            <View style={styles.chevron} />
          </View>
        </TouchableOpacity>
      );
    },
    [],
  );

  const renderEngineImageTab = () => {
    if (engineImageMode === 'coolant') {
      return (
        <CoolantInspectionPanel
          value={data.coolant}
          onChange={(coolant) => updateFormData(InspectionStepId.Engine, { coolant })}
          onBack={() => setEngineImageMode('list')}
        />
      );
    }

    if (engineImageMode === 'battery') {
      return (
        <InspectionImageDetailPanel
          title="Battery & Alternator"
          listBackTitle="Engine components"
          issueOptions={ENGINE_COMPONENT_ISSUE_OPTIONS}
          value={enginePhotos.battery}
          onChange={(b) => updateEnginePhoto('battery', b)}
          onBack={() => setEngineImageMode('list')}
          layout="photoFirstSubmit"
          photoLabel="Photo"
        />
      );
    }

    if (engineImageMode === 'dipstick') {
      return (
        <InspectionImageDetailPanel
          title="Engine oil dipstick"
          listBackTitle="Engine components"
          issueOptions={ENGINE_COMPONENT_ISSUE_OPTIONS}
          value={enginePhotos.dipstick}
          onChange={(b) => updateEnginePhoto('dipstick', b)}
          onBack={() => setEngineImageMode('list')}
          layout="photoFirstSubmit"
          photoLabel="Photo"
        />
      );
    }

    if (engineImageMode === 'sump') {
      return (
        <InspectionImageDetailPanel
          title="Sump"
          listBackTitle="Engine components"
          issueOptions={ENGINE_COMPONENT_ISSUE_OPTIONS}
          value={enginePhotos.sump}
          onChange={(b) => updateEnginePhoto('sump', b)}
          onBack={() => setEngineImageMode('list')}
          layout="photoFirstSubmit"
          photoLabel="Photo"
        />
      );
    }

    if (engineImageMode === 'chassis') {
      return (
        <View style={styles.section}>
          {/* Proper back button — consistent with AppHeader style */}
          <TouchableOpacity
            onPress={() => setEngineImageMode('list')}
            style={styles.backRow}
            hitSlop={12}
            activeOpacity={0.7}>
            <View style={styles.backChevronIcon} />
            <Text style={styles.backLabel}>Engine components</Text>
          </TouchableOpacity>

          {/* Title with top margin + bottom separator */}
          <Text style={styles.subviewTitle}>Chassis embossing</Text>
          <View style={styles.subviewTitleSeparator} />

          <PhotoCapture
            label="Photo"
            imageUri={mediaData.chassisEmbossingImage}
            onCapture={(v) => updateMediaField('chassisEmbossingImage', v)}
          />
          <AppInput
            label="Chassis Number"
            value={(data as Record<string, string>).chassisEmbossingNumber ?? ''}
            onChangeText={(v) =>
              updateFormData(InspectionStepId.Engine, { chassisEmbossingNumber: v })
            }
          />
        </View>
      );
    }

    // Default: list view
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engine components</Text>

        {/* Info banner replacing plain hint text */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            Tap an item to capture photos and details (matches field flow).
          </Text>
        </View>

        {renderHealthListRow('Coolant', coolantRowSubtitle(data.coolant), 'coolant')}
        {renderHealthListRow(
          'Battery & Alternator',
          enginePhotoRowSubtitle(enginePhotos.battery),
          'battery',
        )}
        {renderHealthListRow(
          'Engine oil dipstick',
          enginePhotoRowSubtitle(enginePhotos.dipstick),
          'dipstick',
        )}
        {renderHealthListRow('Sump', enginePhotoRowSubtitle(enginePhotos.sump), 'sump')}
        {renderHealthListRow('Chassis embossing', 'Photo & number', 'chassis')}
      </View>
    );
  };

  const showTabs = tab === 'engineImage' ? engineImageMode === 'list' : true;
  const engineDetailOpen = tab === 'engineImage' && engineImageMode !== 'list';
  const showParentHeader = !engineDetailOpen || engineImageMode === 'chassis';

  // ── Tab row — horizontal ScrollView, TouchableOpacity per tab ─────────────
  const tabRow = showTabs ? (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRowContent}
        style={styles.tabRowScroll}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Section divider between tab row and content */}
      <View style={styles.tabContentDivider} />
    </>
  ) : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {showParentHeader && (
        <AppHeader title="Engine + Transmission" subtitle="Step 2 of 6" onBack={onBack} />
      )}

      {engineDetailOpen ? (
        <View style={styles.detailFill}>{renderEngineImageTab()}</View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {tabRow}

          {tab === 'engineImage' && renderEngineImageTab()}

          {tab === 'roadTest' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Road Test</Text>
              <ConditionSelector
                label="Car Running Condition"
                value={(data as Record<string, Condition>).carRunningCondition}
                onChange={(v) => updateCond('carRunningCondition', v)}
              />
              <PhotoCapture
                label="Initial Odometer Reading"
                imageUri={mediaData.initialOdometerImage}
                onCapture={(v) => updateMediaField('initialOdometerImage', v)}
              />
              <PhotoCapture
                label="Final Odometer Reading"
                imageUri={mediaData.finalOdometerImage}
                onCapture={(v) => updateMediaField('finalOdometerImage', v)}
              />
              <AppInput
                label="Initial Odometer Reading"
                keyboardType="numeric"
                value={(data as Record<string, string>).initialOdometer ?? ''}
                onChangeText={(v) =>
                  updateFormData(InspectionStepId.Engine, { initialOdometer: v })
                }
                isRequired
              />
              <AppInput
                label="Final Odometer Reading"
                keyboardType="numeric"
                value={(data as Record<string, string>).finalOdometer ?? ''}
                onChangeText={(v) =>
                  updateFormData(InspectionStepId.Engine, { finalOdometer: v })
                }
              />
              <AppInput
                label="Distance covered (meters)"
                keyboardType="numeric"
                value={(data as Record<string, string>).distanceMeters ?? ''}
                onChangeText={(v) =>
                  updateFormData(InspectionStepId.Engine, { distanceMeters: v })
                }
                hint="Target: 1000m ride"
              />
              <AppInput
                label="Time taken (seconds)"
                keyboardType="numeric"
                value={(data as Record<string, string>).rideTimeSeconds ?? ''}
                onChangeText={(v) =>
                  updateFormData(InspectionStepId.Engine, { rideTimeSeconds: v })
                }
              />
            </View>
          )}

          {tab === 'engineSound' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Engine Sound Test</Text>
              <YesNoSelector
                label="OBD Connection successful?"
                value={(data as Record<string, YesNoNA>).obdConnection}
                onChange={(v) => updateYN('obdConnection', v)}
              />
              <ConditionSelector
                label="Blow-by check on idle"
                value={(data as Record<string, Condition>).blowByIdle}
                onChange={(v) => updateCond('blowByIdle', v)}
              />
              <ConditionSelector
                label="Blow-by check on 2000 rpm"
                value={(data as Record<string, Condition>).blowBy2000}
                onChange={(v) => updateCond('blowBy2000', v)}
              />
              <ConditionSelector
                label="Engine Sound Condition"
                value={data.engineSound}
                onChange={(v) => updateCond('engineSound', v)}
                isRequired
              />
              <ConditionSelector
                label="TurboCharger"
                value={(data as Record<string, Condition>).turboCharger}
                onChange={(v) => updateCond('turboCharger', v)}
              />
              <ConditionSelector
                label="Fuel Injector"
                value={(data as Record<string, Condition>).fuelInjector}
                onChange={(v) => updateCond('fuelInjector', v)}
              />
              <ConditionSelector
                label="Radiator"
                value={(data as Record<string, Condition>).radiator}
                onChange={(v) => updateCond('radiator', v)}
              />
              <ConditionSelector
                label="Engine Sound / Exhaust Smoke"
                value={(data as Record<string, Condition>).exhaustSmoke}
                onChange={(v) => updateCond('exhaustSmoke', v)}
              />
            </View>
          )}

          {tab === 'engine' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transmission</Text>
              <ConditionSelector
                label="Clutch"
                value={(data as Record<string, Condition>).clutch}
                onChange={(v) => updateCond('clutch', v)}
              />
              <ConditionSelector
                label="Transmission and Gear Shifting"
                value={(data as Record<string, Condition>).transmissionCondition}
                onChange={(v) => updateCond('transmissionCondition', v)}
              />
              <ConditionSelector
                label="Engine (general condition)"
                value={data.engineOilLevel}
                onChange={(v) => updateCond('engineOilLevel', v)}
                isRequired
              />
              <ConditionSelector
                label="Engine Mounting Condition"
                value={(data as Record<string, Condition>).engineMountingCondition}
                onChange={(v) => updateCond('engineMountingCondition', v)}
              />
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        {!isComplete && (
          <Text style={styles.hint}>
            ⚠️{'  '}Complete required fields to proceed
          </Text>
        )}
        <AppButton
          label="Next →"
          onPress={handleNext}
          isDisabled={!isComplete}
          testID="step4-next-btn"
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CHEVRON_SIZE = hs(8);
const BACK_CHEVRON_SIZE = hs(10);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  detailFill: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: vs(20) },

  // ── Section ──────────────────────────────────────────────────────────────
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
    marginBottom: vs(16),
  },

  // ── Info banner (replaces plain listHint) ─────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(8),
    marginTop: vs(-8),
    marginBottom: vs(12),
    gap: spacing.xs,
  },
  infoBannerIcon: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.base,
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.base,
  },

  // ── Health list rows ──────────────────────────────────────────────────────
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: hs(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  healthRowText: { flex: 1, paddingRight: spacing.sm },
  healthRowTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  healthRowSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: vs(2),
  },
  completeMark: {
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  // Border-based chevron (right-pointing arrow)
  chevronContainer: {
    width: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    width: CHEVRON_SIZE,
    height: CHEVRON_SIZE,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.textSecondary,
    transform: [{ rotate: '45deg' }],
  },

  // ── Back button (chassis sub-view) ────────────────────────────────────────
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  backChevronIcon: {
    width: BACK_CHEVRON_SIZE,
    height: BACK_CHEVRON_SIZE,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.primary,
    transform: [{ rotate: '-45deg' }],
    marginRight: hs(6),
  },
  backLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },

  // ── Chassis sub-view title ────────────────────────────────────────────────
  subviewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: vs(8),
    marginBottom: vs(12),
  },
  subviewTitleSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: vs(16),
  },

  // ── Tab row ───────────────────────────────────────────────────────────────
  tabRowScroll: { marginBottom: vs(4) },
  tabRowContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(4),
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(8),
    backgroundColor: colors.surface,
  },
  tabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  // Divider between tab row and content area
  tabContentDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.base,
    marginBottom: vs(12),
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: vs(8),
    fontWeight: typography.fontWeight.medium,
  },
});

export default Step4Engine;
