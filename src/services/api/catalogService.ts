/**
 * Catalog Service — fetches and normalises the inspection catalog.
 *
 * New API schema (v2): each node carries an `inputs` array instead of flat
 * inputType/dataType/options. Groups can have both `inputs` (rendered at
 * group level) and `children` (nested nodes).
 */

import { ENDPOINTS } from './endpoints';
import { httpGet } from './httpClient';
import { catalogCache } from '../cache/catalogCache';
import type {
  CatalogApiResponse,
  CatalogField,
  CatalogGroup,
  CatalogInput,
  CatalogNode,
  CatalogSection,
  NormalisedCatalog,
  NormalisedField,
  CatalogOptionsMap,
  RenderAs,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveRenderAs(input: CatalogInput): RenderAs {
  if (input.dataType === 'BOOLEAN') return 'boolean';
  if (input.inputType === 'multi-select') return 'multi-select';
  if (input.inputType === 'select') return 'single-select';
  if (input.inputType === 'file-upload') return 'file-upload';
  if (input.inputType === 'number') return 'number';
  return 'text';
}

function extractLabels(options: CatalogInput['options']): string[] {
  return options.map((o) => String(o.label)).filter((l) => l.trim().length > 0);
}

/**
 * Recursively collect all (path, input) pairs from the tree.
 * Each node can have multiple inputs — we emit one NormalisedField per input.
 */
function collectFields(
  nodes: CatalogNode[],
  accumulator: Array<{ path: string; key: string; label: string; input: CatalogInput }>,
): void {
  for (const node of nodes) {
    const inputs: CatalogInput[] = (node as CatalogGroup).inputs ?? [];

    for (const input of inputs) {
      accumulator.push({
        path: node.path,
        key: node.key,
        label: node.label,
        input,
      });
    }

    // Also handle legacy flat fields (old schema)
    const legacyField = node as CatalogField;
    if (legacyField.inputType && !inputs.length) {
      accumulator.push({
        path: node.path,
        key: node.key,
        label: node.label,
        input: {
          inputType: legacyField.inputType,
          dataType: legacyField.dataType ?? 'STRING',
          allowsMultiple: legacyField.allowsMultiple ?? false,
          options: legacyField.options ?? [],
        },
      });
    }

    const children = (node as CatalogGroup).children ?? [];
    if (children.length > 0) {
      collectFields(children, accumulator);
    }
  }
}

function buildFieldsMap(sections: CatalogSection[]): Record<string, NormalisedField> {
  const map: Record<string, NormalisedField> = {};

  for (const section of sections) {
    const collected: Array<{ path: string; key: string; label: string; input: CatalogInput }> = [];
    collectFields(section.children, collected);

    for (const { path, key, label, input } of collected) {
      const normalised: NormalisedField = {
        path,
        key,
        label,
        inputType: input.inputType,
        dataType: input.dataType,
        allowsMultiple: input.allowsMultiple,
        options: input.options,
        renderAs: deriveRenderAs(input),
      };

      const mapKey = map[path] ? `${path}__${input.inputType}` : path;
      map[mapKey] = normalised;
    }
  }

  return map;
}

function buildOptionsMap(fieldsMap: Record<string, NormalisedField>): CatalogOptionsMap {
  const map: CatalogOptionsMap = {};
  for (const [key, field] of Object.entries(fieldsMap)) {
    if (field.options?.length) {
      map[key] = extractLabels(field.options);
    }
  }
  return map;
}

function normalise(raw: CatalogApiResponse): NormalisedCatalog {
  const fieldsMap = buildFieldsMap(raw.data);
  const optionsMap = buildOptionsMap(fieldsMap);

  return {
    sections: raw.data,
    uploadPathsBySection: raw.metadata?.uploadPathsBySection,
    optionsByPath: optionsMap,
    fieldsByPath: fieldsMap,
  };
}

export const catalogService = {
  /**
   * Fetches catalog with version-based cache invalidation:
   * 1. Check AsyncStorage cache
   * 2. Fetch backend version (lightweight HEAD request or from API)
   * 3. If versions match → use cache
   * 4. If versions differ → clear cache, fetch fresh
   * 
   * This allows admin to invalidate all app caches by changing the version.
   */
  /**
   * Fetches catalog with stale-while-revalidate (H-14):
   *
   *   1. If a valid cache exists, return it IMMEDIATELY.
   *   2. Then in the background, ask the backend for the latest version.
   *      If the backend version differs from the cached version, fetch
   *      fresh, normalise, write to cache, and call `onRevalidate(fresh)`
   *      so the caller (viewmodel) can swap in the new state.
   *   3. If there's no cache, behave like the old fetch — block on network.
   *
   * This means cold-start UX is "instant if you've used the app before",
   * with eventual consistency via the background revalidation.
   */
  async fetchCatalog(options?: {
    onRevalidate?: (fresh: NormalisedCatalog) => void;
  }): Promise<NormalisedCatalog> {
    const cachedVersion = await catalogCache.getVersion();
    const cached = await catalogCache.get();

    if (cached) {
      // Stale-while-revalidate: serve cache, then check for updates in bg.
      console.log('[CatalogService] ✅ Cache hit — returning immediately, revalidating in background');
      void this.revalidate(cachedVersion, options?.onRevalidate).catch((err) => {
        console.warn('[CatalogService] Background revalidation failed:', err);
      });
      return cached;
    }

    // No cache — fall through to a fresh blocking fetch.
    console.log('[CatalogService] 🆕 No cache, blocking fetch');
    return this.fetchFresh();
  },

  /**
   * Background revalidation. Compares cached version to backend version
   * and writes through if they differ.
   */
  async revalidate(
    cachedVersion: string | null,
    onRevalidate?: (fresh: NormalisedCatalog) => void,
  ): Promise<void> {
    const url = `${ENDPOINTS.INSPECTION_CATALOG}?view=tree`;
    const raw = await httpGet<CatalogApiResponse>(url);
    if (!raw.success) {
      console.warn('[CatalogService] Revalidation API call failed:', raw.message);
      return;
    }
    const backendVersion = raw.version || 'unknown';
    if (cachedVersion === backendVersion) {
      console.log('[CatalogService] ♻️ Background revalidation: versions match, no update needed');
      return;
    }
    console.log('[CatalogService] 🔄 Background revalidation: version changed', cachedVersion, '->', backendVersion);
    const normalized = normalise(raw);
    await catalogCache.set(normalized, backendVersion);
    if (onRevalidate) {
      onRevalidate(normalized);
    }
  },

  /**
   * Blocking fresh fetch (used when there's no cache to serve).
   */
  async fetchFresh(): Promise<NormalisedCatalog> {
    const url = `${ENDPOINTS.INSPECTION_CATALOG}?view=tree`;
    console.log('[CatalogService] 📥 Fetching fresh catalog from:', url);

    const raw = await httpGet<CatalogApiResponse>(url);
    if (!raw.success) {
      throw new Error(raw.message ?? 'Catalog fetch failed');
    }

    const backendVersion = raw.version || 'unknown';
    const normalized = normalise(raw);
    await catalogCache.set(normalized, backendVersion);
    return normalized;
  },

  /**
   * Force refresh catalog from API, bypassing cache.
   */
  async refreshCatalog(): Promise<NormalisedCatalog> {
    console.log('[CatalogService] 🔄 Force refresh requested. Clearing cache...');
    await catalogCache.clear();
    return this.fetchFresh();
  },
};
