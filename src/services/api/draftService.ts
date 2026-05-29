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
import { httpGet, httpPost } from './httpClient';
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
   * Load draft from Redis (on inspection start)
   * Returns null if no draft exists or on error
   */
  async loadDraft(appointmentId: string): Promise<DraftPayload | null> {
    try {
      console.log('[DraftService] 📥 Loading draft for appointment:', appointmentId);
      
      const response = await httpGet<DraftResponse>(ENDPOINTS.DRAFT_LOAD(appointmentId));
      
      if (response.success && response.data) {
        console.log('[DraftService] ✅ Draft loaded successfully');
        
        // Backend returns data directly, not nested in formData
        // Extract the actual form data (exclude metadata like savedAt, ttlSeconds, etc.)
        const { appointmentId: apptId, savedAt, ttlSeconds, ttlDays, additionalImages, ...formData } = response.data as any;
        
        console.log('[DraftService] 📊 Draft data keys:', Object.keys(formData));
        
        // Return in the format expected by the app
        return {
          appointmentId: apptId || appointmentId,
          formData: formData as Record<string, unknown>,
          additionalImages: additionalImages || [],
        };
      } else {
        console.log('[DraftService] ℹ️ No draft found for this appointment');
        return null;
      }
    } catch (error) {
      // If draft doesn't exist or API fails, return null (start fresh)
      console.log('[DraftService] ℹ️ No draft available, starting fresh');
      return null;
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
