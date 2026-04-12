import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { YesNoNA } from '../types';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

interface YesNoSelectorProps {
  label: string;
  value: YesNoNA | undefined;
  onChange: (val: YesNoNA) => void;
  includeNA?: boolean;
  isRequired?: boolean;
}

const OPTIONS_BASE: { label: string; value: YesNoNA }[] = [
  { label: 'Yes', value: YesNoNA.Yes },
  { label: 'No', value: YesNoNA.No },
];
const OPTIONS_WITH_NA: { label: string; value: YesNoNA }[] = [
  ...OPTIONS_BASE,
  { label: 'N/A', value: YesNoNA.NA },
];

const YesNoSelector: React.FC<YesNoSelectorProps> = ({
  label,
  value,
  onChange,
  includeNA = false,
  isRequired = false,
}) => {
  const options = includeNA ? OPTIONS_WITH_NA : OPTIONS_BASE;

  const handleSelect = useCallback(
    (val: YesNoNA) => {
      onChange(val);
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.8}>
              <Text
                style={[styles.optionText, isSelected && styles.optionTextSelected]}>
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
    marginBottom: vs(20),
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: vs(10),
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    flex: 1,
    lineHeight: typography.lineHeight.md,
  },
  required: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: hs(12),
  },
  option: {
    flex: 1,
    paddingVertical: vs(12),
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
});

export default memo(YesNoSelector);
