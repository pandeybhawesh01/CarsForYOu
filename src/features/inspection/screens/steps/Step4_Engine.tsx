import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, Condition, YesNoNA, type CoolantInspectionBlock, type MediaData, type PhotoIssueInspectionBlock } from '../../types';
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

type MediaUriKey = Exclude<keyof MediaData, 'additionalImages'>;

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

const ENGINE_PHOTO_LEGACY: Record<'battery' | 'dipstick' | 'sump', keyof MediaData> = {
  battery: 'batteryAlternatorImage',
  dipstick: 'dipstickImage',
  sump: 'sumpImage',
};

const Step4Engine: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.engine ?? {};
  const mediaData = currentSession?.formData.media ?? { additionalImages: [] };
  const [tab, setTab] = useState<'engineImage' | 'roadTest' | 'soundTest' | 'engine'>('engineImage');
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
    (key: MediaUriKey, val: string) => updateFormData(InspectionStepId.Media, { [key]: val }),
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

  const renderHealthListRow = (label: string, subtitle: string, mode: EngineImageMode) => (
    <TouchableOpacity
      key={mode}
      style={styles.healthRow}
      onPress={() => setEngineImageMode(mode)}
      activeOpacity={0.75}>
      <View style={styles.healthRowText}>
        <Text style={styles.healthRowTitle}>{label}</Text>
        <Text style={styles.healthRowSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.healthRowChevron}>›</Text>
    </TouchableOpacity>
  );

  const renderEngineImageTab = () => {
    if (engineImageMode === 'coolant') {
      return (
        <View style={styles.section}>
          <CoolantInspectionPanel
            value={data.coolant}
            onChange={(coolant) => updateFormData(InspectionStepId.Engine, { coolant })}
            onBack={() => setEngineImageMode('list')}
          />
        </View>
      );
    }

    if (engineImageMode === 'battery') {
      return (
        <View style={styles.section}>
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
        </View>
      );
    }

    if (engineImageMode === 'dipstick') {
      return (
        <View style={styles.section}>
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
        </View>
      );
    }

    if (engineImageMode === 'sump') {
      return (
        <View style={styles.section}>
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
        </View>
      );
    }

    if (engineImageMode === 'chassis') {
      return (
        <View style={styles.section}>
          <TouchableOpacity onPress={() => setEngineImageMode('list')} style={styles.backRow} hitSlop={12}>
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backLabel}>Engine components</Text>
          </TouchableOpacity>
          <Text style={styles.subviewTitle}>Chassis embossing</Text>
          <PhotoCapture
            label="Photo"
            imageUri={mediaData.chassisEmbossingImage}
            onCapture={(v) => updateMediaField('chassisEmbossingImage', v)}
          />
          <AppInput
            label="Chassis Number"
            value={(data as Record<string, string>).chassisEmbossingNumber ?? ''}
            onChangeText={(v) => updateFormData(InspectionStepId.Engine, { chassisEmbossingNumber: v })}
          />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engine components</Text>
        <Text style={styles.listHint}>Tap an item to capture photos and details (matches field flow).</Text>
        {renderHealthListRow('Coolant', coolantRowSubtitle(data.coolant), 'coolant')}
        {renderHealthListRow('Battery & Alternator', enginePhotoRowSubtitle(enginePhotos.battery), 'battery')}
        {renderHealthListRow('Engine oil dipstick', enginePhotoRowSubtitle(enginePhotos.dipstick), 'dipstick')}
        {renderHealthListRow('Sump', enginePhotoRowSubtitle(enginePhotos.sump), 'sump')}
        {renderHealthListRow('Chassis embossing', 'Photo & number', 'chassis')}
      </View>
    );
  };

  const showTabs = tab === 'engineImage' ? engineImageMode === 'list' : true;
  const engineDetailOpen = tab === 'engineImage' && engineImageMode !== 'list';

  const tabRow = showTabs ? (
    <View style={styles.tabRow}>
      <Text style={[styles.tab, tab === 'engineImage' && styles.tabActive]} onPress={() => setTab('engineImage')}>
        Engine Image
      </Text>
      <Text style={[styles.tab, tab === 'roadTest' && styles.tabActive]} onPress={() => setTab('roadTest')}>
        Road Test
      </Text>
      <Text style={[styles.tab, tab === 'soundTest' && styles.tabActive]} onPress={() => setTab('soundTest')}>
        Engine Sound
      </Text>
      <Text style={[styles.tab, tab === 'engine' && styles.tabActive]} onPress={() => setTab('engine')}>
        Engine
      </Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Engine + Transmission" subtitle="Step 2 of 6" onBack={onBack} />
      {engineDetailOpen ? (
        <View style={styles.detailFill}>
          {tabRow}
          {renderEngineImageTab()}
        </View>
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
              onChangeText={(v) => updateFormData(InspectionStepId.Engine, { initialOdometer: v })}
              isRequired
            />
            <AppInput
              label="Final Odometer Reading"
              keyboardType="numeric"
              value={(data as Record<string, string>).finalOdometer ?? ''}
              onChangeText={(v) => updateFormData(InspectionStepId.Engine, { finalOdometer: v })}
            />
            <AppInput
              label="Distance covered (meters)"
              keyboardType="numeric"
              value={(data as Record<string, string>).distanceMeters ?? ''}
              onChangeText={(v) => updateFormData(InspectionStepId.Engine, { distanceMeters: v })}
              hint="Target: 1000m ride"
            />
            <AppInput
              label="Time taken (seconds)"
              keyboardType="numeric"
              value={(data as Record<string, string>).rideTimeSeconds ?? ''}
              onChangeText={(v) => updateFormData(InspectionStepId.Engine, { rideTimeSeconds: v })}
            />
          </View>
        )}

        {tab === 'soundTest' && (
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
            <ConditionSelector label="Engine Sound Condition" value={data.engineSound} onChange={(v) => updateCond('engineSound', v)} isRequired />
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
            <ConditionSelector label="Clutch" value={(data as Record<string, Condition>).clutch} onChange={(v) => updateCond('clutch', v)} />
            <ConditionSelector
              label="Transmission and Gear Shifting"
              value={(data as Record<string, Condition>).transmissionCondition}
              onChange={(v) => updateCond('transmissionCondition', v)}
            />
            <ConditionSelector label="Engine (general condition)" value={data.engineOilLevel} onChange={(v) => updateCond('engineOilLevel', v)} isRequired />
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
        {!isComplete && <Text style={styles.hint}>* Complete required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step4-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  detailFill: { flex: 1, paddingHorizontal: spacing.base, paddingTop: vs(8) },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  section: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.base, marginBottom: vs(16) },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(16),
  },
  listHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: vs(-8),
    marginBottom: vs(12),
  },
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
  healthRowChevron: {
    fontSize: typography.fontSize.xl,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.bold,
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
  subviewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(16),
  },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: vs(16) },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(8),
    color: colors.text,
  },
  tabActive: { borderColor: colors.primary, color: colors.primary, backgroundColor: colors.primaryLight },
  footer: { padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  hint: { fontSize: typography.fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: vs(8) },
});

export default Step4Engine;
