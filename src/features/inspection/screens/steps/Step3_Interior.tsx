import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { borderRadius, spacing } from '../../../../constants/spacing';
import { typography } from '../../../../constants/typography';
import { vs } from '../../../../utils/scaling';
import { useCatalogViewModel, selectCatalog } from '../../../../viewmodels/catalogViewModel';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type SectionKey = 'steering' | 'brake' | 'suspension';

type IssueMap = Record<SectionKey, string[]>;

const SECTION_TITLES: Record<SectionKey, string> = {
  steering: 'Steering',
  brake: 'Brake',
  suspension: 'Suspension',
};

const SECTION_ICONS: Record<SectionKey, string> = {
  steering: '🔄',
  brake: '🛑',
  suspension: '🔧',
};

const MODAL_BACKDROP_COLOR = 'rgba(0,0,0,0.55)';

const Step3Interior: React.FC<Props> = ({ onNext, onBack }) => {
  const catalog = useCatalogViewModel(selectCatalog);
  const sb = catalog.steeringBrakes;

  // Issue options sourced from catalog, with hardcoded fallbacks
  const ISSUE_OPTIONS: Record<SectionKey, string[]> = useMemo(
    () => ({
      steering: sb.steeringIssues.length
        ? sb.steeringIssues
        : ['Hard steering movement', 'Steering wheel vibration', 'Steering play too high', 'Power steering warning light'],
      brake: sb.brakesIssues.length
        ? sb.brakesIssues
        : ['Brake pedal too soft', 'Brake noise while stopping', 'Handbrake not holding', 'ABS warning light on'],
      suspension: sb.suspensionIssues.length
        ? sb.suspensionIssues
        : ['Uneven ride height', 'Suspension knocking noise', 'Excessive body roll', 'Shock absorber leakage'],
    }),
    [sb],
  );
  const [selectedIssues, setSelectedIssues] = useState<IssueMap>({
    steering: [],
    brake: [],
    suspension: [],
  });
  const [activeModal, setActiveModal] = useState<SectionKey | null>(null);

  const sections: SectionKey[] = ['steering', 'brake', 'suspension'];

  const toggleIssue = (section: SectionKey, issue: string) => {
    setSelectedIssues((prev) => {
      const alreadySelected = prev[section].includes(issue);
      return {
        ...prev,
        [section]: alreadySelected
          ? prev[section].filter((item) => item !== issue)
          : [...prev[section], issue],
      };
    });
  };

  const summary = useMemo(
    () =>
      sections.map((section) => {
        const count = selectedIssues[section].length;
        const status = count === 0 ? 'OK' : 'Needs Attention';
        return {
          section,
          title: SECTION_TITLES[section],
          icon: SECTION_ICONS[section],
          count,
          status,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIssues],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Interior Inspection" subtitle="Step 3 of 6" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Section Summary</Text>
          <Text style={styles.pageSubtitle}>Select issues found in each section</Text>
        </View>

        {summary.map((item) => {
          const isAttention = item.status === 'Needs Attention';
          return (
            <View
              key={item.section}
              style={[
                styles.card,
                isAttention ? styles.cardAccentAttention : styles.cardAccentOk,
              ]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    isAttention ? styles.badgeAttention : styles.badgeOk,
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      isAttention ? styles.badgeTextAttention : styles.badgeTextOk,
                    ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardSubtext}>
                {item.count === 0
                  ? 'No issues selected'
                  : `${item.count} issue${item.count > 1 ? 's' : ''} selected`}
              </Text>

              <Pressable style={styles.detailButton} onPress={() => setActiveModal(item.section)}>
                <Text style={styles.detailButtonText}>Inspect →</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton label="Next ->" onPress={onNext} testID="step3-next-btn" />
      </View>

      {sections.map((section) => (
        <Modal
          key={section}
          visible={activeModal === section}
          transparent
          animationType="slide"
          onRequestClose={() => setActiveModal(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{SECTION_TITLES[section]} Details</Text>
              <Text style={styles.modalSubTitle}>Select all observed issues</Text>

              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {ISSUE_OPTIONS[section].map((issue) => {
                  const checked = selectedIssues[section].includes(issue);
                  return (
                    <Pressable
                      key={issue}
                      style={styles.checkboxRow}
                      onPress={() => toggleIssue(section, issue)}>
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
                      </View>
                      <Text style={styles.checkboxLabel}>{issue}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <AppButton label="Done" variant="primary" onPress={() => setActiveModal(null)} />
            </View>
          </View>
        </Modal>
      ))}
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
    paddingBottom: vs(20),
    gap: vs(12),
  },
  pageTitleContainer: {
    marginBottom: vs(4),
    gap: vs(2),
  },
  pageTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAccentOk: {
    borderLeftColor: colors.success,
    borderLeftWidth: 3,
  },
  cardAccentAttention: {
    borderLeftColor: colors.error,
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardIcon: {
    fontSize: typography.fontSize.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  cardSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: vs(10),
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: borderRadius.full,
  },
  badgeOk: {
    backgroundColor: colors.successLight,
  },
  badgeAttention: {
    backgroundColor: colors.errorLight,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextOk: {
    color: colors.success,
  },
  badgeTextAttention: {
    color: colors.error,
  },
  detailButton: {
    alignSelf: 'stretch',
    paddingVertical: vs(10),
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  detailButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: MODAL_BACKDROP_COLOR,
  },
  modalContainer: {
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.base,
    gap: vs(12),
  },
  modalTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalSubTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  modalList: {
    maxHeight: vs(320),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
  checkboxLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
});

export default Step3Interior;
