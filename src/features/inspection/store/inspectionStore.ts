import { create } from 'zustand';
import type { InspectionLead, InspectionSession } from '../types';
import { InspectionStatus } from '../types';
import { createEmptySession } from '../../../services/mockData';
import { draftService } from '../../../services/api/draftService';
import { presignedUrlService } from '../../../services/api/presignedUrlService';
import { setByPath } from '../utils/nestedFormData';

interface InspectionState {
  currentLead: InspectionLead | null;
  currentSession: InspectionSession | null;
  isLoading: boolean;
  error: string | null;
}

interface InspectionActions {
  setCurrentLead: (lead: InspectionLead, catalogSections: Array<{ section: string; label: string }>) => void;
  startInspection: (lead: InspectionLead, catalogSections: Array<{ section: string; label: string }>) => Promise<void>;
  /** Dynamic step: write to any section by its catalog section key string */
  updateFormDataBySection: (sectionKey: string, data: Record<string, unknown>) => void;
  /** Dynamic step: mark complete by catalog section key string */
  markStepCompleteByKey: (sectionKey: string) => void;
  submitInspection: () => void;
  resetInspection: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type InspectionStore = InspectionState & InspectionActions;

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  currentLead: null,
  currentSession: null,
  isLoading: false,
  error: null,

  // Set lead without loading draft (called from dashboard card click)
  setCurrentLead: (lead, catalogSections) => {
    console.log('[InspectionStore] 📋 Setting current lead:', lead.appointmentId);
    set({
      currentLead: lead,
      currentSession: createEmptySession(lead, catalogSections),
      error: null,
    });
  },

  // Start inspection with draft loading (called from "Start Inspection" button)
  startInspection: async (lead, catalogSections) => {
    console.log('[InspectionStore] 🚀 Starting inspection for lead:', lead.appointmentId);
    
    // Create empty session with dynamic sections if provided
    const emptySession = createEmptySession(lead, catalogSections);
    
    set({
      currentLead: lead,
      currentSession: emptySession,
      error: null,
      isLoading: true,
    });
    
    // Try to load draft from Redis (non-blocking)
    void (async () => {
      try {
        const draft = await draftService.loadDraft(lead.appointmentId);

        if (draft && draft.formData) {
          console.log('[InspectionStore] 📥 Draft found! Pre-filling form data...');
          console.log('[InspectionStore] ℹ️ Draft is already in nested format - no transformation needed');

          // Draft data is already in nested format - use directly
          set((state) => {
            const current = get().currentLead;
            if (!state.currentSession || !current || current.appointmentId !== lead.appointmentId) {
              return { isLoading: false };
            }

            return {
              currentSession: {
                ...state.currentSession,
                formData: {
                  ...state.currentSession.formData,
                  ...draft.formData,
                },
              },
              isLoading: false,
            };
          });

          console.log('[InspectionStore] ✅ Draft loaded and applied');
        } else {
          console.log('[InspectionStore] ℹ️ No draft found, starting fresh');
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('[InspectionStore] ❌ Failed to load draft:', error);
        // Continue with empty session
        set({ isLoading: false });
      }
    })();
  },

  // C-7 / M-7: removed `updateFormData`, `updateFormDataByKey`,
  // `markStepComplete`, `markStepIncomplete`. These used the legacy
  // `InspectionStepId` enum to address sections, but step IDs are now
  // arbitrary catalog keys (strings). The old actions silently did nothing
  // because the enum-based comparisons never matched.

  updateFormDataBySection: (sectionKey, data) => {
    console.log(`[InspectionStore] 📝 Updating form data for section: ${sectionKey}`, data);
    set((state) => {
      if (!state.currentSession) return state;
      const existing = (state.currentSession.formData as Record<string, unknown>)[sectionKey];
      let section = (existing && typeof existing === 'object' && !Array.isArray(existing))
        ? (existing as Record<string, unknown>)
        : {};
      for (const [path, value] of Object.entries(data)) {
        section = setByPath(section, path, value);
      }
      const updatedSession = {
        ...state.currentSession,
        formData: { ...state.currentSession.formData, [sectionKey]: section },
      };
      console.log(`[InspectionStore] ✅ Updated section "${sectionKey}":`, section);
      return { currentSession: updatedSession };
    });
  },

  markStepCompleteByKey: (sectionKey) => {
    console.log(`[InspectionStore] ✅ Marking step complete by section key: ${sectionKey}`);
    set((state) => {
      if (!state.currentSession) return state;
      // Match step by sectionKey stored in step.id (dynamic steps use section key as id)
      const updatedSteps = state.currentSession.steps.map((step) =>
        (step.id as string) === sectionKey ? { ...step, isCompleted: true } : step,
      );
      const completedCount = updatedSteps.filter(s => s.isCompleted).length;
      console.log(`[InspectionStore] 📊 Progress: ${completedCount}/${updatedSteps.length} steps completed`);
      return { currentSession: { ...state.currentSession, steps: updatedSteps } };
    });
  },

  submitInspection: () => {
    console.log('[InspectionStore] 🎉 Submitting inspection - marking as completed');
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          status: InspectionStatus.Completed,
        },
      };
    });
  },

  resetInspection: () => {
    // C-5: drop presigned URLs for the appointment that's ending so they
    // don't leak into the next inspection.
    const apptId = get().currentLead?.appointmentId;
    if (apptId) {
      presignedUrlService.clearAppointment(apptId);
    }
    set({ currentLead: null, currentSession: null, error: null });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
