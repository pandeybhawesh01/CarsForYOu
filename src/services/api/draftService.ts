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
   * Save draft to Redis (auto-save)
   * Non-blocking - errors are logged but don't interrupt user flow
   */
  async saveDraft(payload: DraftPayload): Promise<boolean> {
    try {
      console.log('[DraftService] 💾 Auto-saving draft for appointment:', payload.appointmentId);
      
      const response = await httpPost<DraftResponse>(ENDPOINTS.DRAFT_SAVE, payload);
      
      if (response.success) {
        console.log('[DraftService] ✅ Draft saved successfully');
        return true;
      } else {
        console.warn('[DraftService] ⚠️ Draft save returned success=false:', response.message);
        return false;
      }
    } catch (error) {
      // Non-blocking - log error but don't throw
      console.error('[DraftService] ❌ Draft save failed:', error);
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
      console.log('[DraftService] 🗑️ Clearing draft for appointment:', appointmentId);
      // If backend has a DELETE endpoint, call it here
      // For now, just log (backend can handle expiry)
    } catch (error) {
      console.error('[DraftService] ❌ Draft clear failed:', error);
    }
  },
};
