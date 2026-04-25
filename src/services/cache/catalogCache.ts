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

const CACHE_KEY = '@cars24:inspection_catalog_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: NormalisedCatalog;
  cachedAt: number; // Unix timestamp ms
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

      return entry.data;
    } catch {
      return null;
    }
  },

  async set(data: NormalisedCatalog): Promise<void> {
    try {
      const entry: CacheEntry = { data, cachedAt: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Cache write failure is non-fatal — app continues with in-memory data
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
