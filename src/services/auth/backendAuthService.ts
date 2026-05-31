/**
 * Backend Auth Service — exchanges the Firebase ID token for our own
 * backend-issued JWTs (access + refresh) and manages the refresh lifecycle.
 *
 * Flow:
 *   1. Google Sign-In (Firebase) → Firebase ID token
 *   2. POST /auth/emp/login { firebaseIdToken } → { accessToken, refreshToken }
 *   3. access token kept in memory, refresh token in Keychain (tokenStore)
 *   4. on access expiry → POST /auth/emp/refresh { refreshToken } → new access
 *   5. logout → POST /auth/emp/logout { refreshToken } + clear storage
 *
 * Auth requests skip the bearer header (`skipAuth: true`): login has no token
 * yet, and refresh/logout authenticate with the refresh token in the body.
 */

import { ENDPOINTS } from '../api/endpoints';
import { httpPost } from '../api/httpClient';
import { tokenStore } from './tokenStore';
import { employeeProfileStore, extractEmployeeProfile } from './employeeProfileStore';

interface AuthTokensResponse {
  // Tolerant to a few common field-name shapes from the backend.
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expiresIn?: number;
  success?: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

function extractTokens(res: AuthTokensResponse): { accessToken: string; refreshToken?: string } {
  const access =
    res.accessToken ?? res.access_token ?? res.token ?? res.data?.accessToken;
  const refresh = res.refreshToken ?? res.refresh_token ?? res.data?.refreshToken;

  if (!access) {
    throw new Error(res.message ?? 'Auth response did not contain an access token');
  }
  return { accessToken: access, refreshToken: refresh };
}

export const backendAuthService = {
  /**
   * Exchange a Firebase ID token for backend JWTs and persist the session.
   * Also captures the employee profile (name, employeeCode, ...) from the
   * response for display on the home / profile screens.
   */
  async login(firebaseIdToken: string): Promise<void> {
    const res = await httpPost<AuthTokensResponse & Record<string, unknown>>(
      ENDPOINTS.AUTH_LOGIN,
      { firebaseIdToken },
      { skipAuth: true },
    );
    
    console.log('[backendAuthService] Login response:', res);
    
    const tokens = extractTokens(res);
    await tokenStore.setSession(tokens);

    // Persist the employee profile if the login returned one.
    const profile = extractEmployeeProfile(res);
    console.log('[backendAuthService] Extracted profile:', profile);
    
    if (profile) {
      await employeeProfileStore.set(profile);
      console.log('[backendAuthService] Profile saved to storage');
    } else {
      console.warn('[backendAuthService] No profile extracted from login response');
    }
  },

  /**
   * Use the stored refresh token to get a new access token.
   * Returns the new access token, or null if refresh isn't possible
   * (no refresh token, or the backend rejected it).
   */
  async refresh(): Promise<string | null> {
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await httpPost<AuthTokensResponse>(
        ENDPOINTS.AUTH_REFRESH,
        { refreshToken },
        { skipAuth: true },
      );
      const tokens = extractTokens(res);
      await tokenStore.setSession(tokens);
      return tokens.accessToken;
    } catch (err) {
      console.warn('[backendAuthService] refresh failed:', err);
      return null;
    }
  },

  /**
   * Revoke the refresh token server-side and clear local storage.
   * Always clears local tokens even if the network call fails.
   */
  async logout(): Promise<void> {
    const refreshToken = await tokenStore.getRefreshToken();
    if (refreshToken) {
      try {
        await httpPost(ENDPOINTS.AUTH_LOGOUT, { refreshToken }, { skipAuth: true });
      } catch (err) {
        console.warn('[backendAuthService] logout API failed (clearing locally anyway):', err);
      }
    }
    await tokenStore.clear();
  },

  /** True if there's a refresh token on the device (session can be restored). */
  async hasSession(): Promise<boolean> {
    return (await tokenStore.getRefreshToken()) !== null;
  },
};
