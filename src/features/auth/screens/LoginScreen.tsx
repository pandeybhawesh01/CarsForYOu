/**
 * Login Screen
 * Google Sign-In authentication screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import AppButton from '../../../components/AppButton';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

const LoginScreen: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      clearError();
      await login();
    } catch (err: any) {
      Alert.alert(
        'Sign In Failed',
        err.message || 'Unable to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🚗</Text>
          </View>
          <Text style={styles.appName}>Auto Inspect AI</Text>
          <Text style={styles.tagline}>Dealer Inspection Platform</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to access your inspection dashboard
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <View style={styles.buttonSection}>
          <AppButton
            label={isLoading ? 'Signing in...' : 'Continue with Google'}
            onPress={handleGoogleSignIn}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            fullWidth
            testID="google-signin-button"
          />

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Firebase Authentication
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: vs(60),
  },
  logoContainer: {
    width: hs(100),
    height: hs(100),
    borderRadius: hs(50),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(20),
  },
  logoText: {
    fontSize: hs(50),
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(8),
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: vs(40),
  },
  welcomeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(8),
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: vs(20),
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  buttonSection: {
    marginTop: vs(20),
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: vs(16),
    lineHeight: typography.fontSize.xs * 1.5,
    paddingHorizontal: spacing.base,
  },
  footer: {
    paddingVertical: vs(20),
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});

export default LoginScreen;
