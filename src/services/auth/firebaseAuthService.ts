/**
 * Firebase Authentication Service
 * Handles Google Sign-In with Firebase Authentication
 */

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AuthUser, AuthService, FirebaseUser } from './types';

/**
 * Configure Google Sign-In
 * IMPORTANT: Replace with your actual Web Client ID from Firebase Console
 */
export const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId: '1082830632125-8hdstm7u2jcvgfato0itn34su78l1fb0.apps.googleusercontent.com',
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
      const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);

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
   * Sign out the current user
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();

      // Sign out from Firebase
      await auth().signOut();
    } catch (error: any) {
      console.error('Logout Error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get the currently signed-in user
   * @returns AuthUser | null
   */
  getCurrentUser(): AuthUser | null {
    const firebaseUser = auth().currentUser;
    return mapFirebaseUser(firebaseUser);
  }

  /**
   * Get the Firebase ID token for the current user.
   * Used as the Bearer token for authenticated backend requests.
   * @param forceRefresh - force a token refresh instead of using the cached one
   * @returns Promise<string | null> - the JWT, or null if no user is signed in
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const firebaseUser = auth().currentUser;
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
    return auth().onAuthStateChanged((firebaseUser) => {
      const authUser = mapFirebaseUser(firebaseUser);
      callback(authUser);
    });
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
