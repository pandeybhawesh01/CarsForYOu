import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, YesNoNA } from '../../types';
import YesNoSelector from '../../components/YesNoSelector';
import AppInput from '../../../../components/AppInput';
import InspectionPhotoSummaryRow from '../../components/InspectionPhotoSummaryRow';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../../constants/spacing';
import { vs } from '../../../../utils/scaling';
import {
  DOCUMENT_PHOTO_ISSUE_OPTIONS,
  DOCUMENT_PHOTO_LABELS,
  DOCUMENT_PHOTO_URI_KEYS,
  type DocumentPhotoDetailKey,
} from '../../../../constants/inspectionSchema';
import type { MediaData, PhotoIssueInspectionBlock } from '../../types';
import { isPhotoIssueBlockComplete } from '../../utils/photoInspection';
import { useCatalogViewModel, selectCatalog } from '../../../../viewmodels/catalogViewModel';

// ─── helpers ────────────────────────────────────────────────────────────────

function isDocDetailOrLegacyComplete(
  media: Partial<MediaData>,
  detailKey: DocumentPhotoDetailKey,
  required: boolean,
): boolean {
  if (!required) return true;
  const block = media.documentPhotoDetails?.[detailKey];
  if (block && isPhotoIssueBlockComplete(block, { requirePhoto: true, photoOnlyOk: true })) {
    return true;
  }
  const legacyUriKey = DOCUMENT_PHOTO_URI_KEYS[detailKey];
  if (legacyUriKey) {
    const uri = (media as Record<string, string | undefined>)[legacyUriKey];
    if (uri) return true;
  }
  return false;
}

// ─── sub-components ─────────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: 'documents' | 'optional';
  onSelect: (tab: 'documents' | 'optional') => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelect }) => (
  <View style={tabStyles.container}>
    {(['documents', 'optional'] as const).map((tab) => {
      const isActive = activeTab === tab;
      const label = tab === 'documents' ? 'Documents' : 'Optional Documents';
      return (
        <TouchableOpacity
          key={tab}
          style={[tabStyles.tab, isActive && tabStyles.tabActive]}
          onPress={() => onSelect(tab)}
          activeOpacity={0.75}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}>
          <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: verticalSpacing.base,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalSpacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

// ─── progress row ────────────────────────────────────────────────────────────

interface ProgressRowProps {
  filled: number;
  total: number;
}

const ProgressRow: React.FC<ProgressRowProps> = ({ filled, total }) => {
  const allDone = filled === total;
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[progressStyles.dot, i < filled ? progressStyles.dotFilled : progressStyles.dotEmpty]}
          />
        ))}
      </View>
      <Text style={[progressStyles.label, allDone && progressStyles.labelDone]}>
        {allDone ? '✓ All required fields complete' : `${filled} of ${total} required fields complete`}
      </Text>
    </View>
  );
};

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: verticalSpacing.sm,
    marginBottom: verticalSpacing.base,
    gap: spacing.sm,
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
    }),
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.full,
  },
  dotFilled: {
    backgroundColor: colors.success,
  },
  dotEmpty: {
    backgroundColor: colors.border,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  labelDone: {
    color: colors.success,
    fontWeight: typography.fontWeight.semiBold,
  },
});

// ─── info banner ─────────────────────────────────────────────────────────────

const InfoBanner: React.FC<{ message: string }> = ({ message }) => (
  <View style={bannerStyles.container}>
    <Text style={bannerStyles.icon}>ℹ️</Text>
    <Text style={bannerStyles.text}>{message}</Text>
  </View>
);

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    marginBottom: verticalSpacing.base,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  icon: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.sm,
  },
});

// ─── section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: string;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <View style={sectionHeaderStyles.container}>
    <Text style={sectionHeaderStyles.icon}>{icon}</Text>
    <Text style={sectionHeaderStyles.title}>{title}</Text>
  </View>
);

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.base,
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.base,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// ─── card shadow style (shared) ───────────────────────────────────────────────

const cardShadow = Platform.select({
  android: { elevation: 2 },
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
}) as object;

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const Step1BasicVerification: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = currentSession?.formData.basicVerification ?? {};
  const mediaData = currentSession?.formData.media ?? { additionalImages: [] };
  const [activeTab, setActiveTab] = useState<'documents' | 'optional'>('documents');
  const [docModalKey, setDocModalKey] = useState<DocumentPhotoDetailKey | null>(null);

  const update = useCallback(
    (key: keyof typeof data, val: YesNoNA) => {
      updateFormData(InspectionStepId.BasicVerification, { [key]: val });
    },
    [updateFormData],
  );

  const updateText = useCallback(
    (key: string, value: string) => {
      updateFormData(InspectionStepId.BasicVerification, { [key]: value });
    },
    [updateFormData],
  );

  const catalog = useCatalogViewModel(selectCatalog);
  const leadTypes = useMemo(
    () => (catalog.vehicle.leadTypes.length ? catalog.vehicle.leadTypes : ['C2B', 'NBFC', 'PDI', 'NPDI', 'WARRANTY']),
    [catalog.vehicle.leadTypes],
  );
  const rcOptions = useMemo(
    () => (catalog.vehicle.rcConditionOptions.length ? catalog.vehicle.rcConditionOptions : ['Original', 'Duplicate', 'Lost with photocopy']),
    [catalog.vehicle.rcConditionOptions],
  );

  // Required field completion tracking
  const requiredFieldsStatus = useMemo(() => {
    const checks = [
      isDocDetailOrLegacyComplete(mediaData, 'rcFront', true),
      isDocDetailOrLegacyComplete(mediaData, 'frontMain', true),
      isDocDetailOrLegacyComplete(mediaData, 'rearMain', true),
      isDocDetailOrLegacyComplete(mediaData, 'vinPlate', true),
      Boolean((data as Record<string, string>).chassisNumber),
      Boolean((data as Record<string, string>).leadType),
      Boolean((data as Record<string, string>).rcAvailability),
      data.registrationStateMatches !== undefined,
      data.duplicateKeyAvailable !== undefined,
    ];
    return { filled: checks.filter(Boolean).length, total: checks.length };
  }, [mediaData, data]);

  const isComplete = requiredFieldsStatus.filled === requiredFieldsStatus.total;

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.BasicVerification);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  const handleCloseModal = useCallback(() => setDocModalKey(null), []);

  const handleDocChange = useCallback(
    (block: PhotoIssueInspectionBlock) => {
      if (!docModalKey) return;
      const uriField = DOCUMENT_PHOTO_URI_KEYS[docModalKey];
      const uri = block.photos?.[0] ?? '';
      const prevDetails = mediaData.documentPhotoDetails ?? {};
      updateFormData(InspectionStepId.Media, {
        documentPhotoDetails: { ...prevDetails, [docModalKey]: block },
        ...(uriField ? { [uriField]: uri } : {}),
      });
    },
    [docModalKey, mediaData.documentPhotoDetails, updateFormData],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Car Details" subtitle="Step 1 of 6" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Progress indicator */}
        <ProgressRow
          filled={requiredFieldsStatus.filled}
          total={requiredFieldsStatus.total}
        />

        {/* Tab switcher — at the TOP before any content */}
        <TabBar activeTab={activeTab} onSelect={setActiveTab} />

        {/* Documents tab content */}
        {activeTab === 'documents' && (
          <>
            <View style={[styles.section, cardShadow]}>
              <SectionHeader icon="📄" title="Required Documents" />
              <InspectionPhotoSummaryRow
                label={DOCUMENT_PHOTO_LABELS.rcFront}
                isRequired
                block={mediaData.documentPhotoDetails?.rcFront}
                onEdit={() => setDocModalKey('rcFront')}
              />
              <InspectionPhotoSummaryRow
                label={DOCUMENT_PHOTO_LABELS.rcBack}
                block={mediaData.documentPhotoDetails?.rcBack}
                onEdit={() => setDocModalKey('rcBack')}
              />
              <InspectionPhotoSummaryRow
                label={DOCUMENT_PHOTO_LABELS.frontMain}
                isRequired
                block={mediaData.documentPhotoDetails?.frontMain}
                onEdit={() => setDocModalKey('frontMain')}
              />
              <InspectionPhotoSummaryRow
                label={DOCUMENT_PHOTO_LABELS.rearMain}
                isRequired
                block={mediaData.documentPhotoDetails?.rearMain}
                onEdit={() => setDocModalKey('rearMain')}
              />
              <InspectionPhotoSummaryRow
                label={DOCUMENT_PHOTO_LABELS.vinPlate}
                isRequired
                block={mediaData.documentPhotoDetails?.vinPlate}
                onEdit={() => setDocModalKey('vinPlate')}
              />
              <AppInput
                label="Chassis Number"
                value={(data as Record<string, string>).chassisNumber ?? ''}
                onChangeText={(v) => updateText('chassisNumber', v.toUpperCase())}
                autoCapitalize="characters"
                isRequired
              />
              <YesNoSelector
                label="Is Registration transferred from another state?"
                value={data.registrationStateMatches as YesNoNA}
                onChange={(v) => update('registrationStateMatches', v)}
                isRequired
              />
              <YesNoSelector
                label="Duplicate Key present?"
                value={(data as { duplicateKeyAvailable?: YesNoNA }).duplicateKeyAvailable}
                onChange={(v) => update('duplicateKeyAvailable' as keyof typeof data, v)}
                isRequired
              />

              <Text style={styles.fieldLabel}>Lead Type *</Text>
              <View style={styles.rowWrap}>
                {leadTypes.map((type) => {
                  const selected = (data as Record<string, string>).leadType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => updateText('leadType', type)}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>RC Availability *</Text>
              <View style={styles.rowWrap}>
                {rcOptions.map((option) => {
                  const selected = (data as Record<string, string>).rcAvailability === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => updateText('rcAvailability', option)}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <InfoBanner message="Capture all mandatory images clearly before proceeding." />
          </>
        )}

        {/* Optional documents tab content */}
        {activeTab === 'optional' && (
          <View style={[styles.section, cardShadow]}>
            <SectionHeader icon="📎" title="Optional Documents" />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.cngPlate}
              block={mediaData.documentPhotoDetails?.cngPlate}
              onEdit={() => setDocModalKey('cngPlate')}
            />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.cngTestCertificate}
              block={mediaData.documentPhotoDetails?.cngTestCertificate}
              onEdit={() => setDocModalKey('cngTestCertificate')}
            />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.roadTaxDocument}
              block={mediaData.documentPhotoDetails?.roadTaxDocument}
              onEdit={() => setDocModalKey('roadTaxDocument')}
            />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.ownerManual}
              block={mediaData.documentPhotoDetails?.ownerManual}
              onEdit={() => setDocModalKey('ownerManual')}
            />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.hypothecationProof}
              block={mediaData.documentPhotoDetails?.hypothecationProof}
              onEdit={() => setDocModalKey('hypothecationProof')}
            />
            <InspectionPhotoSummaryRow
              label={DOCUMENT_PHOTO_LABELS.addressProof}
              block={mediaData.documentPhotoDetails?.addressProof}
              onEdit={() => setDocModalKey('addressProof')}
            />
          </View>
        )}

      </ScrollView>

      {/* Document photo detail modal */}
      <Modal
        visible={docModalKey !== null}
        animationType="slide"
        onRequestClose={handleCloseModal}>
        <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
          {docModalKey ? (
            <InspectionImageDetailPanel
              title={DOCUMENT_PHOTO_LABELS[docModalKey]}
              issueOptions={DOCUMENT_PHOTO_ISSUE_OPTIONS}
              value={mediaData.documentPhotoDetails?.[docModalKey]}
              onChange={handleDocChange}
              onBack={handleCloseModal}
              layout="photoFirstSubmit"
              listBackTitle="Car Details"
              photoLabel="Photo"
            />
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        {!isComplete && (
          <Text style={styles.footerHint}>⚠ Complete all required fields to proceed</Text>
        )}
        <AppButton
          label="Next →"
          onPress={handleNext}
          isDisabled={!isComplete}
          testID="step1-next-btn"
        />
      </View>
    </SafeAreaView>
  );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
    paddingBottom: verticalSpacing.xxl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: verticalSpacing.base,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: verticalSpacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: verticalSpacing.md,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: verticalSpacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  // Footer
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerHint: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: verticalSpacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

export default Step1BasicVerification;
