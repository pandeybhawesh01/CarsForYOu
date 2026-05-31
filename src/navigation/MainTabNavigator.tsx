import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainTabParamList } from './types';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator<MainTabParamList>();

/**
 * Main navigator.
 *
 * The bottom tab bar (Dashboard / Profile) was removed. Both screens now live
 * in a plain stack — Profile is opened by tapping the avatar on the dashboard.
 */
const MainTabs: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default MainTabs;
