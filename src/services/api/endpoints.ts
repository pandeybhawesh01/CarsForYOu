import { Platform } from 'react-native';

/**
 * API Endpoints — single source of truth for all backend URLs.
 *
 * To change the base URL or API key, edit this file only.
 * In production, replace API_KEY with a value loaded from a secure
 * environment config (e.g. react-native-config or a .env file).
 */

const DEV_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

// FORCE LOCAL DEV SERVER - Use computer's IP for physical device
export const API_BASE_URL = 'https://inspection-backend-production-cdac.up.railway.app/api/v1';

// Uncomment below to use local dev server instead:
// export const API_BASE_URL = __DEV__
//   ? DEV_API_BASE_URL
//   : 'https://inspection-backend-production-cdac.up.railway.app/api/v1';

/**
 * ⚠️  HARDCODED KEY — replace with your real key or load from env.
 * See: Cars24/src/services/api/endpoints.ts → API_KEY
 */
export const API_KEY = 'test';

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
} as const;

// Log the API configuration on module load
console.log('[API Config] 🌐 Base URL:', API_BASE_URL);
console.log('[API Config] 📋 Catalog endpoint:', ENDPOINTS.INSPECTION_CATALOG);
console.log('[API Config] 📤 Submit endpoint:', ENDPOINTS.INSPECTION_SUBMIT);
