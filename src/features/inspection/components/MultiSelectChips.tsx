import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../../constants/spacing';
import type { CatalogOption } from '../../../services/api/types';

interface MultiSelectChipsProps {
  label: string;
  options: CatalogOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isRequired?: boolean;
}

const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  label,
  options,
  selected,
  onChange,
  isRequired = false,
}) => {
  const toggle = useCallback(
    (value: string) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    },
    [selected, onChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.chipsWrap}>
        {options.map((opt) => {
          const val = String(opt.value);
          const isOn = selected.includes(val);
          return (
            <TouchableOpacity
              key={val}
              style={[styles.chip, isOn && styles.chipOn]}
              onPress={() => toggle(val)}
              activeOpacity={0.75}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn }}>
              {isOn && <Text style={styles.checkmark}>✓ </Text>}
              <Text style={[styles.chipText, isOn && styles.chipTextOn]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalSpacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: verticalSpacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  required: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: verticalSpacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  checkmark: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextOn: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(MultiSelectChips);
