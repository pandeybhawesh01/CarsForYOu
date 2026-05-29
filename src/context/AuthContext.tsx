/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { firebaseAuthService, type AuthUser } from '../services/auth';
import { useInspectionStore } from '../features/inspection/store/inspectionStore';
import { presignedUrlService } from '../services/api/presignedUrlService';
import { catalogCache } from '../services/cache/catalogCache';
import { offlineQueue } from '../services/offline/offlineQueue';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Listen to Firebase auth state changes
   * This ensures session persistence across app restarts
   */
  useEffect(() => {
    // Safety timeout: if Firebase doesn't respond in 5 seconds, show login screen anyway
    const timeout = setTimeout(() => {
      console.warn('[AuthContext] Firebase auth initialization timeout - showing login screen');
      setLoading(false);
    }, 5000);

    const unsubscribe = firebaseAuthService.onAuthStateChanged((authUser) => {
      clearTimeout(timeout); // Cancel timeout if Firebase responds
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  /**
   * Sign in with Google
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authUser = await firebaseAuthService.loginWithGoogle();
      setUser(authUser);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
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

      // Wipe per-user state BEFORE firebase signOut so that any auth state
      // listener that fires sees a clean slate.
      try { useInspectionStore.getState().resetInspection(); } catch (e) { console.warn('[AuthContext] resetInspection failed', e); }
      try { presignedUrlService.clearAll(); } catch (e) { console.warn('[AuthContext] presignedUrlService.clearAll failed', e); }
      try { await catalogCache.clear(); } catch (e) { console.warn('[AuthContext] catalogCache.clear failed', e); }
      try { await offlineQueue.clear(); } catch (e) { console.warn('[AuthContext] offlineQueue.clear failed', e); }

      await firebaseAuthService.logout();
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

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
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
