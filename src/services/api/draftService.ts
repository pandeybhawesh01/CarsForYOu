/**
 * Draft Service — Auto-save inspection drafts to Redis
 * 
 * Features:
 * - Auto-save every 10 seconds
 * - Load draft on inspection start
 * - Background sync (non-blocking)
 * - Error handling and retry logic
 */

import { ENDPOINTS } from './endpoints';
import { httpGet, httpPost, ApiError } from './httpClient';
import { offlineQueue } from '../offline/offlineQueue';

export interface DraftPayload {
  appointmentId: string;
  formData: Record<string, unknown>;
  additionalImages?: unknown[];
}

export interface DraftResponse {
  success: boolean;
  message?: string;
  data?: DraftPayload;
}

/**
 * Result of a draft load attempt.
 *
 * The distinction is critical (fixes the empty-overwrite data-loss bug):
 *   - 'loaded' : a real draft was found — prefill it
 *   - 'empty'  : server replied OK but there is genuinely no draft — safe to start fresh AND safe to auto-save
 *   - 'failed' : network / server / Redis error — we DON'T know what's stored,
 *                so the caller must NOT auto-save (an empty save would wipe real data)
 */
export type DraftLoadResult =
  | { status: 'loaded'; payload: DraftPayload }
  | { status: 'empty' }
  | { status: 'failed' };

export const draftService = {
  /**
   * Save draft to Redis (auto-save).
   *
   * H-22: on failure (network or non-2xx), the payload is enqueued in the
   * offline queue so it gets retried when the app foregrounds. The function
   * still returns false on the immediate attempt so the caller can update UI.
   */
  async saveDraft(payload: DraftPayload): Promise<boolean> {
    try {
      const response = await httpPost<DraftResponse>(ENDPOINTS.DRAFT_SAVE, payload);
      if (response.success) return true;

      // Server replied but with success: false — enqueue for retry.
      void offlineQueue.enqueue({ kind: 'draftSave', payload });
      return false;
    } catch (error) {
      // Network/timeout — enqueue for retry.
      console.warn('[DraftService] saveDraft failed, enqueuing for retry:', error);
      void offlineQueue.enqueue({ kind: 'draftSave', payload });
      return false;
    }
  },

  /**
   * Load draft from Redis (on inspection start).
   *
   * Returns a discriminated result so the caller can tell apart
   * "no draft exists" (safe to start fresh) from "load failed"
   * (must NOT auto-save, or we'd overwrite real data with empties).
   */
  async loadDraft(appointmentId: string): Promise<DraftLoadResult> {
    try {
      console.log('[DraftService] 📥 Loading draft for appointment:', appointmentId);

      const response = await httpGet<DraftResponse>(ENDPOINTS.DRAFT_LOAD(appointmentId));

      if (response.success && response.data) {
        console.log('[DraftService] ✅ Draft loaded successfully');

        // Backend returns data directly, not nested in formData.
        // Extract the actual form data (exclude metadata like savedAt, ttlSeconds, etc.)
        const { appointmentId: apptId, savedAt, ttlSeconds, ttlDays, additionalImages, ...formData } = response.data as any;

        console.log('[DraftService] 📊 Draft data keys:', Object.keys(formData));

        return {
          status: 'loaded',
          payload: {
            appointmentId: apptId || appointmentId,
            formData: formData as Record<string, unknown>,
            additionalImages: additionalImages || [],
          },
        };
      }

      // Backend contract: "no draft" is a 200 with success:true + data:null
      // (and usually exists:false). That's a CONFIRMED empty — safe to start
      // fresh and safe to auto-save.
      console.log('[DraftService] ℹ️ No draft for this appointment (confirmed empty)');
      return { status: 'empty' };
    } catch (error) {
      // ANY thrown error — including 404, 500, timeout, network — means we do
      // NOT know what's stored in Redis. The backend returns 200 for the
      // genuine "no draft" case, so a 404 here is a real problem (bad route /
      // bad appointment id), not an empty draft. Treat everything as failed so
      // auto-save stays PAUSED and can't overwrite real data.
      console.warn('[DraftService] ⚠️ Draft load FAILED (will not auto-save until retried):', error);
      return { status: 'failed' };
    }
  },

  /**
   * Clear draft from Redis (after successful submission)
   * Optional - backend can also auto-expire drafts
   */
  async clearDraft(appointmentId: string): Promise<void> {
    try {
      // If backend has a DELETE endpoint, call it here
      // For now, just log (backend can handle expiry)
    } catch (error) {
      // Silent fail
    }
  },
};
