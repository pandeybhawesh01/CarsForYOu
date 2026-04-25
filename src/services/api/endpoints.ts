/**
 * API Endpoints — single source of truth for all backend URLs.
 *
 * To change the base URL or API key, edit this file only.
 * In production, replace API_KEY with a value loaded from a secure
 * environment config (e.g. react-native-config or a .env file).
 */

export const API_BASE_URL =
  'https://inspection-backend-production-cdac.up.railway.app/api/v1';

/**
 * ⚠️  HARDCODED KEY — replace with your real key or load from env.
 * See: Cars24/src/services/api/endpoints.ts → API_KEY
 */
export const API_KEY = 'test';

export const ENDPOINTS = {
  /** Inspection form catalog (all dropdown / multi-select options). */
  INSPECTION_CATALOG: `${API_BASE_URL}/forms/inspection-report/catalog`,
} as const;
