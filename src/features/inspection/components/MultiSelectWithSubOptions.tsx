/**
 * MultiSelectWithSubOptions
 *
 * Drop-in replacement for MultiSelectChips when options carry `inputType: "select"`
 * and `subOptions1`. Tapping a chip that has subOptions opens an inline modal
 * immediately so the user picks the severity before the chip is confirmed.
 *
 * Tapping an already-selected chip deselects it and clears its subOption value.
 * Tapping the summary card that appears below re-opens the modal to change.
 *
 * The component is fully self-contained — no parent state or handler changes needed.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../../components/AppHeader';
import AppButton from '../../../components/AppButton';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../constants/spacing';
import type { CatalogOption } from '../../../services/api/types';

interface IssueObject {
  type: string;
  extent?: string | string[];
}

interface Props {
  label: string;
  options: CatalogOption[];
  selected: IssueObject[];                                 // issues as objects with type and optional extent
  onChange: (issues: IssueObject[]) => void;
  isRequired?: boolean;
}

interface ModalState {
  chipValue: string;
  chipLabel: string;
  subOptions: CatalogOption[];
  inputType: 'select' | 'multi-select';
  current: string | string[];
}

const MultiSelectWithSubOptions: React.FC<Props> = ({
  label,
  options,
  selected,
  onChange,
  isRequired = false,
}) => {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingMulti, setPendingMulti] = useState<string[]>([]);

  const getCurrentExtent = useCallback((issueType: string): string | string[] => {
    const issue = selected.find(i => i.type === issueType);
    return issue?.extent ?? '';
  }, [selected]);

  const openModal = useCallback((opt: CatalogOption, currentSub: string | string[]) => {
    const subOpts = opt.subOptions1 ?? [];
    const optInputType = ((opt as unknown as Record<string, string>).inputType ?? 'select') as 'select' | 'multi-select';
    setModal({
      chipValue: String(opt.value),
      chipLabel: opt.label,
      subOptions: subOpts,
      inputType: optInputType,
      current: currentSub,
    });
    if (optInputType === 'multi-select') {
      setPendingMulti(Array.isArray(currentSub) ? currentSub : []);
    }
  }, []);

  const handleChipPress = useCallback((opt: CatalogOption) => {
    const val = String(opt.value);
    const subOpts = opt.subOptions1 ?? [];
    const optInputType = (opt as unknown as Record<string, string>).inputType;
    const hasModalSub = subOpts.length > 0 && (optInputType === 'select' || optInputType === 'multi-select');
    const isSelected = selected.some(i => i.type === val);

    if (isSelected) {
      // Deselect: remove issue object
      const newIssues = selected.filter(i => i.type !== val);
      onChange(newIssues);
    } else if (hasModalSub) {
      // Open modal — chip will be confirmed after selection
      const currentExtent = getCurrentExtent(val);
      openModal(opt, currentExtent || (optInputType === 'multi-select' ? [] : ''));
    } else {
      // Plain chip — toggle on immediately (no extent)
      onChange([...selected, { type: val }]);
    }
  }, [selected, onChange, openModal, getCurrentExtent]);

  const handleSingleSelect = useCallback((value: string) => {
    if (!modal) return;
    const newIssues = selected.filter(i => i.type !== modal.chipValue);
    newIssues.push({ type: modal.chipValue, extent: value });
    onChange(newIssues);
    setModal(null);
  }, [modal, selected, onChange]);

  // Multi-select: toggle pending
  const handleMultiToggle = useCallback((value: string) => {
    setPendingMulti(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleMultiDone = useCallback(() => {
    if (!modal) return;
    const newIssues = selected.filter(i => i.type !== modal.chipValue);
    if (pendingMulti.length > 0) {
      newIssues.push({ type: modal.chipValue, extent: pendingMulti });
    } else {
      newIssues.push({ type: modal.chipValue });
    }
    onChange(newIssues);
    setModal(null);
  }, [modal, selected, pendingMulti, onChange]);

  const handleCloseModal = useCallback(() => setModal(null), []);

  return (
    <View style={styles.container}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>

      {/* Chip row */}
      <View style={styles.chipsWrap}>
        {options.map((opt) => {
          const val = String(opt.value);
          const isOn = selected.some(i => i.type === val);
          return (
            <TouchableOpacity
              key={val}
              style={[styles.chip, isOn && styles.chipOn]}
              onPress={() => handleChipPress(opt)}
              activeOpacity={0.75}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn }}
            >
              {isOn && <Text style={styles.checkmark}>✓ </Text>}
              <Text style={[styles.chipText, isOn && styles.chipTextOn]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary cards for selected chips that have subValues */}
      {options
        .filter(opt => {
          const val = String(opt.value);
          const subOpts = opt.subOptions1 ?? [];
          const optInputType = (opt as unknown as Record<string, string>).inputType;
          return (
            selected.some(i => i.type === val) &&
            subOpts.length > 0 &&
            (optInputType === 'select' || optInputType === 'multi-select')
          );
        })
        .map((opt) => {
          const val = String(opt.value);
          const subOpts = opt.subOptions1 ?? [];
          const optInputType = ((opt as unknown as Record<string, string>).inputType ?? 'select') as 'select' | 'multi-select';
          const issue = selected.find(i => i.type === val);
          const currentExtent = issue?.extent ?? (optInputType === 'multi-select' ? [] : '');

          const subLabel = (() => {
            if (optInputType === 'multi-select') {
              const vals = Array.isArray(currentExtent) ? currentExtent : [];
              if (vals.length === 0) return 'Tap to change';
              return `✓ ${vals.map(v => subOpts.find(s => String(s.value) === v)?.label).filter(Boolean).join(', ')}`;
            }
            const found = subOpts.find(s => String(s.value) === currentExtent);
            return found ? `✓ ${found.label}` : 'Tap to change';
          })();

          return (
            <TouchableOpacity
              key={`${val}-card`}
              style={styles.card}
              onPress={() => openModal(opt, currentExtent)}
              activeOpacity={0.75}
            >
              <View style={styles.cardIconWrap}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Extent of {opt.label}</Text>
                <Text style={styles.cardSub}>{subLabel}</Text>
              </View>
              <Text style={styles.cardChevron}>›</Text>
            </TouchableOpacity>
          );
        })}

      {/* SubOptions Modal */}
      <Modal visible={modal !== null} animationType="slide" onRequestClose={handleCloseModal}>
        <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
          {modal ? (
            <>
              <AppHeader
                title={`Extent of ${modal.chipLabel}`}
                subtitle="Select severity level"
                onBack={handleCloseModal}
                variant="primary"
              />
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.optionsList}>
                  {modal.subOptions.map((opt) => {
                    const val = String(opt.value);
                    const isMulti = modal.inputType === 'multi-select';
                    const isSelected = isMulti
                      ? pendingMulti.includes(val)
                      : modal.current === val;

                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                        onPress={() => isMulti ? handleMultiToggle(val) : handleSingleSelect(val)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.radio, isMulti && styles.checkbox]}>
                          {isSelected && (
                            <View style={isMulti ? styles.checkboxInner : styles.radioInner} />
                          )}
                        </View>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {opt.label}
                        </Text>
                        {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {modal.inputType === 'multi-select' && (
                  <View style={styles.doneWrap}>
                    <AppButton label="Done" onPress={handleMultiDone} />
                  </View>
                )}
              </ScrollView>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: verticalSpacing.md },
  labelRow: { flexDirection: 'row', marginBottom: verticalSpacing.sm },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, flex: 1 },
  required: { fontSize: typography.fontSize.sm, color: colors.error, fontWeight: typography.fontWeight.bold },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.base, paddingVertical: verticalSpacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  checkmark: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.bold },
  chipText: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.medium },
  chipTextOn: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
  // Summary card
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, marginTop: verticalSpacing.sm, marginBottom: verticalSpacing.xs, borderWidth: 1, borderColor: colors.borderLight, gap: spacing.sm },
  cardIconWrap: { width: 44, height: 44, borderRadius: borderRadius.sm, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semiBold, color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  cardChevron: { fontSize: 22, color: colors.textSecondary, fontWeight: typography.fontWeight.bold },
  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  modalContent: { padding: spacing.base, paddingBottom: verticalSpacing.xxl },
  optionsList: { gap: verticalSpacing.sm },
  optionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, borderWidth: 2, borderColor: colors.border, gap: spacing.sm },
  optionItemSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  checkbox: { borderRadius: 4 },
  checkboxInner: { width: 12, height: 12, borderRadius: 2, backgroundColor: colors.primary },
  optionText: { flex: 1, fontSize: typography.fontSize.base, color: colors.text, fontWeight: typography.fontWeight.medium },
  optionTextSelected: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
  optionCheck: { fontSize: typography.fontSize.lg, color: colors.primary, fontWeight: typography.fontWeight.bold },
  doneWrap: { marginTop: verticalSpacing.lg },
});

export default MultiSelectWithSubOptions;
