# Catalog Caching Strategy

## Problem Solved
Previously, the app was fetching the catalog from the API **on every submit**, which was inefficient since the catalog rarely changes.

## Solution Implemented
Integrated AsyncStorage caching into `catalogService.ts` with a 24-hour TTL (Time To Live).

## How It Works

### 1. First Time (Cache Miss)
```
User submits inspection
  ↓
catalogService.fetchCatalog() called
  ↓
Check AsyncStorage cache → MISS
  ↓
Fetch from API: GET /api/v1/forms/inspection-report/catalog?view=tree
  ↓
Normalize data
  ↓
Save to AsyncStorage with timestamp
  ↓
Return catalog
```

**Console Output:**
```
[CatalogService] 🔍 Checking cache...
[CatalogService] ❌ Cache miss. Fetching from API...
[CatalogService] 📥 Fetching catalog from: http://...
[HTTP] 🌐 GET http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 📡 Response: 200 OK
[CatalogService] ✅ Catalog fetched successfully
[CatalogService] 📊 Sections found: 6
[CatalogService] 🔧 Catalog normalized and ready
[CatalogService] 💾 Saving to cache...
[CatalogService] ✅ Cached successfully
```

### 2. Subsequent Submits (Cache Hit)
```
User submits inspection
  ↓
catalogService.fetchCatalog() called
  ↓
Check AsyncStorage cache → HIT (< 24 hours old)
  ↓
Return cached catalog immediately
  ↓
NO API CALL! 🎉
```

**Console Output:**
```
[CatalogService] 🔍 Checking cache...
[CatalogService] ✅ Cache hit! Using cached catalog
```

### 3. After 24 Hours (Cache Stale)
```
User submits inspection
  ↓
catalogService.fetchCatalog() called
  ↓
Check AsyncStorage cache → STALE (> 24 hours old)
  ↓
Clear stale cache
  ↓
Fetch fresh data from API
  ↓
Cache new data
  ↓
Return catalog
```

## Cache Configuration

**File:** `src/services/cache/catalogCache.ts`

```typescript
const CACHE_KEY = '@cars24:inspection_catalog_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
```

### Adjusting Cache Duration
To change how long the catalog is cached, edit `CACHE_TTL_MS`:

```typescript
// 1 hour
const CACHE_TTL_MS = 1 * 60 * 60 * 1000;

// 12 hours
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// 7 days
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
```

## API Methods

### `catalogService.fetchCatalog()`
- Checks cache first
- Returns cached data if available and fresh
- Fetches from API only if cache miss or stale
- **Use this for normal operations**

### `catalogService.refreshCatalog()`
- Forces fresh fetch from API
- Clears cache before fetching
- **Use this when you know catalog has changed**

Example:
```typescript
// Normal usage (uses cache)
const catalog = await catalogService.fetchCatalog();

// Force refresh (bypasses cache)
const freshCatalog = await catalogService.refreshCatalog();
```

## Cache Validation

The cache includes validation to prevent crashes from stale data:

```typescript
function isValidCatalog(data: unknown): data is NormalisedCatalog {
  // Checks that all required sections exist
  return (
    typeof d.optionsByPath === 'object' &&
    typeof d.airConditioning === 'object' &&
    typeof d.engineTransmission === 'object' &&
    typeof d.steeringBrakes === 'object' &&
    typeof d.vehicle === 'object' &&
    typeof d.electricalInteriors === 'object'
  );
}
```

If the cached data doesn't match the expected structure (e.g., after an app update that adds new sections), the cache is automatically cleared and fresh data is fetched.

## Benefits

### Performance
- **First submit:** 1 API call (catalog fetch + submit)
- **Subsequent submits:** 0 catalog API calls for 24 hours
- **Faster submission:** No waiting for catalog fetch

### Network Efficiency
- Reduces API load
- Works better on slow connections
- Saves mobile data

### Offline Capability
- Cached catalog available even if network is temporarily unavailable
- App can still build payloads using cached metadata

## When Cache is Cleared

1. **Automatic:** After 24 hours (TTL expires)
2. **Automatic:** If cached data structure is invalid
3. **Manual:** When `catalogService.refreshCatalog()` is called
4. **Manual:** When user clears app data/cache in device settings

## Testing Cache Behavior

### Test Cache Hit
```typescript
// First call - should fetch from API
const catalog1 = await catalogService.fetchCatalog();
// Console: "Cache miss. Fetching from API..."

// Second call immediately after - should use cache
const catalog2 = await catalogService.fetchCatalog();
// Console: "Cache hit! Using cached catalog"
```

### Test Force Refresh
```typescript
// Force refresh - bypasses cache
const freshCatalog = await catalogService.refreshCatalog();
// Console: "Force refresh requested. Clearing cache..."
// Console: "Cache miss. Fetching from API..."
```

### Clear Cache Manually (for testing)
```typescript
import { catalogCache } from './services/cache/catalogCache';

// Clear cache
await catalogCache.clear();
console.log('Cache cleared');
```

## Files Modified

1. **`src/services/api/catalogService.ts`**
   - Added `catalogCache` import
   - Updated `fetchCatalog()` to check cache first
   - Added `refreshCatalog()` method for force refresh

2. **`src/services/cache/catalogCache.ts`**
   - Already existed with full implementation
   - No changes needed

## Migration Notes

- **No breaking changes** - existing code continues to work
- `catalogService.fetchCatalog()` signature unchanged
- Cache is transparent to calling code
- First run after update will populate cache

## Monitoring

Watch console logs to verify caching is working:

**Cache Working:**
```
[CatalogService] 🔍 Checking cache...
[CatalogService] ✅ Cache hit! Using cached catalog
[ReviewSubmit] 🌐 Sending to API: POST /api/v1/forms/inspection-report/submit
```

**Cache Not Working (would see):**
```
[CatalogService] 🔍 Checking cache...
[CatalogService] ❌ Cache miss. Fetching from API...
[HTTP] 🌐 GET http://...catalog
```

If you see cache miss on every submit, check:
1. AsyncStorage permissions
2. Cache TTL hasn't been set too short
3. No errors in cache write operation
