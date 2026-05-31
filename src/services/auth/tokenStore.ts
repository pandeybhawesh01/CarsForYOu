/**
 * Token Store — holds the backend-issued JWTs.
 *
 * Security model:
 *  - ACCESS token  → kept in memory only (a module variable). It's short-lived
 *    and dies when the app process is killed, which limits the blast radius of
 *    a leak. Never written to disk.
 *  - REFRESH token → stored in the device Keychain / Android Keystore via
 *    `react-native-keychain`, which is hardware-encrypted. Survives app
 *    restarts so the session can be silently restored, but can't be read by
 *    other apps or extracted from a non-rooted device.
 */

import * as Keychain from 'react-native-keychain';

const REFRESH_SERVICE = 'in.carswipe.autoinspectai.refreshToken';
const REFRESH_USERNAME = 'autoinspectai';

/**
 * Guard: the native keychain module is null until the app is rebuilt with the
 * dependency linked. Without this check, calls throw
 * "Cannot read property 'resetGenericPasswordForOptions' of null".
 * If unavailable, refresh-token persistence is skipped (session won't survive
 * an app restart until a native rebuild is done) but the app won't crash.
 */
function keychainAvailable(): boolean {
  const ok = typeof Keychain?.setGenericPassword === 'function';
  if (!ok) {
    console.warn(
      '[tokenStore] react-native-keychain native module not linked — rebuild the app (npx react-native run-android).',
    );
  }
  return ok;
}

// In-memory access token (never persisted).
let accessToken: string | null = null;

export const tokenStore = {
  // ─── Access token (memory) ────────────────────────────────────────────────

  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string | null): void {
    accessToken = token;
  },

  // ─── Refresh token (Keychain) ──────────────────────────────────────────────

  async setRefreshToken(token: string): Promise<void> {
    if (!keychainAvailable()) return;
    try {
      await Keychain.setGenericPassword(REFRESH_USERNAME, token, {
        service: REFRESH_SERVICE,
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      });
    } catch (err) {
      console.warn('[tokenStore] Failed to persist refresh token:', err);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    if (!keychainAvailable()) return null;
    try {
      const creds = await Keychain.getGenericPassword({ service: REFRESH_SERVICE });
      return creds ? creds.password : null;
    } catch (err) {
      console.warn('[tokenStore] Failed to read refresh token:', err);
      return null;
    }
  },

  // ─── Session helpers ───────────────────────────────────────────────────────

  /** Store a full session (access in memory, refresh in Keychain). */
  async setSession(session: { accessToken: string; refreshToken?: string }): Promise<void> {
    accessToken = session.accessToken;
    if (session.refreshToken) {
      await this.setRefreshToken(session.refreshToken);
    }
  },

  /** Wipe everything — used on logout and on refresh failure. */
  async clear(): Promise<void> {
    accessToken = null;
    if (!keychainAvailable()) return;
    try {
      await Keychain.resetGenericPassword({ service: REFRESH_SERVICE });
    } catch (err) {
      console.warn('[tokenStore] Failed to clear refresh token:', err);
    }
  },
};
