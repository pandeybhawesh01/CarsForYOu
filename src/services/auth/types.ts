/**
 * Authentication Service Types
 * Type definitions for Firebase authentication
 */

import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthService {
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  getCurrentUser: () => AuthUser | null;
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => () => void;
}

export type FirebaseUser = FirebaseAuthTypes.User;
