import { create } from 'zustand';
import type { InspectionLead, InspectionSession, InspectionFormData } from '../types';
import { InspectionStepId, InspectionStatus } from '../types';
import { createEmptySession } from '../../../services/mockData';
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
  updateFormData: (
    stepId: InspectionStepId,
    data: Partial<InspectionFormData[keyof InspectionFormData]>,
  ) => void;
  updateFormDataByKey: (
    key: keyof InspectionFormData,
    data: Partial<InspectionFormData[keyof InspectionFormData]>,
  ) => void;
  /** Dynamic step: write to any section by its catalog section key string */
  updateFormDataBySection: (sectionKey: string, data: Record<string, unknown>) => void;
  markStepComplete: (stepId: InspectionStepId) => void;
  /** Dynamic step: mark complete by catalog section key string */
  markStepCompleteByKey: (sectionKey: string) => void;
  markStepIncomplete: (stepId: InspectionStepId) => void;
  submitInspection: () => void;
  resetInspection: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type InspectionStore = InspectionState & InspectionActions;

const getStepKey = (stepId: InspectionStepId): keyof InspectionFormData => {
  const map: Record<InspectionStepId, keyof InspectionFormData> = {
    [InspectionStepId.BasicVerification]: 'vehicle',          // Step 1
    [InspectionStepId.Exterior]: 'airConditioning',           // Step 2 (AC)
    [InspectionStepId.Interior]: 'steeringBrakes',            // Step 3
    [InspectionStepId.Engine]: 'engineTransmission',          // Step 4
    [InspectionStepId.Documents]: 'electricalsInteriors',     // Step 5
    [InspectionStepId.Media]: 'exterior',                     // Step 6
  };
  return map[stepId];
};

export const useInspectionStore = create<InspectionStore>((set) => ({
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
    try {
      const { draftService } = await import('../../../services/api/draftService');
      const draft = await draftService.loadDraft(lead.appointmentId);
      
      if (draft && draft.formData) {
        console.log('[InspectionStore] 📥 Draft found! Pre-filling form data...');
        console.log('[InspectionStore] ℹ️ Draft is already in nested format - no transformation needed');
        
        // Draft data is already in nested format - use directly
        set((state) => {
          if (!state.currentSession) return state;
          
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
  },

  updateFormData: (stepId, data) => {
    console.log(`[InspectionStore] 📝 Updating form data for step: ${stepId}`, data);
    set((state) => {
      if (!state.currentSession) return state;
      const key = getStepKey(stepId);
      // Each entry in `data` is { relativePath: value } — write it nested into the section
      let section = (state.currentSession.formData[key] as Record<string, unknown>) ?? {};
      for (const [path, value] of Object.entries(data as Record<string, unknown>)) {
        section = setByPath(section, path, value);
      }
      const updatedSession = {
        ...state.currentSession,
        formData: { ...state.currentSession.formData, [key]: section },
      };
      console.log(`[InspectionStore] ✅ Updated session for ${key}:`, updatedSession.formData[key]);
      return { currentSession: updatedSession };
    });
  },

  updateFormDataByKey: (key, data) => {
    console.log(`[InspectionStore] 📝 Updating form data by key: ${key}`, data);
    set((state) => {
      if (!state.currentSession) return state;
      let section = (state.currentSession.formData[key] as Record<string, unknown>) ?? {};
      for (const [path, value] of Object.entries(data as Record<string, unknown>)) {
        section = setByPath(section, path, value);
      }
      const updatedSession = {
        ...state.currentSession,
        formData: { ...state.currentSession.formData, [key]: section },
      };
      console.log(`[InspectionStore] ✅ Updated session for ${key}:`, updatedSession.formData[key]);
      return { currentSession: updatedSession };
    });
  },

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

  markStepComplete: (stepId) => {
    console.log(`[InspectionStore] ✅ Marking step complete: ${stepId}`);
    set((state) => {
      if (!state.currentSession) return state;
      const updatedSession = {
        ...state.currentSession,
        steps: state.currentSession.steps.map((step) =>
          step.id === stepId ? { ...step, isCompleted: true } : step,
        ),
      };
      const completedCount = updatedSession.steps.filter(s => s.isCompleted).length;
      console.log(`[InspectionStore] 📊 Progress: ${completedCount}/${updatedSession.steps.length} steps completed`);
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

  markStepIncomplete: (stepId) =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          steps: state.currentSession.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: false } : step,
          ),
        },
      };
    }),

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

  resetInspection: () =>
    set({ currentLead: null, currentSession: null, error: null }),

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
