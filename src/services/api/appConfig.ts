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

import { Platform } from 'react-native';

declare const process: { env: Record<string, string | undefined> };

// Read with safe fallback (process may not exist in some RN runtimes)
function readEnv(key: string, fallback: string): string {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
  } catch {
    return fallback;
  }
}

const DEV_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

const PROD_API_BASE_URL = 'https://inspection-backend-production-cdac.up.railway.app/api/v1';

/**
 * API base URL.
 * In __DEV__ tries to use the local dev server; in prod uses Railway.
 * Override via `API_BASE_URL` env var if present.
 */
export const API_BASE_URL: string = readEnv(
  'API_BASE_URL',
  __DEV__ ? PROD_API_BASE_URL : PROD_API_BASE_URL,
  // Note: switched dev default to PROD_API_BASE_URL to match the previous
  // hardcoded behaviour. Change to DEV_API_BASE_URL once a local server is set up.
);

// Suppress unused-warning while keeping the helper import correct
void DEV_API_BASE_URL;

/**
 * API key.
 * Override via `API_KEY` env var. The fallback is a placeholder used only
 * for local development — never deploy with this value.
 */
export const API_KEY: string = readEnv('API_KEY', 'test');
