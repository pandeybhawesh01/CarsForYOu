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
import { spacing } from '../../../../constants/spacing';
import { typography } from '../../../../constants/typography';
import { vs } from '../../../../utils/scaling';

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

const ISSUE_OPTIONS: Record<SectionKey, string[]> = {
  steering: [
    'Hard steering movement',
    'Steering wheel vibration',
    'Steering play too high',
    'Power steering warning light',
  ],
  brake: [
    'Brake pedal too soft',
    'Brake noise while stopping',
    'Handbrake not holding',
    'ABS warning light on',
  ],
  suspension: [
    'Uneven ride height',
    'Suspension knocking noise',
    'Excessive body roll',
    'Shock absorber leakage',
  ],
};

const Step3Interior: React.FC<Props> = ({ onNext, onBack }) => {
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
          count,
          status,
        };
      }),
    [sections, selectedIssues],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <AppHeader title="Interior Inspection" subtitle="Step 3 of 6" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Section Summary</Text>

        {summary.map((item) => (
          <View key={item.section} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.badge,
                  item.status === 'OK' ? styles.badgeOk : styles.badgeAttention,
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.cardSubtext}>
              {item.count === 0
                ? 'No issues selected'
                : `${item.count} issue${item.count > 1 ? 's' : ''} selected`}
            </Text>

            <Pressable style={styles.detailButton} onPress={() => setActiveModal(item.section)}>
              <Text style={styles.detailButtonText}>View details</Text>
            </Pressable>
          </View>
        ))}
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
          onRequestClose={() => setActiveModal(null)}
        >
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
                      onPress={() => toggleIssue(section, issue)}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
                      </View>
                      <Text style={styles.checkboxLabel}>{issue}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <AppButton label="Done" onPress={() => setActiveModal(null)} />
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
  pageTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: vs(4),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeOk: {
    backgroundColor: '#D1FAE5',
  },
  badgeAttention: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  detailButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.xs,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
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
