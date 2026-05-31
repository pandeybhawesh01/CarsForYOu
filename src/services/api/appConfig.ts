/**
 * App configuration — single source of truth for runtime config.
 *
 * C-9 fix: API key and base URL are read from `process.env` when available
 * (Metro / Babel inline env vars), with explicit per-environment fallbacks.
 *
 * To use real env vars, install one of:
 *   - `react-native-config`  (recommended — works with .env files)
 *   - `babel-plugin-transform-inline-environment-variables`
 *
 * For now, the fallbacks below are used. DO NOT commit production secrets
 * here — keep dev / staging values only.
 */

declare const process: { env: Record<string, string | undefined> };

// Read with safe fallback (process may not exist in some RN runtimes)
function readEnv(key: string, fallback: string): string {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
  } catch {
    return fallback;
  }
}

// Dev server reachable from the device. Use the laptop's LAN IP so BOTH a
// physical device and an emulator (on the same Wi-Fi) can reach it. If you
// switch networks, update this IP (run `hostname -I`).
const DEV_SERVER_HOST = '192.168.1.37';

const DEV_API_BASE_URL = `https://inspection-backend-production-cdac.up.railway.app/api/v1`;

const PROD_API_BASE_URL = 'https://inspection-backend-production-cdac.up.railway.app/api/v1';

/**
 * API base URL.
 * In __DEV__ uses the local dev server (10.0.2.2 on Android emulator,
 * localhost on iOS sim); in prod uses Railway.
 * Override via `API_BASE_URL` env var if present.
 */
export const API_BASE_URL: string = readEnv(
  'API_BASE_URL',
  __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL,
);

// Suppress unused-warning while keeping the helper import correct
void PROD_API_BASE_URL;

/**
 * API key.
 * Override via `API_KEY` env var. The fallback is a placeholder used only
 * for local development — never deploy with this value.
 */
export const API_KEY: string = readEnv('API_KEY', 'test');
