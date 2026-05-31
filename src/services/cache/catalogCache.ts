/**
 * Catalog cache — persists the API response in AsyncStorage.
 *
 * Strategy:
 *  - Cache TTL: 24 hours (configurable via CACHE_TTL_MS).
 *  - On app open: serve from cache immediately, then revalidate in background.
 *  - If cache is stale or missing: fetch fresh data.
 *
 * Why AsyncStorage over Redis?
 *  - This is a React Native mobile app; AsyncStorage is the standard
 *    production-grade local persistence layer.
 *  - Redis is a server-side cache — not applicable here.
 *  - AsyncStorage survives app restarts and works offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NormalisedCatalog } from '../api/types';

const CACHE_KEY = '@autoinspectai:inspection_catalog_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: NormalisedCatalog;
  version: string; // Backend catalog version
  cachedAt: number; // Unix timestamp ms
}

/**
 * Validates that a cached catalog entry has the expected top-level shape.
 *
 * Architecture rule: the catalog is FULLY DYNAMIC. Sections come from the
 * backend; the frontend must not hardcode any section name. This validator
 * therefore only checks the structural invariants every catalog must have:
 *
 *   - `sections` is a non-empty array
 *   - every section has `section` (key), `label`, and `children` (array)
 *   - the path lookup maps exist (may be empty objects)
 *
 * Anything stricter (e.g. requiring `vehicle` or `engineTransmission`) would
 * brick every cached entry the moment a backend section is renamed or removed.
 */
function isValidCatalog(data: unknown): data is NormalisedCatalog {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  // Structural maps must exist (can be empty objects)
  if (typeof d.fieldsByPath !== 'object' || d.fieldsByPath === null) return false;
  if (typeof d.optionsByPath !== 'object' || d.optionsByPath === null) return false;
  if (typeof d.uploadPathsBySection !== 'object' || d.uploadPathsBySection === null) return false;

  // Sections must be a non-empty array
  if (!Array.isArray(d.sections) || d.sections.length === 0) return false;

  // Each section must have the minimum required shape
  for (const sec of d.sections) {
    if (!sec || typeof sec !== 'object') return false;
    const s = sec as Record<string, unknown>;
    if (typeof s.section !== 'string' || s.section.length === 0) return false;
    if (typeof s.label !== 'string') return false;
    if (!Array.isArray(s.children)) return false;
  }

  return true;
}

export const catalogCache = {
  async get(): Promise<NormalisedCatalog | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const entry: CacheEntry = JSON.parse(raw);
      const age = Date.now() - entry.cachedAt;

      if (age > CACHE_TTL_MS) {
        // Stale — remove and return null so caller fetches fresh
        await AsyncStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Discard cache entries that don't match the current catalog shape.
      // This handles the case where a previous app version wrote a partial
      // catalog (e.g. missing the `vehicle` section) that would cause crashes.
      if (!isValidCatalog(entry.data)) {
        await AsyncStorage.removeItem(CACHE_KEY);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  async set(data: NormalisedCatalog, version: string): Promise<void> {
    try {
      const entry: CacheEntry = { data, version, cachedAt: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Cache write failure is non-fatal — app continues with in-memory data
    }
  },

  async getVersion(): Promise<string | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const entry: CacheEntry = JSON.parse(raw);
      return entry.version || null;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
  },
};
