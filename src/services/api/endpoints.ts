/**
 * API Endpoints — single source of truth for all backend URL paths.
 *
 * Base URL and API key live in `appConfig.ts` (C-9 — sourced from env vars
 * with explicit fallbacks). Editing this file is for adding new endpoints,
 * not for rotating credentials.
 */

import { API_BASE_URL, API_KEY } from './appConfig';

// Re-export for backwards compatibility with existing imports.
export { API_BASE_URL, API_KEY };

export const ENDPOINTS = {
  /** Inspection form catalog (all dropdown / multi-select options). */
  INSPECTION_CATALOG: `${API_BASE_URL}/forms/inspection-report/catalog`,
  /** Final inspection report submit. */
  INSPECTION_SUBMIT: `${API_BASE_URL}/forms/inspection-report/submit`,
  /** Draft auto-save (Redis). */
  DRAFT_SAVE: `${API_BASE_URL}/forms/inspection-report/draft/submit`,
  /** Draft load (Redis). */
  DRAFT_LOAD: (appointmentId: string) => `${API_BASE_URL}/forms/inspection-report/draft/${appointmentId}`,
  /** Presigned URL for S3 upload. */
  PRESIGNED_UPLOAD: `${API_BASE_URL}/media/presign-upload`,
  /**
   * Appointments assigned to the authenticated CJ (the leads listing).
   * Uses `cj/me` — the backend resolves the CJ from the bearer token, so no
   * static CJ id is needed.
   */
  ASSIGNED_APPOINTMENTS: `${API_BASE_URL}/appointments/cj/me/assigned`,
  /** Employee auth — exchange a Firebase ID token for backend JWTs. */
  AUTH_LOGIN: `${API_BASE_URL}/auth/cj/login`,
  /** Employee auth — get a new access token from a refresh token. */
  AUTH_REFRESH: `${API_BASE_URL}/auth/cj/refresh`,
  /** Employee auth — revoke the refresh token (logout). */
  AUTH_LOGOUT: `${API_BASE_URL}/auth/cj/logout`,
} as const;

if (__DEV__) {
  console.log('[API Config] 🌐 Base URL:', API_BASE_URL);
  console.log('[API Config] 📋 Catalog endpoint:', ENDPOINTS.INSPECTION_CATALOG);
  console.log('[API Config] 📤 Submit endpoint:', ENDPOINTS.INSPECTION_SUBMIT);
}
