import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import {
  InspectionStepId,
  type ACData,
  type PhotoIssueInspectionBlock,
  type YesNoNA,
} from '../../types';
import YesNoSelector from '../../components/YesNoSelector';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, borderRadius } from '../../../../constants/spacing';
import { vs, hs } from '../../../../utils/scaling';
import {
  AC_COOLING_ISSUE_OPTIONS,
  HEATER_SYSTEM_ISSUE_OPTIONS,
  AC_CONTROL_PANEL_ISSUE_OPTIONS,
  BLOWER_MOTOR_ISSUE_OPTIONS,
  AC_COMPRESSOR_ISSUE_OPTIONS,
  VENTILATION_SYSTEM_ISSUE_OPTIONS,
} from '../../../../constants/inspectionSchema';
import { isPhotoIssueBlockComplete } from '../../utils/photoInspection';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type ACComponentType =
  | 'climateControl'
  | 'ventilation'
  | 'acCooling'
  | 'acPanel'
  | 'blowerMotor'
  | 'acCompressor'
  | 'heaterSystem';

interface ACComponent {
  id: ACComponentType;
  title: string;
  subtitle: string;
  isRequired: boolean;
}

const AC_COMPONENTS: ACComponent[] = [
  { id: 'climateControl', title: 'Climate Control', subtitle: 'is available', isRequired: true },
  { id: 'ventilation', title: 'Ventilation System', subtitle: 'Check for issues', isRequired: false },
  { id: 'acCooling', title: 'AC Cooling', subtitle: 'Cooling performance', isRequired: true },
  { id: 'acPanel', title: 'AC Control Panel', subtitle: 'Check condition', isRequired: false },
  { id: 'blowerMotor', title: 'Blower Motor', subtitle: 'Check for issues', isRequired: false },
  { id: 'acCompressor', title: 'AC Compressor', subtitle: 'Check condition', isRequired: false },
  { id: 'heaterSystem', title: 'Heater System', subtitle: 'Check functionality', isRequired: false },
];

const isValidImageUri = (uri?: string) => Boolean(uri && /^(https?:|file:|content:)/i.test(uri));

const getStatusBadge = (component: ACComponent, data: Partial<ACData>): { status: string; color: string } => {
  if (component.id === 'climateControl') {
    const value = data.climateControlAvailable;
    if (!value) return { status: '', color: colors.borderLight };
    if (value === 'YES' || value === 'WORKING') return { status: 'ALL OK', color: colors.success };
    if (value === 'NO' || value === 'NOT_WORKING') return { status: 'ISSUE SUBMITTED', color: colors.warning };
    return { status: 'ISSUE SUBMITTED', color: colors.warning };
  }

  const blockMap: Partial<Record<ACComponentType, PhotoIssueInspectionBlock | undefined>> = {
    ventilation: data.ventilationSystemInspection,
    acCooling: data.acCoolingInspection,
    acPanel: data.acPanelInspection,
    blowerMotor: data.blowerMotorInspection,
    acCompressor: data.acCompressorInspection,
    heaterSystem: data.heaterSystemStatus,
  };
  const value = blockMap[component.id];
  if (!value) return { status: '', color: colors.borderLight };
  if (value.issues?.length) return { status: 'ISSUE SUBMITTED', color: colors.warning };
  if (value.status || value.photos?.length) return { status: 'ALL OK', color: colors.success };
  return { status: '', color: colors.borderLight };
};

const getPreviewUri = (component: ACComponentType, data: Partial<ACData>): string | undefined => {
  if (component === 'climateControl') return data.climateControlInspection?.photos?.[0];
  if (component === 'acCooling') return data.acCoolingInspection?.photos?.[0];
  if (component === 'acPanel') return data.acPanelInspection?.photos?.[0];
  if (component === 'blowerMotor') return data.blowerMotorInspection?.photos?.[0];
  if (component === 'acCompressor') return data.acCompressorInspection?.photos?.[0];
  if (component === 'heaterSystem') return data.heaterSystemStatus?.photos?.[0];
  return data.ventilationSystemInspection?.photos?.[0];
};

const Step2AirConditioning: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const acData: Partial<ACData> = currentSession?.formData.ac ?? {};
  const [selectedComponent, setSelectedComponent] = useState<ACComponentType | null>(null);

  const updateAC = useCallback(
    (key: keyof ACData, val: ACData[keyof ACData]) => updateFormData(InspectionStepId.Exterior, { [key]: val }),
    [updateFormData],
  );

  const isComplete = Boolean(
    acData.climateControlAvailable &&
      isPhotoIssueBlockComplete(acData.acCoolingInspection, { requirePhoto: false, photoOnlyOk: true }),
  );

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Exterior);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  const renderComponentCard = (component: ACComponent) => {
    const badge = getStatusBadge(component, acData);
    const previewUri = getPreviewUri(component.id, acData);
    const hasPreview = isValidImageUri(previewUri);

    return (
      <TouchableOpacity
        key={component.id}
        style={styles.componentCard}
        onPress={() => setSelectedComponent(component.id)}
        activeOpacity={0.78}>
        <View style={styles.thumbWrap}>
          <View style={styles.thumb}>
            {hasPreview ? (
              <Image source={{ uri: previewUri }} style={styles.thumbImage} resizeMode="cover" />
            ) : (
              <View style={styles.thumbFallback}>
                <Text style={styles.thumbIcon}>📷</Text>
                <Text style={styles.thumbFallbackText}>Optional</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>{component.title}</Text>
              <Text style={styles.cardSubtitle}>{component.subtitle}</Text>
            </View>
            {badge.status ? (
              <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
                <Text style={[styles.statusText, { color: badge.color === colors.warning ? colors.text : colors.success }]}>
                  {badge.status}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.editRow}>
            <Text style={styles.editIcon}>✎</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
        </View>

        {component.isRequired ? <Text style={styles.requiredStar}>*</Text> : null}
      </TouchableOpacity>
    );
  };

  const renderClimateControl = () => (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <InspectionImageDetailPanel
        title="Climate Control"
        subtitle="Step 3 of 6"
        issueOptions={[]}
        value={acData.climateControlInspection}
        onChange={(block) => updateAC('climateControlInspection', block)}
        onBack={() => setSelectedComponent(null)}
        layout="photoFirstSubmit"
        photoLabel="Photo"
        photoRequired={false}
        extraBottom={
          <View style={styles.extraSection}>
            <YesNoSelector
              label="Is climate control available?"
              value={acData.climateControlAvailable as YesNoNA}
              onChange={(v) => updateAC('climateControlAvailable', v)}
              isRequired
            />
          </View>
        }
      />
    </SafeAreaView>
  );

  const renderPhotoIssueDetail = (
    title: string,
    issueOptions: readonly string[],
    value: PhotoIssueInspectionBlock | undefined,
    onChange: (next: PhotoIssueInspectionBlock) => void,
  ) => (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <InspectionImageDetailPanel
        title={title}
        subtitle="Step 3 of 6"
        issueOptions={issueOptions}
        value={value}
        onChange={onChange}
        onBack={() => setSelectedComponent(null)}
        layout="photoFirstSubmit"
        photoLabel="Photo"
        photoRequired={false}
      />
    </SafeAreaView>
  );

  if (selectedComponent === 'climateControl') {
    return renderClimateControl();
  }

  if (selectedComponent === 'acCooling') {
    return renderPhotoIssueDetail(
      'AC Cooling',
      AC_COOLING_ISSUE_OPTIONS,
      acData.acCoolingInspection,
      (block) => updateAC('acCoolingInspection', block),
    );
  }

  if (selectedComponent === 'heaterSystem') {
    return renderPhotoIssueDetail(
      'Heater System',
      HEATER_SYSTEM_ISSUE_OPTIONS,
      acData.heaterSystemStatus,
      (block) => updateAC('heaterSystemStatus', block),
    );
  }

  if (selectedComponent === 'acPanel') {
    return renderPhotoIssueDetail(
      'AC Control Panel',
      AC_CONTROL_PANEL_ISSUE_OPTIONS,
      acData.acPanelInspection,
      (block) => updateAC('acPanelInspection', block),
    );
  }

  if (selectedComponent === 'blowerMotor') {
    return renderPhotoIssueDetail(
      'Blower Motor',
      BLOWER_MOTOR_ISSUE_OPTIONS,
      acData.blowerMotorInspection,
      (block) => updateAC('blowerMotorInspection', block),
    );
  }

  if (selectedComponent === 'acCompressor') {
    return renderPhotoIssueDetail(
      'AC Compressor',
      AC_COMPRESSOR_ISSUE_OPTIONS,
      acData.acCompressorInspection,
      (block) => updateAC('acCompressorInspection', block),
    );
  }

  if (selectedComponent === 'ventilation') {
    return renderPhotoIssueDetail(
      'Ventilation System',
      VENTILATION_SYSTEM_ISSUE_OPTIONS,
      acData.ventilationSystemInspection,
      (block) => updateAC('ventilationSystemInspection', block),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Air Conditioning" subtitle="Step 3 of 6" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.componentsContainer}>{AC_COMPONENTS.map(renderComponentCard)}</View>
      </ScrollView>

      <View style={styles.footer}>
        {!isComplete && <Text style={styles.hint}>* Complete required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step3-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  componentsContainer: { gap: vs(12) },
  componentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: vs(8),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbWrap: {
    marginRight: spacing.md,
  },
  thumb: {
    width: hs(72),
    height: vs(72),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  thumbIcon: {
    fontSize: vs(20),
    marginBottom: vs(2),
  },
  thumbFallbackText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: vs(4),
  },
  cardSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: borderRadius.md,
    marginTop: vs(2),
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(10),
  },
  editIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginRight: hs(4),
  },
  editText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  requiredStar: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
    alignSelf: 'flex-start',
  },
  extraSection: {
    marginTop: vs(16),
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(8),
  },
});

export default Step2AirConditioning;
