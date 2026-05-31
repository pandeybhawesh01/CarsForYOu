/**
 * Firebase Authentication Service
 * Handles Google Sign-In with Firebase Authentication.
 *
 * Uses the Firebase v22 modular API (getAuth/signInWithCredential/...) to
 * avoid the deprecated namespaced API (`auth().xxx`) which logs warnings and
 * will be removed in a future major. See https://rnfirebase.io/migrating-to-v22
 */

import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AuthUser, AuthService, FirebaseUser } from './types';

/** Single auth instance bound to the default app. */
const authInstance = getAuth(getApp());

/**
 * Configure Google Sign-In
 * IMPORTANT: Replace with your actual Web Client ID from Firebase Console
 */
export const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId: '250674133325-p6p9r97t5fob2bhumhn9m0rn6fubsjra.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

/**
 * Convert Firebase user to our AuthUser type
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser | null): AuthUser | null => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

/**
 * Firebase Authentication Service Implementation
 */
class FirebaseAuthService implements AuthService {
  /**
   * Sign in with Google
   * @returns Promise<AuthUser> - Authenticated user
   * @throws Error if sign-in fails
   */
  async loginWithGoogle(): Promise<AuthUser> {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const { data } = await GoogleSignin.signIn();

      if (!data?.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Create Firebase credential with the Google ID token
      const googleCredential = GoogleAuthProvider.credential(data.idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(authInstance, googleCredential);

      const authUser = mapFirebaseUser(userCredential.user);

      if (!authUser) {
        throw new Error('Failed to get user information after sign-in');
      }

      return authUser;
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Sign-in was cancelled');
      }
      if (error.code === 'IN_PROGRESS') {
        throw new Error('Sign-in is already in progress');
      }
      if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services not available');
      }

      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign out the current user.
   * Tolerant of the "no current user" case (e.g. logout called twice, or after
   * a forced logout) — that's a no-op, not an error.
   */
  async logout(): Promise<void> {
    // Always try to sign out of Google (clears the cached Google account).
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('[FirebaseAuthService] Google sign-out failed:', error);
    }

    // Only sign out of Firebase if there's actually a signed-in user.
    if (!authInstance.currentUser) {
      return;
    }
    try {
      await firebaseSignOut(authInstance);
    } catch (error: any) {
      // No current user is not a real failure — swallow it.
      if (error?.code === 'auth/no-current-user') {
        return;
      }
      console.error('Logout Error:', error);
      throw new Error(error?.message || 'Failed to sign out');
    }
  }

  /**
   * Get the currently signed-in user
   * @returns AuthUser | null
   */
  getCurrentUser(): AuthUser | null {
    return mapFirebaseUser(authInstance.currentUser);
  }

  /**
   * Get the Firebase ID token for the current user.
   * Used to exchange for backend JWTs.
   * @param forceRefresh - force a token refresh instead of using the cached one
   * @returns Promise<string | null> - the JWT, or null if no user is signed in
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const firebaseUser = authInstance.currentUser;
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken(forceRefresh);
    } catch (error) {
      console.warn('[FirebaseAuthService] Failed to get ID token:', error);
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(authInstance, (firebaseUser: FirebaseAuthTypes.User | null) => {
      callback(mapFirebaseUser(firebaseUser));
    });
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
