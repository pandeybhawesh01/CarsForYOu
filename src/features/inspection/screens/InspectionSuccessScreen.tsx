import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import { useInspectionStore } from '../store/inspectionStore';
import AppButton from '../../../components/AppButton';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs, hs } from '../../../utils/scaling';

type Props = InspectionStackScreenProps<'InspectionSuccess'>;

const InspectionSuccessScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLead, currentSession, resetInspection } = useInspectionStore();

  const handleBackToDashboard = useCallback(() => {
    resetInspection();
    // @ts-ignore – cross-navigator navigation
    navigation.navigate('MainTabs', { screen: 'Dashboard' });
  }, [navigation, resetInspection]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Success Animation Placeholder */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Inspection Submitted!</Text>
        <Text style={styles.subtitle}>
          The inspection has been successfully completed and submitted to the system.
        </Text>

        {/* Car Info */}
        <View style={styles.carCard}>
          <Text style={styles.carIcon}>🚗</Text>
          <View style={styles.carDetails}>
            <Text style={styles.carName}>
              {currentLead?.car.year} {currentLead?.car.make} {currentLead?.car.model}
            </Text>
            <Text style={styles.carReg}>{currentLead?.car.registrationNumber}</Text>
            <Text style={styles.apptId}>Appt: {currentSession?.appointmentId}</Text>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextSection}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          {[
            { icon: '📋', text: 'The inspection report will be reviewed by QC team.' },
            { icon: '📤', text: 'Car details will be verified and approved.' },
            { icon: '🏷️', text: 'If approved, the car will be listed for sale on the platform.' },
            { icon: '📱', text: 'The seller will be notified via SMS and the app.' },
          ].map((item, i) => (
            <View key={i} style={styles.nextItem}>
              <Text style={styles.nextIcon}>{item.icon}</Text>
              <Text style={styles.nextText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <AppButton
          label="Back to Dashboard"
          onPress={handleBackToDashboard}
          testID="back-dashboard-btn"
        />

      </ScrollView>
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
    alignItems: 'center',
    paddingTop: vs(48),
    paddingBottom: vs(40),
  },
  successCircle: {
    width: hs(100),
    height: hs(100),
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(24),
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  checkmark: {
    fontSize: vs(48),
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: vs(12),
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.md,
    marginBottom: vs(28),
    paddingHorizontal: spacing.base,
  },
  carCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: vs(28),
    borderWidth: 1,
    borderColor: colors.border,
  },
  carIcon: {
    fontSize: vs(36),
    marginRight: spacing.md,
  },
  carDetails: {
    flex: 1,
  },
  carName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  carReg: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: vs(2),
  },
  apptId: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: vs(2),
  },
  nextSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    width: '100%',
    marginBottom: vs(28),
  },
  nextTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(16),
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(12),
  },
  nextIcon: {
    fontSize: vs(18),
    marginRight: spacing.sm,
  },
  nextText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: typography.lineHeight.base,
  },
});

export default InspectionSuccessScreen;
