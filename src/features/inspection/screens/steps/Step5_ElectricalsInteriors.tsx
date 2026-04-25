import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId, YesNoNA } from '../../types';
import PhotoCapture from '../../components/PhotoCapture';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { spacing } from '../../../../constants/spacing';
import { typography } from '../../../../constants/typography';
import { hs, vs } from '../../../../utils/scaling';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type ElectricalsInteriorsData = {
  lockSystemStatus?: YesNoNA;
  frontLeftWindowStatus?: YesNoNA;
  frontRightWindowStatus?: YesNoNA;
  lockSystemPhoto?: string;
  frontLeftWindowPhoto?: string;
  frontRightWindowPhoto?: string;
  powerWindowsCount?: string;
  sunroofAvailable?: YesNoNA;
  sunroofPhoto?: string;
  musicSystemPresent?: YesNoNA;
} & Record<string, string | YesNoNA | undefined>;

type CardKey = 'lock' | 'front-left' | 'front-right';
type StatusKey = 'lockSystemStatus' | 'frontLeftWindowStatus' | 'frontRightWindowStatus';
type PhotoKey = 'lockSystemPhoto' | 'frontLeftWindowPhoto' | 'frontRightWindowPhoto';

interface CardDefinition {
  key: CardKey;
  title: string;
  statusKey: StatusKey;
  photoKey: PhotoKey;
}

const POWER_WINDOW_OPTIONS = ['0', '2', '4'] as const;

const CARD_DEFINITIONS: CardDefinition[] = [
  {
    key: 'lock',
    title: 'Lock system',
    statusKey: 'lockSystemStatus',
    photoKey: 'lockSystemPhoto',
  },
  {
    key: 'front-left',
    title: 'Front left window',
    statusKey: 'frontLeftWindowStatus',
    photoKey: 'frontLeftWindowPhoto',
  },
  {
    key: 'front-right',
    title: 'Front right window',
    statusKey: 'frontRightWindowStatus',
    photoKey: 'frontRightWindowPhoto',
  },
];

const isValidImageUri = (uri?: string) => Boolean(uri && /^(https?:|file:|content:)/i.test(uri));

const yesNoLabel = (value?: YesNoNA): string => {
  if (value === YesNoNA.Yes) return 'Yes';
  if (value === YesNoNA.No) return 'No';
  return '';
};

const Step5ElectricalsInteriors: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const data = (currentSession?.formData.documents ?? {}) as ElectricalsInteriorsData;
  const appointmentId = currentSession?.appointmentId ?? '';
  const [activeCard, setActiveCard] = useState<CardKey | null>(null);

  const updateField = useCallback(
    <K extends keyof ElectricalsInteriorsData>(key: K, value: ElectricalsInteriorsData[K]) => {
      updateFormData(InspectionStepId.Documents, { [key]: value });
    },
    [updateFormData],
  );

  const captureSunroofPhoto = useCallback(() => {
    Alert.alert(
      'Capture Photo',
      'In production, this opens the camera via react-native-image-picker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Capture',
          onPress: () => updateField('sunroofPhoto', `captured_sunroof_${Date.now()}`),
        },
      ],
    );
  }, [updateField]);

  const summaryCards = useMemo(
    () =>
      CARD_DEFINITIONS.map((card) => ({
        ...card,
        status: data[card.statusKey],
        photo: data[card.photoKey],
      })),
    [
      data.frontLeftWindowPhoto,
      data.frontLeftWindowStatus,
      data.frontRightWindowPhoto,
      data.frontRightWindowStatus,
      data.lockSystemPhoto,
      data.lockSystemStatus,
    ],
  );

  const sunroofRequiredDone =
    data.sunroofAvailable === YesNoNA.No ||
    (data.sunroofAvailable === YesNoNA.Yes && Boolean(data.sunroofPhoto));

  const isComplete =
    Boolean(data.powerWindowsCount) &&
    Boolean(data.sunroofAvailable) &&
    Boolean(data.musicSystemPresent) &&
    sunroofRequiredDone;

  const handleNext = useCallback(() => {
    if (!isComplete) {
      return;
    }
    markStepComplete(InspectionStepId.Documents);
    onNext();
  }, [isComplete, markStepComplete, onNext]);

  const activeCardMeta = activeCard
    ? CARD_DEFINITIONS.find((card) => card.key === activeCard) ?? null
    : null;

  if (activeCardMeta) {
    const statusValue = data[activeCardMeta.statusKey];
    const photoValue = data[activeCardMeta.photoKey];
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <AppHeader
          title={activeCardMeta.title}
          subtitle={`Appt. ID : ${appointmentId}`}
          onBack={() => setActiveCard(null)}
        />

        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Capture image</Text>
            <PhotoCapture
              label="Photo"
              imageUri={photoValue}
              onCapture={(uri) => updateField(activeCardMeta.photoKey, uri)}
              isRequired
            />

            <Text style={styles.detailTitle}>Is this component working?</Text>
            <View style={styles.optionRow}>
              {[YesNoNA.Yes, YesNoNA.No].map((value) => {
                const selected = statusValue === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                    onPress={() => updateField(activeCardMeta.statusKey, value)}
                    activeOpacity={0.85}>
                    <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                      {yesNoLabel(value)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton label="Done" onPress={() => setActiveCard(null)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader
        title="Electricals + Interiors"
        subtitle={`Appt. ID : ${appointmentId}`}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {summaryCards.map((card) => {
          const allOk = card.status === YesNoNA.Yes;
          return (
            <TouchableOpacity
              key={card.key}
              style={styles.statusCard}
              activeOpacity={0.85}
              onPress={() => setActiveCard(card.key)}>
              <View style={styles.thumbWrap}>
                {isValidImageUri(card.photo) ? (
                  <Image source={{ uri: card.photo }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbFallback}>
                    <Text style={styles.eyeIcon}>◉</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={[styles.badge, allOk ? styles.badgeOk : styles.badgeIssue]}>
                  <Text style={[styles.badgeText, allOk ? styles.badgeTextOk : styles.badgeTextIssue]}>
                    {allOk ? 'ALL OK' : 'ISSUE SUBMITTED'}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <TouchableOpacity
                  style={styles.editRow}
                  onPress={() => setActiveCard(card.key)}
                  activeOpacity={0.8}>
                  <Text style={styles.editText}>Edit ↻</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.requiredMark}>*</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>
            Count of power windows <Text style={styles.requiredInline}>*</Text>
          </Text>
          <Text style={styles.blockSubTitle}>Select count of power windows</Text>
          <View style={styles.optionRow}>
            {POWER_WINDOW_OPTIONS.map((option) => {
              const selected = data.powerWindowsCount === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.countChip, selected && styles.countChipSelected]}
                  onPress={() => updateField('powerWindowsCount', option)}
                  activeOpacity={0.85}>
                  <Text style={[styles.countChipText, selected && styles.countChipTextSelected]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>
            Sunroof <Text style={styles.requiredInline}>*</Text>
          </Text>
          <Text style={styles.blockSubTitle}>Is sunroof available?</Text>
          <View style={styles.optionRow}>
            {[YesNoNA.Yes, YesNoNA.No].map((value) => {
              const selected = data.sunroofAvailable === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                  onPress={() => updateField('sunroofAvailable', value)}
                  activeOpacity={0.85}>
                  <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                    {yesNoLabel(value)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {data.sunroofAvailable === YesNoNA.Yes ? (
            <View style={styles.sunroofCaptureCard}>
              <Text style={styles.sunroofCaptureTitle}>
                Sunroof <Text style={styles.requiredInline}>*</Text>
              </Text>
              <View style={styles.sunroofPreview}>
                {isValidImageUri(data.sunroofPhoto) ? (
                  <Image source={{ uri: data.sunroofPhoto }} style={styles.sunroofPreviewImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.sunroofIcon}>🚘</Text>
                )}
              </View>
              <TouchableOpacity style={styles.captureButton} onPress={captureSunroofPhoto} activeOpacity={0.85}>
                <Text style={styles.captureButtonText}>
                  {data.sunroofPhoto ? 'Retake photo' : 'Take photo'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={[styles.block, styles.lastBlock]}>
          <Text style={styles.blockTitle}>
            Is the music system present? <Text style={styles.requiredInline}>*</Text>
          </Text>
          <View style={styles.optionRow}>
            {[YesNoNA.Yes, YesNoNA.No].map((value) => {
              const selected = data.musicSystemPresent === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                  onPress={() => updateField('musicSystemPresent', value)}
                  activeOpacity={0.85}>
                  <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
                    {yesNoLabel(value)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>You may go to next section once this is completed.</Text>
        <AppButton label="Next" onPress={handleNext} isDisabled={!isComplete} testID="step5-next-btn" />
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
    paddingBottom: vs(24),
  },
  detailContent: {
    padding: spacing.base,
    paddingBottom: vs(24),
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.base,
  },
  detailTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: vs(10),
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: vs(12),
    padding: spacing.sm,
    flexDirection: 'row',
    position: 'relative',
  },
  thumbWrap: {
    width: hs(86),
    height: vs(76),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
  },
  eyeIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    marginBottom: vs(8),
  },
  badgeOk: {
    backgroundColor: colors.successLight,
  },
  badgeIssue: {
    backgroundColor: colors.warningLight,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextOk: {
    color: colors.success,
  },
  badgeTextIssue: {
    color: colors.warning,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: vs(8),
  },
  editRow: {
    alignSelf: 'flex-start',
  },
  editText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  requiredMark: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.xs,
    color: colors.error,
    fontSize: typography.fontSize.md,
  },
  block: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: vs(12),
  },
  lastBlock: {
    marginBottom: 0,
  },
  blockTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: vs(10),
  },
  blockSubTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: vs(10),
  },
  requiredInline: {
    color: colors.error,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
  },
  countChip: {
    minWidth: hs(36),
    paddingHorizontal: hs(10),
    paddingVertical: vs(8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  countChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  countChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  countChipTextSelected: {
    color: colors.primary,
  },
  choiceChip: {
    minWidth: hs(52),
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  choiceChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  choiceChipTextSelected: {
    color: colors.primary,
  },
  sunroofCaptureCard: {
    marginTop: vs(14),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.base,
  },
  sunroofCaptureTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: vs(10),
  },
  sunroofPreview: {
    height: vs(90),
    borderRadius: 10,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: vs(12),
  },
  sunroofPreviewImage: {
    width: '100%',
    height: '100%',
  },
  sunroofIcon: {
    fontSize: typography.fontSize.xxl,
  },
  captureButton: {
    borderRadius: 10,
    backgroundColor: colors.accent,
    paddingVertical: vs(11),
    alignItems: 'center',
  },
  captureButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  footerHint: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    marginBottom: vs(8),
  },
});

export default Step5ElectricalsInteriors;