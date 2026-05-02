/**
 * Catalog ViewModel — MVVM layer between the service and the UI.
 *
 * Responsibilities:
 *  1. Orchestrate cache-first loading strategy.
 *  2. Expose loading / error state to the UI.
 *  3. Provide typed option accessors consumed by step screens.
 *
 * Cache strategy (stale-while-revalidate):
 *  - On init: serve cached data immediately (if available) → UI renders fast.
 *  - Simultaneously fetch fresh data in background.
 *  - If cache is empty: show loading state until first fetch completes.
 */

import { create } from 'zustand';
import { catalogService } from '../services/api/catalogService';
import { catalogCache } from '../services/cache/catalogCache';
import type { NormalisedCatalog } from '../services/api/types';

// ─── State shape ──────────────────────────────────────────────────────────────

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface CatalogState {
  catalog: NormalisedCatalog | null;
  loadingState: LoadingState;
  error: string | null;

  // Actions
  loadCatalog: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
}

// ─── Default fallbacks (used before catalog loads) ────────────────────────────

/**
 * These mirror the hardcoded values previously in inspectionSchema.ts.
 * They are used as fallbacks if the API hasn't loaded yet.
 */
const FALLBACK_CATALOG: NormalisedCatalog = {
  optionsByPath: {},
  fieldsByPath: {},
  vehicleSectionChildren: [],

  airConditioning: {
    acCompressorIssues: ['AC Compressor not working', 'Compressor noise'],
    acControlPanelIssues: ['AC Panel broken / Crack', 'AC Panel display not working'],
    acCoolingIssues: ['Inactive - 12°C to 18°C', 'Not working 18°C and above', 'Not available'],
    blowerMotorIssues: ['Blower Motor noisy', 'Blower Motor not working'],
    ventilationSystemIssues: ['Air flow weak', 'Not working', 'Odour present'],
  },

  engineTransmission: {
    batteryAlternatorIssues: ['Leak / seepage', 'Corrosion', 'Loose / damaged mount', 'Illegible / not visible'],
    blowBy2000rpmIssues: [],
    blowByIdleIssues: [],
    clutchIssues: [],
    coolantIssues: ['Leaking', 'Dirty', 'Level low', 'Coolant mixed with engine oil'],
    engineConditionIssues: [],
    engineMountingIssues: [],
    engineOilIssues: [],
    exhaustSmokeIssues: [],
    fuelInjectorIssues: [],
    radiatorIssues: [],
    runningConditionIssues: [],
    sumpIssues: [],
    transmissionGearShiftingIssues: [],
    turbochargerAvailable: [],
  },

  steeringBrakes: {
    brakesIssues: ['Brake pedal too soft', 'Brake noise while stopping', 'Handbrake not holding', 'ABS warning light on'],
    steeringIssues: ['Hard steering movement', 'Steering wheel vibration', 'Steering play too high', 'Power steering warning light'],
    suspensionIssues: ['Uneven ride height', 'Suspension knocking noise', 'Excessive body roll', 'Shock absorber leakage'],
  },

  vehicle: {
    leadTypes: ['C2B', 'NBFC', 'PDI', 'NPDI', 'WARRANTY'],
    rcAvailabilityOptions: ['Yes', 'Lost', 'Submit Later'],
    rcConditionOptions: ['Original', 'Duplicate', 'Lost with photocopy'],
    fuelTypeOptions: ['Petrol', 'Diesel', 'CNG', 'Electric'],
    duplicateKeyOptions: ['true', 'false'],
  },

  electricalInteriors: {
    powerWindowsCountOptions: ['0', '2', '4'],
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCatalogViewModel = create<CatalogState>((set, get) => ({
  catalog: null,
  loadingState: 'idle',
  error: null,

  loadCatalog: async () => {
    // Avoid duplicate loads
    if (get().loadingState === 'loading') return;

    set({ loadingState: 'loading', error: null });

    try {
      // 1. Try cache first — serve immediately for fast startup
      const cached = await catalogCache.get();
      if (cached) {
        set({ catalog: cached, loadingState: 'success' });
        // 2. Revalidate in background (stale-while-revalidate)
        catalogService
          .fetchCatalog()
          .then(async (fresh) => {
            await catalogCache.set(fresh);
            set({ catalog: fresh });
          })
          .catch(() => {
            // Background revalidation failure is silent — cached data is still valid
          });
        return;
      }

      // 3. No cache — fetch fresh and show loading state
      const fresh = await catalogService.fetchCatalog();
      await catalogCache.set(fresh);
      set({ catalog: fresh, loadingState: 'success', error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load catalog';
      // Fall back to hardcoded values so the app remains usable
      set({
        catalog: FALLBACK_CATALOG,
        loadingState: 'error',
        error: message,
      });
    }
  },

  refreshCatalog: async () => {
    await catalogCache.clear();
    set({ catalog: null, loadingState: 'idle', error: null });
    await get().loadCatalog();
  },
}));

// ─── Selector helpers (memoisation-friendly) ─────────────────────────────────

/** Returns the catalog, falling back to hardcoded values if not yet loaded. */
export function selectCatalog(state: CatalogState): NormalisedCatalog {
  return state.catalog ?? FALLBACK_CATALOG;
}
