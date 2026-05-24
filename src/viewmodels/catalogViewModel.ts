/**
 * Catalog ViewModel — MVVM layer between the service and the UI.
 *
 * Caching Strategy (Version-Based with AsyncStorage):
 *  - On app open: check AsyncStorage cache
 *  - Fetch backend version from API
 *  - If versions match → use cache (fast!)
 *  - If versions differ → admin cleared cache, fetch fresh
 *  - Store in both Zustand (in-memory) and AsyncStorage (persistent)
 *
 * Admin Control:
 *  - Admin changes catalog → increments version
 *  - All apps detect version mismatch → clear cache → fetch fresh
 *  - Centralized cache invalidation without app update!
 */

import { create } from 'zustand';
import { catalogService } from '../services/api/catalogService';
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
  sections: [], // populated from API; empty fallback is fine — DynamicInspectionStep handles it
  optionsByPath: {},
  fieldsByPath: {},
  vehicleSectionChildren: [],
  engineTransmissionSectionChildren: [],
  airConditioningSectionChildren: [],
  steeringBrakesSectionChildren: [],
  electricalsInteriorsSectionChildren: [],
  exteriorSectionChildren: [],

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

    // If catalog already loaded in this session, reuse it
    if (get().catalog !== null) {
      console.log('[CatalogViewModel] ♻️ Catalog already loaded in this session, reusing');
      return;
    }

    set({ loadingState: 'loading', error: null });

    try {
      console.log('[CatalogViewModel] 🚀 Loading catalog...');
      
      // catalogService handles version-based caching
      // It will check AsyncStorage, compare versions, and decide whether to use cache or fetch fresh
      const catalog = await catalogService.fetchCatalog();
      
      console.log('[CatalogViewModel] ✅ Catalog loaded successfully');
      set({ catalog, loadingState: 'success', error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load catalog';
      console.error('[CatalogViewModel] ❌ Catalog load failed:', message);
      
      // Fall back to hardcoded values so the app remains usable
      set({
        catalog: FALLBACK_CATALOG,
        loadingState: 'error',
        error: message,
      });
    }
  },

  refreshCatalog: async () => {
    console.log('[CatalogViewModel] 🔄 Refresh catalog requested');
    set({ catalog: null, loadingState: 'idle', error: null });
    // Use catalogService.refreshCatalog() which clears cache and fetches fresh
    try {
      const fresh = await catalogService.refreshCatalog();
      set({ catalog: fresh, loadingState: 'success', error: null });
      console.log('[CatalogViewModel] ✅ Catalog refreshed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh catalog';
      console.error('[CatalogViewModel] ❌ Catalog refresh failed:', message);
      set({
        catalog: FALLBACK_CATALOG,
        loadingState: 'error',
        error: message,
      });
    }
  },
}));

// ─── Selector helpers (memoisation-friendly) ─────────────────────────────────

/** Returns the catalog, falling back to hardcoded values if not yet loaded. */
export function selectCatalog(state: CatalogState): NormalisedCatalog {
  return state.catalog ?? FALLBACK_CATALOG;
}
