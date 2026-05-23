# Catalog Loading Flow - Complete Overview

## Summary

✅ **YES**, the catalog API is called on initial app load via `App.tsx` → `CatalogBootstrap`

✅ **Caching is now properly integrated** - catalog is cached for 24 hours and reused

## Complete Flow

### 1. App Startup
```
App.tsx mounts
  ↓
<CatalogBootstrap /> component renders
  ↓
useEffect calls loadCatalog()
  ↓
catalogViewModel.loadCatalog() executes
```

### 2. First Time (No Cache)
```
catalogViewModel.loadCatalog()
  ↓
catalogService.fetchCatalog()
  ↓
Check AsyncStorage cache → MISS
  ↓
GET /api/v1/forms/inspection-report/catalog?view=tree
  ↓
Normalize data
  ↓
Save to AsyncStorage (24h TTL)
  ↓
Return to viewModel
  ↓
UI renders with catalog data
```

**Console Output:**
```
[CatalogViewModel] 🚀 Loading catalog...
[CatalogService] 🔍 Checking cache...
[CatalogService] ❌ Cache miss. Fetching from API...
[CatalogService] 📥 Fetching catalog from: http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 🌐 GET http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 📡 Response: 200 OK
[CatalogService] ✅ Catalog fetched successfully
[CatalogService] 📊 Sections found: 6
[CatalogService] 🔧 Catalog normalized and ready
[CatalogService] 💾 Saving to cache...
[CatalogService] ✅ Cached successfully
[CatalogViewModel] ✅ Catalog loaded successfully
```

### 3. Subsequent App Starts (Cache Hit)
```
catalogViewModel.loadCatalog()
  ↓
catalogService.fetchCatalog()
  ↓
Check AsyncStorage cache → HIT (< 24 hours old)
  ↓
Return cached data immediately
  ↓
UI renders instantly (no API call!)
```

**Console Output:**
```
[CatalogViewModel] 🚀 Loading catalog...
[CatalogService] 🔍 Checking cache...
[CatalogService] ✅ Cache hit! Using cached catalog
[CatalogViewModel] ✅ Catalog loaded successfully
```

### 4. Submission Flow (Uses Cache)
```
User submits inspection
  ↓
ReviewSubmitScreen calls catalogService.fetchCatalog()
  ↓
Check cache → HIT
  ↓
Return cached catalog (no API call!)
  ↓
Build payload using cached catalog
  ↓
POST /api/v1/forms/inspection-report/submit
```

**Console Output:**
```
[ReviewSubmit] 🔧 Building final payload...
[CatalogService] 🔍 Checking cache...
[CatalogService] ✅ Cache hit! Using cached catalog
[ReviewSubmit] 📦 Final payload to submit: {...}
[ReviewSubmit] 🌐 Sending to API: POST /api/v1/forms/inspection-report/submit
[HTTP] 📤 POST http://172.16.143.120:3002/api/v1/forms/inspection-report/submit
```

## Architecture

### Before (Redundant Double Caching)
```
catalogViewModel.loadCatalog()
  ↓ checks cache
catalogCache.get()
  ↓ if hit, also calls
catalogService.fetchCatalog()
  ↓ checks cache AGAIN (redundant!)
catalogCache.get()
```

### After (Clean Single Responsibility)
```
catalogViewModel.loadCatalog()
  ↓ delegates to service
catalogService.fetchCatalog()
  ↓ handles caching internally
catalogCache.get()
  ↓ returns cached or fetches fresh
```

## Key Components

### 1. App.tsx
- **Role:** Bootstrap catalog loading on app start
- **When:** Runs once when app mounts
- **Code:**
```typescript
const CatalogBootstrap: React.FC = () => {
  const loadCatalog = useCatalogViewModel((s) => s.loadCatalog);
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);
  return null;
};
```

### 2. catalogViewModel.ts
- **Role:** Orchestrate catalog loading, manage UI state
- **Responsibilities:**
  - Call catalogService to load data
  - Track loading/error states
  - Provide fallback catalog if API fails
  - Expose catalog to UI components

### 3. catalogService.ts
- **Role:** Fetch and normalize catalog data
- **Responsibilities:**
  - Check cache first (24h TTL)
  - Fetch from API if cache miss
  - Normalize API response
  - Save to cache after fetch

### 4. catalogCache.ts
- **Role:** Persist catalog in AsyncStorage
- **Responsibilities:**
  - Store catalog with timestamp
  - Check if cache is stale (> 24h)
  - Validate cached data structure
  - Clear stale/invalid cache

## API Call Frequency

### Before Caching
- **App start:** 1 API call
- **Each submission:** 1 API call
- **Total for 10 submissions:** 11 API calls

### After Caching
- **App start (first time):** 1 API call → cached
- **App start (subsequent):** 0 API calls (cache hit)
- **Each submission:** 0 API calls (cache hit)
- **Total for 10 submissions:** 1 API call (90% reduction!)

## Cache Behavior

### Cache Hit (< 24 hours)
- Instant response
- No network request
- No loading state

### Cache Miss (> 24 hours or first time)
- Shows loading state
- Fetches from API
- Saves to cache
- Future requests use cache

### Cache Invalidation
Manual refresh:
```typescript
const refreshCatalog = useCatalogViewModel((s) => s.refreshCatalog);
await refreshCatalog(); // Clears cache and fetches fresh
```

Automatic:
- After 24 hours (TTL expires)
- If cached data structure is invalid
- If app data is cleared

## Testing

### Test Initial Load
1. Clear app data
2. Start app
3. Check console for:
   ```
   [CatalogService] ❌ Cache miss. Fetching from API...
   [HTTP] 🌐 GET .../catalog
   ```

### Test Cache Hit
1. Restart app (without clearing data)
2. Check console for:
   ```
   [CatalogService] ✅ Cache hit! Using cached catalog
   ```
3. Should NOT see any GET request

### Test Submission
1. Fill form and submit
2. Check console - should see:
   ```
   [CatalogService] ✅ Cache hit! Using cached catalog
   [HTTP] 📤 POST .../submit
   ```
3. Should NOT see GET /catalog

## Files Modified

1. **src/services/api/catalogService.ts**
   - Added cache checking in fetchCatalog()
   - Added refreshCatalog() method

2. **src/viewmodels/catalogViewModel.ts**
   - Simplified loadCatalog() to delegate to service
   - Removed redundant cache checking
   - Updated refreshCatalog() to use service method

3. **src/services/cache/catalogCache.ts**
   - Already existed (no changes needed)

## Benefits

1. **Faster App Startup**
   - Instant catalog load after first time
   - No waiting for API on subsequent starts

2. **Faster Submissions**
   - No catalog fetch before submit
   - Only submit API call needed

3. **Reduced Network Usage**
   - 90% fewer API calls
   - Saves mobile data
   - Reduces server load

4. **Better Offline Support**
   - App works with cached catalog
   - Can build payloads offline
   - Only submit needs network

5. **Improved UX**
   - No loading spinners after first load
   - Instant form rendering
   - Smoother user experience

## Monitoring

Watch for these console logs to verify caching is working:

**✅ Good (Cache Working):**
```
[CatalogService] ✅ Cache hit! Using cached catalog
```

**⚠️ Expected First Time:**
```
[CatalogService] ❌ Cache miss. Fetching from API...
```

**❌ Problem (Cache Not Working):**
If you see "Cache miss" on every app start, check:
1. AsyncStorage permissions
2. Cache TTL configuration
3. No errors in cache write operation
