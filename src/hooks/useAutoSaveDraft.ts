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
  catalog: NormalisedCatalog;
  enabled: boolean; // Only auto-save when inspection is active
  saveOnUnmount?: boolean; // Save on unmount (only for home screen or app close)
}

export function useAutoSaveDraft({ session, catalog, enabled, saveOnUnmount = false }: UseAutoSaveDraftOptions) {
  const lastSavedDataRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !session) {
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
  }, [enabled, session, catalog, saveOnUnmount]);

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
