import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { MainTabScreenProps } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import AppHeader from '../../../components/AppHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { vs, hs } from '../../../utils/scaling';
import { spacing, borderRadius } from '../../../constants/spacing';

type Props = MainTabScreenProps<'Profile'>;

/**
 * Profile Screen with user information and logout.
 * Reached by tapping the avatar on the dashboard.
 */
const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, employee, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Profile" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>
              {employee?.name?.charAt(0) || '👤'}
            </Text>
          </View>
          <Text style={styles.userName}>{employee?.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{employee?.email || 'Email not available'}</Text>
        </View>

        {/* User Information Card */}
        {user && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employee Code</Text>
              <Text style={styles.infoValue}>{employee?.employeeCode || 'N/A'}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{employee?.email || 'Not available'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <Text style={[styles.infoValue, styles.activeStatus]}>Active</Text>
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} disabled>
              <Text style={styles.settingLabel}>📱 App Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Text style={styles.logoutButtonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Firebase Auth Enabled</Text>
          <Text style={styles.footerSubtext}>Secure authentication with Google</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: vs(40),
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(40),
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    width: hs(100),
    height: hs(100),
    borderRadius: hs(50),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
  },
  avatarIcon: {
    fontSize: hs(48),
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: vs(4),
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimaryMuted,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginTop: vs(24),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: vs(16),
  },
  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semiBold,
  },
  activeStatus: {
    color: colors.success,
  },
  section: {
    marginTop: vs(32),
    marginHorizontal: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: vs(12),
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: vs(16),
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginHorizontal: spacing.base,
    marginTop: vs(32),
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: vs(14),
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: vs(40),
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  footerSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: vs(4),
  },
});

export default ProfileScreen;
