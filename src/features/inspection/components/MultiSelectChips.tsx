import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../../constants/spacing';
import type { CatalogOption } from '../../../services/api/types';

interface MultiSelectChipsProps {
  label: string;
  options: CatalogOption[];
  selected: string[] | Array<{ type: string; extent?: string | string[] }>;
  onChange: (selected: string[] | Array<{ type: string; extent?: string | string[] }>) => void;
  isRequired?: boolean;
  /** If true, stores as [{type}] format instead of string[] */
  useObjectFormat?: boolean;
}

const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  label,
  options,
  selected,
  onChange,
  isRequired = false,
  useObjectFormat = false,
}) => {
  // Extract string values for display
  const selectedStrings = useObjectFormat && Array.isArray(selected) && selected.length > 0 && typeof selected[0] === 'object'
    ? (selected as Array<{ type: string }>).map((item) => item.type)
    : (selected as string[]);

  const toggle = useCallback(
    (value: string) => {
      const next = selectedStrings.includes(value)
        ? selectedStrings.filter((v) => v !== value)
        : [...selectedStrings, value];
      
      // Return in the format expected by parent
      if (useObjectFormat) {
        onChange(next.map((type) => ({ type })));
      } else {
        onChange(next);
      }
    },
    [selectedStrings, onChange, useObjectFormat],
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
          const isOn = selectedStrings.includes(val);
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
