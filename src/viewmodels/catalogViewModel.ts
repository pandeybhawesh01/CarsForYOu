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

// ─── Empty catalog default ───────────────────────────────────────────────────
//
// C-4 fix: many screens read `catalog.sections` / `catalog.uploadPathsBySection`
// directly. Before catalog finishes loading, `catalog` was `null` and any
// dereference crashed the app on cold start. We expose `selectCatalog` that
// returns this frozen empty catalog when the real one isn't loaded yet, so
// every consumer can safely access it.

const EMPTY_CATALOG: NormalisedCatalog = Object.freeze({
  sections: [],
  uploadPathsBySection: {},
  optionsByPath: {},
  fieldsByPath: {},
  vehicleSectionChildren: [],
  engineTransmissionSectionChildren: [],
  airConditioningSectionChildren: [],
  steeringBrakesSectionChildren: [],
  electricalsInteriorsSectionChildren: [],
  exteriorSectionChildren: [],
  airConditioning: {
    acCompressorIssues: [],
    acControlPanelIssues: [],
    acCoolingIssues: [],
    blowerMotorIssues: [],
    ventilationSystemIssues: [],
  },
  engineTransmission: {
    batteryAlternatorIssues: [],
    blowBy2000rpmIssues: [],
    blowByIdleIssues: [],
    clutchIssues: [],
    coolantIssues: [],
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
    brakesIssues: [],
    steeringIssues: [],
    suspensionIssues: [],
  },
  vehicle: {
    leadTypes: [],
    rcAvailabilityOptions: [],
    rcConditionOptions: [],
    fuelTypeOptions: [],
    duplicateKeyOptions: [],
  },
  electricalInteriors: {
    powerWindowsCountOptions: [],
  },
}) as NormalisedCatalog;

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

      // H-14: stale-while-revalidate. catalogService returns cached data
      // immediately (if any) and runs the version check in the background.
      // When the background revalidation finds a fresh version, it calls
      // `onRevalidate(fresh)` and we swap state in-place so the UI updates
      // without requiring another loadCatalog() round trip.
      const catalog = await catalogService.fetchCatalog({
        onRevalidate: (fresh) => {
          console.log('[CatalogViewModel] 🔁 Background revalidation produced fresh catalog');
          set({ catalog: fresh, loadingState: 'success', error: null });
        },
      });

      console.log('[CatalogViewModel] ✅ Catalog loaded successfully');
      set({ catalog, loadingState: 'success', error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load catalog';
      console.error('[CatalogViewModel] ❌ Catalog load failed:', message);
      
      // Set error state - app should show error screen
      set({
        catalog: null,
        loadingState: 'error',
        error: message,
      });
    }
  },

  refreshCatalog: async () => {
    console.log('[CatalogViewModel] 🔄 Refresh catalog requested');
    set({ catalog: null, loadingState: 'idle', error: null });
    
    try {
      // Use catalogService.refreshCatalog() which clears cache and fetches fresh
      const fresh = await catalogService.refreshCatalog();
      set({ catalog: fresh, loadingState: 'success', error: null });
      console.log('[CatalogViewModel] ✅ Catalog refreshed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh catalog';
      console.error('[CatalogViewModel] ❌ Catalog refresh failed:', message);
      
      // Set error state - app should show error screen
      set({
        catalog: null,
        loadingState: 'error',
        error: message,
      });
    }
  },
}));

// ─── Selector helpers (memoisation-friendly) ─────────────────────────────────

/**
 * Returns the catalog. Falls back to `EMPTY_CATALOG` (frozen) if not loaded
 * yet — so consumers can safely call `catalog.sections` without null-checking.
 *
 * If you need to know whether the catalog is *actually* loaded, read
 * `loadingState === 'success'` separately, or call `selectCatalogOrNull`.
 */
export function selectCatalog(state: CatalogState): NormalisedCatalog {
  return state.catalog ?? EMPTY_CATALOG;
}

/** Use when you specifically need to differentiate "loaded" vs "loading". */
export function selectCatalogOrNull(state: CatalogState): NormalisedCatalog | null {
  return state.catalog;
}

export { EMPTY_CATALOG };
