import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../../navigation/types';
import { UserRole } from '../../inspection/types';
import AppButton from '../../../components/AppButton';
import AppInput from '../../../components/AppInput';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius, verticalSpacing } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

type Props = RootStackScreenProps<'Login'>;

const ROLES: { label: string; value: UserRole; icon: string; desc: string }[] = [
  { label: 'Car Jockey', value: UserRole.CJ, icon: '🔧', desc: 'Inspection Engineer' },
  { label: 'Car Owner', value: UserRole.Lead, icon: '🚗', desc: 'Sell my car' },
];

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CJ);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = useCallback(() => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setIsLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
    }, 1000);
  }, [phone]);

  const handleVerifyOtp = useCallback(() => {
    if (otp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('MainTabs');
    }, 800);
  }, [otp, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Logo / Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>C24</Text>
            </View>
            <Text style={styles.brandName}>Cars24 Inspector</Text>
            <Text style={styles.subtitle}>Professional Car Inspection Platform</Text>
          </View>

          {/* Role Selector */}
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <View style={styles.rolesRow}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                  onPress={() => setSelectedRole(role.value)}
                  activeOpacity={0.8}>
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                    {role.label}
                  </Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phone Input */}
          <View style={styles.formSection}>
            <AppInput
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Enter 10-digit number"
              isRequired
              editable={!isOtpSent}
            />

            {isOtpSent && (
              <AppInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                isRequired
                hint="Demo OTP: 1234"
              />
            )}

            {!isOtpSent ? (
              <AppButton
                label="Send OTP"
                onPress={handleSendOtp}
                isLoading={isLoading}
                testID="send-otp-btn"
              />
            ) : (
              <AppButton
                label="Verify & Login"
                onPress={handleVerifyOtp}
                isLoading={isLoading}
                testID="verify-otp-btn"
              />
            )}

            {isOtpSent && (
              <TouchableOpacity
                style={styles.resendRow}
                onPress={() => setIsOtpSent(false)}>
                <Text style={styles.resendText}>Change Number</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.base,
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: vs(40),
  },
  logoContainer: {
    width: hs(80),
    height: hs(80),
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
  },
  logoText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.white,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
    marginBottom: vs(4),
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(12),
  },
  rolesRow: {
    flexDirection: 'row',
    gap: hs(12),
    marginBottom: vs(28),
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleIcon: {
    fontSize: vs(28),
    marginBottom: vs(8),
  },
  roleLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(4),
  },
  roleLabelSelected: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(20),
  },
  resendRow: {
    alignItems: 'center',
    marginTop: vs(12),
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 'auto',
    paddingVertical: vs(16),
  },
});

export default LoginScreen;
