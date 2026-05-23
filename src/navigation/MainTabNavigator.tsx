import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import type { MainTabParamList } from './types';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { vs, hs } from '../utils/scaling';
import { spacing, borderRadius } from '../constants/spacing';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Enhanced Profile Screen with user information and logout
 */
const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

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
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.contentContainer}>
      {/* Profile Header */}
      <View style={profileStyles.header}>
        <View style={profileStyles.avatarContainer}>
          <Text style={profileStyles.avatarIcon}>
            {user?.photoURL ? '📸' : (user?.displayName?.charAt(0) || '👤')}
          </Text>
        </View>
        <Text style={profileStyles.userName}>{user?.displayName || 'Guest User'}</Text>
        <Text style={profileStyles.userEmail}>{user?.email || 'Not available'}</Text>
      </View>

      {/* User Information Card */}
      {user && (
        <View style={profileStyles.infoCard}>
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>User ID</Text>
            <Text style={profileStyles.infoValue}>{user.uid.substring(0, 20)}...</Text>
          </View>
          <View style={[profileStyles.infoRow, profileStyles.infoBorder]}>
            <Text style={profileStyles.infoLabel}>Email</Text>
            <Text style={profileStyles.infoValue}>{user.email || 'Not set'}</Text>
          </View>
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Account Status</Text>
            <Text style={[profileStyles.infoValue, profileStyles.activeStatus]}>Active</Text>
          </View>
        </View>
      )}

      {/* Account Section */}
      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>Account Settings</Text>
        <View style={profileStyles.settingsCard}>
          <TouchableOpacity style={profileStyles.settingItem} disabled>
            <Text style={profileStyles.settingLabel}>📱 App Version</Text>
            <Text style={profileStyles.settingValue}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={profileStyles.buttonContainer}>
        <TouchableOpacity
          style={profileStyles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={profileStyles.logoutButtonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={profileStyles.footer}>
        <Text style={profileStyles.footerText}>Firebase Auth Enabled</Text>
        <Text style={profileStyles.footerSubtext}>Secure authentication with Google</Text>
      </View>
    </ScrollView>
  );
};

const profileStyles = StyleSheet.create({
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

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={tabStyles.container}>
    <Text style={tabStyles.emoji}>{emoji}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);
const tabStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  emoji: { fontSize: vs(20) },
  label: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginTop: vs(2) },
  labelActive: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
});

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: vs(4),
          height: vs(60),
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Dashboard" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
