import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  InspectionNavigator: { inspectionId: string };
};

// Bottom Tabs
export type MainTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

// Inspection Stack
export type InspectionStackParamList = {
  LeadDetails: { inspectionId: string };
  InspectionHome: { inspectionId: string };
  InspectionStep: { inspectionId: string; stepIndex: number };
  ReviewSubmit: { inspectionId: string };
  InspectionSuccess: { inspectionId: string };
};

// Screen Props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type InspectionStackScreenProps<T extends keyof InspectionStackParamList> =
  NativeStackScreenProps<InspectionStackParamList, T>;

// Global declaration for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
