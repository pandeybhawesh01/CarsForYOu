import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Modal } from 'react-native';
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
import { spacing } from '../../../../constants/spacing';
import { vs } from '../../../../utils/scaling';
import {
  DOCUMENT_PHOTO_ISSUE_OPTIONS,
  DOCUMENT_PHOTO_LABELS,
  DOCUMENT_PHOTO_URI_KEYS,
  type DocumentPhotoDetailKey,
} from '../../../../constants/inspectionSchema';
import type { MediaData } from '../../types';
import { isPhotoIssueBlockComplete } from '../../utils/photoInspection';

function isDocDetailOrLegacyComplete(
  media: Partial<MediaData>,
  detailKey: DocumentPhotoDetailKey,
  required: boolean,
): boolean {
  if (!required) {
    return true;
  }
  const block = media.documentPhotoDetails?.[detailKey];
  if (block && isPhotoIssueBlockComplete(block, { requirePhoto: true, photoOnlyOk: true })) {
    return true;
  }
  const legacyUriKey = DOCUMENT_PHOTO_URI_KEYS[detailKey];
  if (legacyUriKey) {
    const uri = (media as Record<string, string | undefined>)[legacyUriKey];
    if (uri) {
      return true;
    }
  }
  return false;
}

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

  const leadTypes = useMemo(
    () => ['C2B', 'NBFC', 'PDI', 'NPDI', 'WARRANTY'],
    [],
  );
  const rcOptions = useMemo(
    () => ['Original', 'Duplicate', 'Lost with photocopy'],
    [],
  );

  const isComplete = Boolean(
    isDocDetailOrLegacyComplete(mediaData, 'rcFront', true) &&
      isDocDetailOrLegacyComplete(mediaData, 'frontMain', true) &&
      isDocDetailOrLegacyComplete(mediaData, 'rearMain', true) &&
      isDocDetailOrLegacyComplete(mediaData, 'vinPlate', true) &&
      (data as Record<string, string>).chassisNumber &&
      (data as Record<string, string>).leadType &&
      (data as Record<string, string>).rcAvailability &&
      data.registrationStateMatches !== undefined &&
      data.duplicateKeyAvailable !== undefined,
  );

  const handleNext = useCallback(() => {
    if (isComplete) {
      markStepComplete(InspectionStepId.BasicVerification);
      onNext();
    }
  }, [isComplete, markStepComplete, onNext]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Car Details"
        subtitle="Step 1 of 6"
        onBack={onBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents Tab</Text>
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
                <Text
                  key={type}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => updateText('leadType', type)}>
                  {type}
                </Text>
              );
            })}
          </View>
          <Text style={styles.fieldLabel}>RC Availability *</Text>
          <View style={styles.rowWrap}>
            {rcOptions.map((option) => {
              const selected = (data as Record<string, string>).rcAvailability === option;
              return (
                <Text
                  key={option}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => updateText('rcAvailability', option)}>
                  {option}
                </Text>
              );
            })}
          </View>
        </View>

        <View style={styles.tabRow}>
          <Text style={[styles.tab, activeTab === 'documents' && styles.tabActive]} onPress={() => setActiveTab('documents')}>
            Documents
          </Text>
          <Text style={[styles.tab, activeTab === 'optional' && styles.tabActive]} onPress={() => setActiveTab('optional')}>
            Optional Documents
          </Text>
        </View>

        {activeTab === 'optional' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Documents Tab</Text>
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

        {activeTab === 'documents' && (
          <View style={styles.infoCard}>
            <Text style={styles.hint}>Capture all mandatory images clearly before proceeding.</Text>
          </View>
        )}

      </ScrollView>

      <Modal visible={docModalKey !== null} animationType="slide" onRequestClose={() => setDocModalKey(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
          {docModalKey ? (
            <InspectionImageDetailPanel
              title={DOCUMENT_PHOTO_LABELS[docModalKey]}
              issueOptions={DOCUMENT_PHOTO_ISSUE_OPTIONS}
              value={mediaData.documentPhotoDetails?.[docModalKey]}
              onChange={(block) => {
                const uriField = DOCUMENT_PHOTO_URI_KEYS[docModalKey];
                const uri = block.photos?.[0] ?? '';
                const prevDetails = mediaData.documentPhotoDetails ?? {};
                updateFormData(InspectionStepId.Media, {
                  documentPhotoDetails: { ...prevDetails, [docModalKey]: block },
                  ...(uriField ? { [uriField]: uri } : {}),
                });
              }}
              onBack={() => setDocModalKey(null)}
              layout="photoFirstSubmit"
              listBackTitle="Car Details"
              photoLabel="Photo"
            />
          ) : null}
        </SafeAreaView>
      </Modal>

      <View style={styles.footer}>
        {!isComplete && (
          <Text style={styles.hint}>* Complete all required fields to proceed</Text>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: vs(20) },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: vs(16),
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: vs(10),
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: vs(8),
    fontWeight: typography.fontWeight.medium,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(12),
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: vs(8),
    borderRadius: 20,
    color: colors.text,
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  infoCard: {
    padding: spacing.base,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginBottom: vs(16),
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

export default Step1BasicVerification;
