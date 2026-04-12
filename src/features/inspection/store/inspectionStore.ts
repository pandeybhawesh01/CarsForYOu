import { create } from 'zustand';
import type { InspectionLead, InspectionSession, InspectionFormData } from '../types';
import { InspectionStepId, InspectionStatus } from '../types';
import { createEmptySession } from '../../../services/mockData';

interface InspectionState {
  currentLead: InspectionLead | null;
  currentSession: InspectionSession | null;
  isLoading: boolean;
  error: string | null;
}

interface InspectionActions {
  startInspection: (lead: InspectionLead) => void;
  updateFormData: (
    stepId: InspectionStepId,
    data: Partial<InspectionFormData[keyof InspectionFormData]>,
  ) => void;
  markStepComplete: (stepId: InspectionStepId) => void;
  markStepIncomplete: (stepId: InspectionStepId) => void;
  submitInspection: () => void;
  resetInspection: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type InspectionStore = InspectionState & InspectionActions;

const getStepKey = (stepId: InspectionStepId): keyof InspectionFormData => {
  const map: Record<InspectionStepId, keyof InspectionFormData> = {
    [InspectionStepId.BasicVerification]: 'basicVerification',
    [InspectionStepId.Exterior]: 'exterior',
    [InspectionStepId.Interior]: 'interior',
    [InspectionStepId.Engine]: 'engine',
    [InspectionStepId.Documents]: 'documents',
    [InspectionStepId.Media]: 'media',
  };
  return map[stepId];
};

export const useInspectionStore = create<InspectionStore>((set) => ({
  currentLead: null,
  currentSession: null,
  isLoading: false,
  error: null,

  startInspection: (lead) =>
    set({
      currentLead: lead,
      currentSession: createEmptySession(lead),
      error: null,
    }),

  updateFormData: (stepId, data) =>
    set((state) => {
      if (!state.currentSession) return state;
      const key = getStepKey(stepId);
      return {
        currentSession: {
          ...state.currentSession,
          formData: {
            ...state.currentSession.formData,
            [key]: {
              ...(state.currentSession.formData[key] as object),
              ...data,
            },
          },
        },
      };
    }),

  markStepComplete: (stepId) =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          steps: state.currentSession.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: true } : step,
          ),
        },
      };
    }),

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

  submitInspection: () =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          status: InspectionStatus.Completed,
        },
      };
    }),

  resetInspection: () =>
    set({ currentLead: null, currentSession: null, error: null }),

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
