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
   * Appointments assigned to a CJ (the leads listing on the home screen).
   * `cjId` is currently static ('1') — swap to the real id once available.
   */
  ASSIGNED_APPOINTMENTS: (cjId: string | number) =>
    `${API_BASE_URL}/appointments/cj/${cjId}/assigned`,
} as const;

if (__DEV__) {
  console.log('[API Config] 🌐 Base URL:', API_BASE_URL);
  console.log('[API Config] 📋 Catalog endpoint:', ENDPOINTS.INSPECTION_CATALOG);
  console.log('[API Config] 📤 Submit endpoint:', ENDPOINTS.INSPECTION_SUBMIT);
}
