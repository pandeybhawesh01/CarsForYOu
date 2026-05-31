/**
 * Auto-save Draft Hook
 * 
 * Automatically saves inspection draft to Redis every 10 seconds
 * Production-ready with:
 * - Debouncing (only save if data changed)
 * - Background sync (non-blocking)
 * - Save on unmount ONLY when leaving inspection flow (home screen or app close)
 * - Error handling
 */

import { useEffect, useRef } from 'react';
import { draftService } from '../services/api/draftService';
import type { InspectionSession } from '../features/inspection/types';
import { buildFinalInspectionPayload } from '../features/inspection/utils/buildFinalInspectionPayload';
import type { NormalisedCatalog } from '../services/api/types';

const AUTO_SAVE_INTERVAL_MS = 10 * 1000; // 10 seconds

interface UseAutoSaveDraftOptions {
  session: InspectionSession | null;
  catalog: NormalisedCatalog;        // never null — use selectCatalog at call site (C-4)
  enabled: boolean;
  saveOnUnmount?: boolean;
  /**
   * Gate: only auto-save once we KNOW the server state.
   * 'loaded'/'empty' → safe to save. 'failed'/'loading'/'idle' → DO NOT save,
   * otherwise an empty local form would overwrite a real draft in Redis.
   */
  draftStatus: 'idle' | 'loading' | 'loaded' | 'empty' | 'failed';
}

export function useAutoSaveDraft({ session, catalog, enabled, saveOnUnmount = false, draftStatus }: UseAutoSaveDraftOptions) {
  const lastSavedDataRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save is only safe when we have confirmed the server state.
  const canAutoSave = draftStatus === 'loaded' || draftStatus === 'empty';

  useEffect(() => {
    // Skip if disabled, no session, catalog not loaded, OR the draft load
    // hasn't succeeded yet. The last condition is the data-loss guard: if the
    // draft failed to load we must NOT save, or the empty local form would
    // overwrite whatever is really stored in Redis.
    if (!enabled || !session || catalog.sections.length === 0 || !canAutoSave) {
      // Clear interval if disabled or no session
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Auto-save function
    const autoSave = async () => {
      try {
        // Build payload (same as final submit - transformed format)
        const payload = buildFinalInspectionPayload(session, catalog);
        
        // Convert to string for comparison
        const currentData = JSON.stringify(payload.formData);
        
        // Only save if data changed (debouncing)
        if (currentData === lastSavedDataRef.current) {
          return;
        }
        
        // Save to Redis (transformed format - same as final submit)
        const success = await draftService.saveDraft({
          appointmentId: session.appointmentId,
          formData: payload.formData as Record<string, unknown>,
          additionalImages: [],
        });
        
        if (success) {
          lastSavedDataRef.current = currentData;
        }
      } catch (error) {
        // Don't throw - auto-save is non-critical
      }
    };

    // Initial save after 2 seconds (give user time to start filling)
    const initialTimeout = setTimeout(() => {
      autoSave();
    }, 2000);

    // Set up interval for periodic saves (every 10 seconds)
    intervalRef.current = setInterval(autoSave, AUTO_SAVE_INTERVAL_MS);

    // Cleanup on unmount or when disabled
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Only save on unmount if explicitly enabled (home screen or app close)
      if (saveOnUnmount) {
        autoSave().catch(() => {
          // Silent fail
        });
      }
    };
  }, [enabled, session, catalog, saveOnUnmount, canAutoSave]);

  // Manual save function (can be called on important events)
  const saveNow = async () => {
    if (!session) return;
    
    try {
      // Save RAW formData (not transformed payload)
      await draftService.saveDraft({
        appointmentId: session.appointmentId,
        formData: session.formData as Record<string, unknown>, // Save raw formData
        additionalImages: [],
      });
      
      lastSavedDataRef.current = JSON.stringify(session.formData);
    } catch (error) {
      // Silent fail
    }
  };

  return { saveNow };
}
