import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import type { MainTabParamList } from './types';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { vs } from '../utils/scaling';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple Profile placeholder for Profile tab
const ProfileScreen: React.FC = () => (
  <View style={profileStyles.container}>
    <Text style={profileStyles.icon}>👤</Text>
    <Text style={profileStyles.title}>My Profile</Text>
    <Text style={profileStyles.subtitle}>Rahul Sharma • EMP4521</Text>
  </View>
);
const profileStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 4 },
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
