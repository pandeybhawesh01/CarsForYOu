import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { InspectionStackParamList } from './types';

import LeadDetailsScreen from '../features/inspection/screens/LeadDetailsScreen';
import InspectionHomeScreen from '../features/inspection/screens/InspectionHomeScreen';
import InspectionStepScreen from '../features/inspection/screens/InspectionStepScreen';
import ReviewSubmitScreen from '../features/inspection/screens/ReviewSubmitScreen';
import InspectionSuccessScreen from '../features/inspection/screens/InspectionSuccessScreen';

const Stack = createNativeStackNavigator<InspectionStackParamList>();

const InspectionNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
      <Stack.Screen name="InspectionHome" component={InspectionHomeScreen} />
      <Stack.Screen
        name="InspectionStep"
        component={InspectionStepScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
      <Stack.Screen
        name="InspectionSuccess"
        component={InspectionSuccessScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default InspectionNavigator;
