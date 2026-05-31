/**
 * Authentication Context
 * Provides authentication state and methods throughout the app.
 *
 * Auth model:
 *  - Google Sign-In (Firebase) authenticates the user and yields a Firebase
 *    ID token.
 *  - That token is exchanged with OUR backend (`/auth/emp/login`) for a
 *    backend access token (memory) + refresh token (Keychain).
 *  - All API calls use the backend access token. On expiry the httpClient
 *    silently refreshes; if refresh fails the user is bounced to login.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { firebaseAuthService, type AuthUser } from '../services/auth';
import { backendAuthService } from '../services/auth/backendAuthService';
import { tokenStore } from '../services/auth/tokenStore';
import { employeeProfileStore, type EmployeeProfile } from '../services/auth/employeeProfileStore';
import { setUnauthorizedHandler } from '../services/api/httpClient';
import { useInspectionStore } from '../features/inspection/store/inspectionStore';
import { presignedUrlService } from '../services/api/presignedUrlService';
import { catalogCache } from '../services/cache/catalogCache';
import { offlineQueue } from '../services/offline/offlineQueue';

interface AuthContextValue {
  user: AuthUser | null;
  employee: EmployeeProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ensure a backend session exists for the signed-in Firebase user.
   *  1. If we already have a refresh token, try to refresh the access token.
   *  2. Otherwise (or if refresh fails), exchange a fresh Firebase ID token.
   */
  const ensureBackendSession = useCallback(async (): Promise<boolean> => {
    // Already have a live access token in memory.
    if (tokenStore.getAccessToken()) return true;

    // Try restoring via the stored refresh token (survives app restarts).
    const refreshed = await backendAuthService.refresh();
    if (refreshed) return true;

    // Fall back to a fresh exchange using the Firebase ID token.
    const idToken = await firebaseAuthService.getIdToken(true);
    if (!idToken) return false;
    await backendAuthService.login(idToken);
    return true;
  }, []);

  /**
   * Force logout — used when the backend session is unrecoverable (refresh
   * failed / token revoked / couldn't establish a session). Clears AUTH state
   * and drops back to login. Does NOT call the backend logout endpoint (the
   * token is already invalid).
   *
   * Note: this intentionally does NOT wipe per-user caches (presigned URLs,
   * inspection drafts). Those are cleared only on a deliberate user logout
   * (see `logout`). A transient auth failure shouldn't destroy expensive,
   * unrelated cached data.
   */
  const forceLogout = useCallback(async () => {
    try { await tokenStore.clear(); } catch (e) { console.warn('[AuthContext] tokenStore.clear failed', e); }
    try { await employeeProfileStore.clear(); } catch (e) { console.warn('[AuthContext] employeeProfileStore.clear failed', e); }
    try { await firebaseAuthService.logout(); } catch (e) { console.warn('[AuthContext] firebase signOut failed', e); }
    setEmployee(null);
    setUser(null);
  }, []);

  /**
   * Register the unauthorized handler so the httpClient can bounce the user
   * to login when a refresh ultimately fails.
   */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      console.warn('[AuthContext] Session expired — redirecting to login');
      void forceLogout();
    });
    return () => setUnauthorizedHandler(null);
  }, [forceLogout]);

  /**
   * Listen to Firebase auth state changes.
   * Ensures session persistence across app restarts.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('[AuthContext] Firebase auth initialization timeout - showing login screen');
      setLoading(false);
    }, 5000);

    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (authUser) => {
      clearTimeout(timeout);

      if (authUser) {
        // Restore / establish the backend session before treating the user as
        // logged in, so the first API calls already carry a valid token.
        try {
          const ok = await ensureBackendSession();
          if (!ok) {
            console.warn('[AuthContext] Could not establish backend session');
            await forceLogout();
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[AuthContext] ensureBackendSession failed', e);
          await forceLogout();
          setLoading(false);
          return;
        }
      }

      setUser(authUser);

      // Load the cached employee profile (if any) for display.
      if (authUser) {
        try {
          const profile = await employeeProfileStore.get();
          setEmployee(profile);
        } catch (e) {
          console.warn('[AuthContext] load employee profile failed', e);
        }
      } else {
        setEmployee(null);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [ensureBackendSession, forceLogout]);

  /**
   * Sign in with Google, then exchange for backend tokens.
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authUser = await firebaseAuthService.loginWithGoogle();

      // Exchange the Firebase ID token for backend JWTs.
      const idToken = await firebaseAuthService.getIdToken(true);
      if (!idToken) {
        throw new Error('Could not obtain Firebase ID token');
      }
      await backendAuthService.login(idToken);

      // Load the freshly-stored employee profile for display.
      try {
        const profile = await employeeProfileStore.get();
        setEmployee(profile);
      } catch (e) {
        console.warn('[AuthContext] load employee profile failed', e);
      }

      setUser(authUser);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
      // Don't leave a half-open session around.
      try { await tokenStore.clear(); } catch {}
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out.
   *
   * M-9: Clear every per-user cache. Without this, a second user on the same
   * device would see the previous user's inspection state and catalog.
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Revoke the refresh token server-side + clear it from Keychain.
      try { await backendAuthService.logout(); } catch (e) { console.warn('[AuthContext] backend logout failed', e); }
      try { await employeeProfileStore.clear(); } catch (e) { console.warn('[AuthContext] employeeProfileStore.clear failed', e); }

      // Wipe per-user state BEFORE firebase signOut so any auth-state listener
      // that fires sees a clean slate.
      try { useInspectionStore.getState().resetInspection(); } catch (e) { console.warn('[AuthContext] resetInspection failed', e); }
      try { presignedUrlService.clearAll(); } catch (e) { console.warn('[AuthContext] presignedUrlService.clearAll failed', e); }
      try { await catalogCache.clear(); } catch (e) { console.warn('[AuthContext] catalogCache.clear failed', e); }
      try { await offlineQueue.clear(); } catch (e) { console.warn('[AuthContext] offlineQueue.clear failed', e); }

      await firebaseAuthService.logout();
      setEmployee(null);
      setUser(null);
    } catch (err: unknown) {
      console.error('Logout error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh the employee profile by re-exchanging the Firebase ID token.
   * This will fetch the latest profile data from the backend.
   */
  const refreshProfile = useCallback(async () => {
    try {
      setError(null);
      
      // Get a fresh Firebase ID token
      const idToken = await firebaseAuthService.getIdToken(true);
      if (!idToken) {
        throw new Error('Could not obtain Firebase ID token');
      }
      
      // Re-login to get fresh profile data
      await backendAuthService.login(idToken);
      
      // Load the updated profile
      const profile = await employeeProfileStore.get();
      setEmployee(profile);
      
      console.log('[AuthContext] Profile refreshed successfully');
    } catch (err: any) {
      console.error('[AuthContext] Profile refresh error:', err);
      setError(err.message || 'Failed to refresh profile');
      throw err;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    employee,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
