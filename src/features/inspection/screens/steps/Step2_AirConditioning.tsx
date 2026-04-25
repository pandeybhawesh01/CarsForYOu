import React, { useCallback, useMemo, useState } from 'react';
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
import { spacing, borderRadius, verticalSpacing } from '../../../../constants/spacing';
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
import { useCatalogViewModel, selectCatalog } from '../../../../viewmodels/catalogViewModel';

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

interface StatusBadge {
  status: string;
  bgColor: string;
  textColor: string;
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

const EDIT_HIT_SLOP = { top: 10, bottom: 10, left: 8, right: 8 } as const;

const isValidImageUri = (uri?: string) => Boolean(uri && /^(https?:|file:|content:)/i.test(uri));

const getStatusBadge = (component: ACComponent, data: Partial<ACData>): StatusBadge => {
  const empty: StatusBadge = { status: '', bgColor: colors.borderLight, textColor: colors.textSecondary };

  if (component.id === 'climateControl') {
    const value = data.climateControlAvailable;
    if (!value) return empty;
    if (value === 'YES' || value === 'WORKING') {
      return { status: 'ALL OK', bgColor: colors.successLight, textColor: colors.success };
    }
    return { status: 'ISSUE SUBMITTED', bgColor: colors.warningLight, textColor: colors.warning };
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
  if (!value) return empty;
  if (value.issues?.length) {
    return { status: 'ISSUE SUBMITTED', bgColor: colors.warningLight, textColor: colors.warning };
  }
  if (value.status || value.photos?.length) {
    return { status: 'ALL OK', bgColor: colors.successLight, textColor: colors.success };
  }
  return empty;
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

const countInspected = (data: Partial<ACData>): number => {
  let count = 0;
  if (data.climateControlAvailable) count++;
  if (data.ventilationSystemInspection?.status || data.ventilationSystemInspection?.photos?.length) count++;
  if (data.acCoolingInspection?.status || data.acCoolingInspection?.photos?.length) count++;
  if (data.acPanelInspection?.status || data.acPanelInspection?.photos?.length) count++;
  if (data.blowerMotorInspection?.status || data.blowerMotorInspection?.photos?.length) count++;
  if (data.acCompressorInspection?.status || data.acCompressorInspection?.photos?.length) count++;
  if (data.heaterSystemStatus?.status || data.heaterSystemStatus?.photos?.length) count++;
  return count;
};

const Step2AirConditioning: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const acData: Partial<ACData> = currentSession?.formData.ac ?? {};
  const [selectedComponent, setSelectedComponent] = useState<ACComponentType | null>(null);

  const catalog = useCatalogViewModel(selectCatalog);
  const ac = catalog.airConditioning;

  const updateAC = useCallback(
    (key: keyof ACData, val: ACData[keyof ACData]) => updateFormData(InspectionStepId.Exterior, { [key]: val }),
    [updateFormData],
  );

  const isComplete = Boolean(
    acData.climateControlAvailable &&
      isPhotoIssueBlockComplete(acData.acCoolingInspection, { requirePhoto: false, photoOnlyOk: true }),
  );

  const inspectedCount = useMemo(() => countInspected(acData), [acData]);
  const totalCount = AC_COMPONENTS.length;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.Exterior);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  const handleSelectComponent = useCallback((id: ACComponentType) => {
    setSelectedComponent(id);
  }, []);

  const handleBack = useCallback(() => setSelectedComponent(null), []);

  const renderComponentCard = useCallback(
    (component: ACComponent) => {
      const badge = getStatusBadge(component, acData);
      const previewUri = getPreviewUri(component.id, acData);
      const hasPreview = isValidImageUri(previewUri);

      return (
        <TouchableOpacity
          key={component.id}
          style={styles.componentCard}
          onPress={() => handleSelectComponent(component.id)}
          activeOpacity={0.78}>
          {/* Thumbnail */}
          <View style={styles.thumbWrap}>
            <View style={styles.thumb}>
              {hasPreview ? (
                <Image source={{ uri: previewUri }} style={styles.thumbImage} resizeMode="cover" />
              ) : (
                <View style={styles.thumbFallback}>
                  <Text style={styles.thumbIcon}>📷</Text>
                  <Text style={styles.thumbFallbackText}>Tap to add</Text>
                </View>
              )}
            </View>
          </View>

          {/* Card body */}
          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardTextWrap}>
                {/* Title row with inline required star */}
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{component.title}</Text>
                  {component.isRequired ? <Text style={styles.requiredStar}> *</Text> : null}
                </View>
                <Text style={styles.cardSubtitle}>{component.subtitle}</Text>
              </View>

              {badge.status ? (
                <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                  <Text style={[styles.statusText, { color: badge.textColor }]}>{badge.status}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.editRow}
              onPress={() => handleSelectComponent(component.id)}
              hitSlop={EDIT_HIT_SLOP}
              activeOpacity={0.6}>
              <Text style={styles.editIcon}>✎</Text>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [acData, handleSelectComponent],
  );

  const renderClimateControl = () => (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <InspectionImageDetailPanel
        title="Climate Control"
        subtitle="Step 3 of 6"
        issueOptions={[]}
        value={acData.climateControlInspection}
        onChange={(block) => updateAC('climateControlInspection', block)}
        onBack={handleBack}
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
        onBack={handleBack}
        layout="photoFirstSubmit"
        photoLabel="Photo"
        photoRequired={false}
      />
    </SafeAreaView>
  );

  if (selectedComponent === 'climateControl') return renderClimateControl();

  if (selectedComponent === 'acCooling') {
    return renderPhotoIssueDetail(
      'AC Cooling',
      ac.acCoolingIssues,
      acData.acCoolingInspection,
      (block) => updateAC('acCoolingInspection', block),
    );
  }

  if (selectedComponent === 'heaterSystem') {
    return renderPhotoIssueDetail(
      'Heater System',
      ['Not working'],
      acData.heaterSystemStatus,
      (block) => updateAC('heaterSystemStatus', block),
    );
  }

  if (selectedComponent === 'acPanel') {
    return renderPhotoIssueDetail(
      'AC Control Panel',
      ac.acControlPanelIssues,
      acData.acPanelInspection,
      (block) => updateAC('acPanelInspection', block),
    );
  }

  if (selectedComponent === 'blowerMotor') {
    return renderPhotoIssueDetail(
      'Blower Motor',
      ac.blowerMotorIssues,
      acData.blowerMotorInspection,
      (block) => updateAC('blowerMotorInspection', block),
    );
  }

  if (selectedComponent === 'acCompressor') {
    return renderPhotoIssueDetail(
      'AC Compressor',
      ac.acCompressorIssues,
      acData.acCompressorInspection,
      (block) => updateAC('acCompressorInspection', block),
    );
  }

  if (selectedComponent === 'ventilation') {
    return renderPhotoIssueDetail(
      'Ventilation System',
      ac.ventilationSystemIssues,
      acData.ventilationSystemInspection,
      (block) => updateAC('ventilationSystemInspection', block),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Air Conditioning" subtitle="Step 3 of 6" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AC Components</Text>
          <Text style={styles.sectionSubtitle}>Tap each component to inspect</Text>
          <Text style={styles.progressText}>
            {inspectedCount} / {totalCount} components inspected
          </Text>
        </View>

        <View style={styles.componentsContainer}>
          {AC_COMPONENTS.map(renderComponentCard)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!isComplete && (
          <Text style={styles.hint}>* Complete required fields to proceed</Text>
        )}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step3-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: verticalSpacing.lg,
  },

  // Section header
  sectionHeader: {
    marginBottom: verticalSpacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
    marginBottom: verticalSpacing.xxs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: verticalSpacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },

  // Component list
  componentsContainer: {
    gap: vs(12),
  },
  componentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Thumbnail
  thumbWrap: {
    marginRight: spacing.md,
  },
  thumb: {
    width: hs(72),
    height: vs(72),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Card body
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  requiredStar: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: borderRadius.md,
    marginTop: vs(2),
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },

  // Edit row
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(10),
    paddingVertical: vs(4),
    paddingRight: spacing.sm,
    alignSelf: 'flex-start',
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

  // Misc
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
    color: colors.warning,
    textAlign: 'center',
    marginBottom: vs(8),
  },
});

export default Step2AirConditioning;
