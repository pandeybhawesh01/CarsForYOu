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

/** Returns the catalog (null if not loaded). */
export function selectCatalog(state: CatalogState): NormalisedCatalog | null {
  return state.catalog;
}
