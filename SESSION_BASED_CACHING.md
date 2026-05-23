# Session-Based Catalog Caching

## Strategy

✅ **Every app open** → Fetch fresh catalog from API
✅ **During app session** → Use in-memory cache (no redundant API calls)
✅ **App closes** → Cache automatically cleared
✅ **Next app open** → Fetch fresh again

## How It Works

### App Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ App Opens (1st time today)                              │
│   ↓                                                      │
│ catalogViewModel.loadCatalog()                          │
│   ↓                                                      │
│ Check: catalog === null? YES                            │
│   ↓                                                      │
│ API Call: GET /catalog  ✅                              │
│   ↓                                                      │
│ Store in Zustand state (in-memory)                      │
│   ↓                                                      │
│ User fills forms, submits inspection                    │
│   ↓                                                      │
│ Submit needs catalog → Use in-memory cache ✅           │
│   ↓                                                      │
│ No API call on submit!                                  │
│   ↓                                                      │
│ User closes app                                         │
│   ↓                                                      │
│ Zustand state cleared (automatic)                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ App Opens (2nd time today)                              │
│   ↓                                                      │
│ catalogViewModel.loadCatalog()                          │
│   ↓                                                      │
│ Check: catalog === null? YES (state was cleared)        │
│   ↓                                                      │
│ API Call: GET /catalog  ✅                              │
│   ↓                                                      │
│ Store in Zustand state (in-memory)                      │
│   ↓                                                      │
│ ... (same as above)                                     │
└─────────────────────────────────────────────────────────┘
```

## API Call Frequency

### Scenario 1: Open app, submit, close
```
1. Open app     → API called ✅
2. Fill form    → No API call
3. Submit       → No API call (uses in-memory cache)
4. Close app    → Cache cleared

Total: 1 API call per session
```

### Scenario 2: Open app twice in a day
```
Session 1:
1. Open app     → API called ✅
2. Submit       → No API call
3. Close app    → Cache cleared

Session 2:
4. Open app     → API called ✅ (fresh fetch)
5. Submit       → No API call
6. Close app    → Cache cleared

Total: 2 API calls (1 per session)
```

### Scenario 3: Multiple submits in same session
```
1. Open app         → API called ✅
2. Submit form 1    → No API call (in-memory cache)
3. Submit form 2    → No API call (in-memory cache)
4. Submit form 3    → No API call (in-memory cache)
5. Close app        → Cache cleared

Total: 1 API call (multiple submits use same cached data)
```

## Console Output

### App Opens (Fresh Fetch)
```
[CatalogViewModel] 🚀 Loading fresh catalog from API...
[CatalogService] 📥 Fetching catalog from: http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 🌐 GET http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 📡 Response: 200 OK
[CatalogService] ✅ Catalog fetched successfully
[CatalogService] 📊 Sections found: 6
[CatalogService] 🔧 Catalog normalized and ready
[CatalogViewModel] ✅ Catalog loaded and cached in memory
```

### During Same Session (Reuse)
```
[CatalogViewModel] ♻️ Catalog already loaded in this session, reusing
```

### On Submit (Uses In-Memory Cache)
```
[ReviewSubmit] 🔧 Building final payload...
[CatalogViewModel] ♻️ Catalog already loaded in this session, reusing
[ReviewSubmit] 📦 Final payload to submit: {...}
[HTTP] 📤 POST http://172.16.143.120:3002/api/v1/forms/inspection-report/submit
```

## Implementation Details

### catalogService.ts
- **No persistent caching** (AsyncStorage removed)
- Always fetches from API when called
- Simple and straightforward

```typescript
async fetchCatalog(): Promise<NormalisedCatalog> {
  const url = `${ENDPOINTS.INSPECTION_CATALOG}?view=tree`;
  const raw = await httpGet<CatalogApiResponse>(url);
  // ... normalize and return
}
```

### catalogViewModel.ts
- **In-memory caching** via Zustand state
- Checks if `catalog !== null` before fetching
- If already loaded, reuses existing data
- State automatically cleared when app closes

```typescript
loadCatalog: async () => {
  // If catalog already loaded in this session, reuse it
  if (get().catalog !== null) {
    console.log('Catalog already loaded, reusing');
    return;
  }
  
  // Fetch fresh from API
  const catalog = await catalogService.fetchCatalog();
  set({ catalog }); // Store in Zustand state
}
```

### App.tsx
- Calls `loadCatalog()` on mount
- Runs every time app opens
- Triggers fresh API fetch

```typescript
useEffect(() => {
  loadCatalog(); // Fetches fresh on every app open
}, [loadCatalog]);
```

## Benefits

### ✅ Always Fresh Data
- Every app open gets latest catalog
- No stale data issues
- No manual refresh needed

### ✅ No Redundant Calls
- Only 1 API call per session
- Submit doesn't refetch catalog
- Multiple submits use same cached data

### ✅ Automatic Cache Invalidation
- No manual cache clearing needed
- App close = cache cleared
- Next open = fresh data

### ✅ Simple & Predictable
- Easy to understand behavior
- No complex TTL logic
- No cache corruption issues

## Comparison

### Before (No Caching)
```
Open app    → GET /catalog
Submit      → GET /catalog (redundant!)
Submit      → GET /catalog (redundant!)
Close app

Total: 3 API calls
```

### After (Session-Based Caching)
```
Open app    → GET /catalog
Submit      → (uses cache)
Submit      → (uses cache)
Close app   → (cache cleared)

Total: 1 API call
```

### Alternative (Persistent Caching - NOT USED)
```
Open app    → (uses cache from yesterday)
Submit      → (uses cache)
Close app

Total: 0 API calls (but data might be stale!)
```

## Testing

### Test 1: Fresh Fetch on App Open
1. Open app
2. Check console:
   ```
   [CatalogViewModel] 🚀 Loading fresh catalog from API...
   [HTTP] 🌐 GET .../catalog
   ```
3. ✅ Should see API call

### Test 2: No Refetch on Submit
1. Open app (catalog loads)
2. Fill form and submit
3. Check console:
   ```
   [CatalogViewModel] ♻️ Catalog already loaded in this session, reusing
   [HTTP] 📤 POST .../submit
   ```
4. ✅ Should NOT see GET /catalog

### Test 3: Fresh Fetch After Reopen
1. Open app (catalog loads)
2. Close app completely
3. Open app again
4. Check console:
   ```
   [CatalogViewModel] 🚀 Loading fresh catalog from API...
   [HTTP] 🌐 GET .../catalog
   ```
5. ✅ Should see API call again

## Files Modified

1. **src/services/api/catalogService.ts**
   - Removed AsyncStorage caching
   - Always fetches from API
   - Simplified implementation

2. **src/viewmodels/catalogViewModel.ts**
   - Added in-memory cache check
   - Reuses catalog if already loaded in session
   - Updated documentation

3. **App.tsx**
   - No changes (already calls loadCatalog on mount)

## Summary

| Event | API Call? | Cache State |
|-------|-----------|-------------|
| App opens (1st time) | ✅ YES | Cached in memory |
| Submit during session | ❌ NO | Uses in-memory cache |
| App closes | ❌ NO | Cache cleared |
| App opens (2nd time) | ✅ YES | Fresh fetch, cached again |

**Result:** Fresh data on every app open, no redundant calls during session! 🎉
