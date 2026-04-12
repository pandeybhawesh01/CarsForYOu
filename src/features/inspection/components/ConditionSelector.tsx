import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Condition } from '../types';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

interface ConditionSelectorProps {
  label: string;
  value: Condition | undefined;
  onChange: (val: Condition) => void;
  isRequired?: boolean;
}

const OPTIONS: { label: string; value: Condition; color: string }[] = [
  { label: 'Excellent', value: Condition.Excellent, color: colors.success },
  { label: 'Good', value: Condition.Good, color: colors.ratingGood },
  { label: 'Fair', value: Condition.Fair, color: colors.warning },
  { label: 'Poor', value: Condition.Poor, color: colors.error },
  { label: 'N/A', value: Condition.NA, color: colors.textTertiary },
];

const ConditionSelector: React.FC<ConditionSelectorProps> = ({
  label,
  value,
  onChange,
  isRequired = false,
}) => {
  const handleSelect = useCallback(
    (val: Condition) => onChange(val),
    [onChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.option,
                  isSelected && {
                    backgroundColor: opt.color,
                    borderColor: opt.color,
                  },
                ]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  },
  required: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: hs(8),
  },
  option: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(14),
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.white,
  },
});

export default memo(ConditionSelector);
