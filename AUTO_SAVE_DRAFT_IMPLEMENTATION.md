# Auto-Save Draft Implementation (Redis)

## Overview

✅ **Auto-save every 10 seconds** → Saves draft to Redis
✅ **Load draft on start** → Pre-fills form if draft exists
✅ **Production-ready** → Debouncing, error handling, non-blocking
✅ **Background sync** → Doesn't interrupt user flow

## How It Works

### 1. Start Inspection (Load Draft)

```
User clicks "Start Inspection"
  ↓
inspectionStore.startInspection(lead)
  ↓
Create empty session
  ↓
API Call: GET /api/v1/forms/inspection-report/draft/{appointmentId}
  ↓
If draft exists → Merge into session
  ↓
Form pre-filled with saved data! ✅
```

**Console Output:**
```
[InspectionStore] 🚀 Starting inspection for lead: {...}
[DraftService] 📥 Loading draft for appointment: 35821299199
[DraftService] ✅ Draft loaded successfully
[DraftService] 📊 Draft data keys: electricalsInteriors, additionalImages
[InspectionStore] 📥 Draft found! Pre-filling form data...
[InspectionStore] ✅ Draft loaded and applied
```

### 2. Auto-Save (Every 10 Seconds)

```
User fills form
  ↓
After 10 seconds
  ↓
useAutoSaveDraft hook triggers
  ↓
Build payload (same as final submit)
  ↓
Check if data changed (debouncing)
  ↓
If changed → API Call: POST /api/v1/forms/inspection-report/draft/submit
  ↓
Draft saved to Redis! ✅
```

**Console Output:**
```
[AutoSave] 🚀 Auto-save enabled for appointment: 35821299199
[AutoSave] 💾 Data changed, saving draft...
[DraftService] 💾 Auto-saving draft for appointment: 35821299199
[DraftService] ✅ Draft saved successfully
[AutoSave] ✅ Draft saved successfully
```

### 3. No Changes (Skip Save)

```
After 10 seconds
  ↓
Check if data changed
  ↓
No changes detected
  ↓
Skip API call (save bandwidth) ✅
```

**Console Output:**
```
[AutoSave] ⏭️ No changes detected, skipping save
```

## API Endpoints

### Save Draft (POST)
```bash
curl -X POST http://192.168.1.37:3002/api/v1/forms/inspection-report/draft/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test" \
  -d '{
    "appointmentId": "35821299199",
    "formData": {
      "electricalsInteriors": {
        "Accessories": {
          "musicSystem": {
            "isPresent": true,
            "issues": [{"type": "Music system not working"}]
          }
        }
      }
    },
    "additionalImages": []
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully"
}
```

### Load Draft (GET)
```bash
curl -X GET http://192.168.1.37:3002/api/v1/forms/inspection-report/draft/35821299199 \
  -H "X-API-Key: test"
```

**Response (Draft Exists):**
```json
{
  "success": true,
  "data": {
    "appointmentId": "35821299199",
    "formData": {
      "electricalsInteriors": {...}
    },
    "additionalImages": []
  }
}
```

**Response (No Draft):**
```json
{
  "success": false,
  "message": "No draft found"
}
```

## Implementation Details

### Files Created

1. **`src/services/api/draftService.ts`**
   - `saveDraft()` - Save to Redis
   - `loadDraft()` - Load from Redis
   - `clearDraft()` - Clear from Redis (optional)

2. **`src/hooks/useAutoSaveDraft.ts`**
   - Auto-save hook with 10-second interval
   - Debouncing (only save if data changed)
   - Cleanup on unmount

3. **`src/services/api/endpoints.ts`** (Updated)
   - Added `DRAFT_SAVE` endpoint
   - Added `DRAFT_LOAD` endpoint

### Files Modified

1. **`src/features/inspection/store/inspectionStore.ts`**
   - Updated `startInspection()` to load draft
   - Made async to support draft loading

2. **`src/features/inspection/screens/InspectionHomeScreen.tsx`**
   - Added `useAutoSaveDraft` hook
   - Auto-save enabled when inspection is active

## Features

### 1. Debouncing (Smart Saving)
```typescript
// Only save if data actually changed
const currentData = JSON.stringify(payload.formData);
if (currentData === lastSavedDataRef.current) {
  console.log('No changes detected, skipping save');
  return;
}
```

**Benefit:** Saves bandwidth and reduces Redis writes

### 2. Non-Blocking (Background Sync)
```typescript
try {
  await draftService.saveDraft(payload);
} catch (error) {
  console.error('Auto-save failed:', error);
  // Don't throw - auto-save is non-critical
}
```

**Benefit:** Errors don't interrupt user flow

### 3. Initial Save Delay
```typescript
// Initial save after 2 seconds (give user time to start filling)
const initialTimeout = setTimeout(() => {
  autoSave();
}, 2000);
```

**Benefit:** Doesn't save empty form immediately

### 4. Cleanup on Unmount
```typescript
return () => {
  clearTimeout(initialTimeout);
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }
};
```

**Benefit:** No memory leaks

## User Flow Examples

### Scenario 1: Complete in One Session
```
1. Start inspection → No draft, start fresh
2. Fill Step 1 → Auto-saved after 10s
3. Fill Step 2 → Auto-saved after 10s
4. Fill Step 3 → Auto-saved after 10s
5. Submit → Final submission
```

### Scenario 2: Interrupted and Resumed
```
Session 1:
1. Start inspection → No draft
2. Fill Step 1 → Auto-saved
3. Fill Step 2 → Auto-saved
4. App crashes / User closes app

Session 2:
5. Start inspection → Draft loaded! ✅
6. Steps 1 & 2 pre-filled
7. Continue from Step 3
8. Submit → Final submission
```

### Scenario 3: Multiple Interruptions
```
Day 1, 9:00 AM:
- Start inspection
- Fill Step 1
- Auto-saved

Day 1, 3:00 PM:
- Open app again
- Draft loaded (Step 1 filled)
- Fill Step 2
- Auto-saved

Day 2, 10:00 AM:
- Open app again
- Draft loaded (Steps 1 & 2 filled)
- Complete remaining steps
- Submit
```

## Backend Requirements

### Redis Storage

**Key Format:**
```
draft:inspection:{appointmentId}
```

**Example:**
```
draft:inspection:35821299199
```

**Value (JSON):**
```json
{
  "appointmentId": "35821299199",
  "formData": {...},
  "additionalImages": [],
  "savedAt": "2025-05-24T10:30:00Z"
}
```

**TTL (Time To Live):**
```
Recommended: 7 days
```

After 7 days, draft auto-expires (user must start fresh)

### Backend Implementation Example

```javascript
// Save draft
app.post('/api/v1/forms/inspection-report/draft/submit', async (req, res) => {
  const { appointmentId, formData, additionalImages } = req.body;
  
  const draftKey = `draft:inspection:${appointmentId}`;
  const draftData = {
    appointmentId,
    formData,
    additionalImages,
    savedAt: new Date().toISOString(),
  };
  
  // Save to Redis with 7-day TTL
  await redis.setex(draftKey, 7 * 24 * 60 * 60, JSON.stringify(draftData));
  
  res.json({ success: true, message: 'Draft saved successfully' });
});

// Load draft
app.get('/api/v1/forms/inspection-report/draft/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const draftKey = `draft:inspection:${appointmentId}`;
  
  const draftData = await redis.get(draftKey);
  
  if (!draftData) {
    return res.json({ success: false, message: 'No draft found' });
  }
  
  res.json({
    success: true,
    data: JSON.parse(draftData),
  });
});

// Clear draft (optional - called after successful submission)
app.delete('/api/v1/forms/inspection-report/draft/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const draftKey = `draft:inspection:${appointmentId}`;
  
  await redis.del(draftKey);
  
  res.json({ success: true, message: 'Draft cleared' });
});
```

## Configuration

### Auto-Save Interval

**Current:** 10 seconds

**Change in:** `src/hooks/useAutoSaveDraft.ts`

```typescript
// Current
const AUTO_SAVE_INTERVAL_MS = 10 * 1000; // 10 seconds

// Options
const AUTO_SAVE_INTERVAL_MS = 5 * 1000;   // 5 seconds (more frequent)
const AUTO_SAVE_INTERVAL_MS = 30 * 1000;  // 30 seconds (less frequent)
const AUTO_SAVE_INTERVAL_MS = 60 * 1000;  // 1 minute
```

### Initial Save Delay

**Current:** 2 seconds

**Change in:** `src/hooks/useAutoSaveDraft.ts`

```typescript
// Current
const initialTimeout = setTimeout(() => {
  autoSave();
}, 2000); // 2 seconds

// Options
}, 5000); // 5 seconds
}, 0);    // Immediate
```

## Testing

### Test 1: Auto-Save Works
1. Start inspection
2. Fill some fields
3. Wait 10 seconds
4. Check console: "Draft saved successfully"
5. Check backend: Draft exists in Redis

### Test 2: Draft Loading Works
1. Start inspection
2. Fill Step 1
3. Wait for auto-save
4. Close app completely
5. Reopen app
6. Start same inspection
7. Check: Step 1 should be pre-filled ✅

### Test 3: Debouncing Works
1. Start inspection
2. Fill field
3. Wait 10 seconds → Saves
4. Don't change anything
5. Wait 10 seconds → Skips save
6. Check console: "No changes detected"

### Test 4: No Draft (Fresh Start)
1. Start new inspection (different appointmentId)
2. Check console: "No draft found, starting fresh"
3. Form should be empty ✅

## Monitoring

### Success Indicators

**Auto-save working:**
```
[AutoSave] 💾 Data changed, saving draft...
[DraftService] ✅ Draft saved successfully
```

**Draft loaded:**
```
[DraftService] ✅ Draft loaded successfully
[InspectionStore] ✅ Draft loaded and applied
```

**Debouncing working:**
```
[AutoSave] ⏭️ No changes detected, skipping save
```

### Error Indicators

**Auto-save failed (non-critical):**
```
[DraftService] ❌ Draft save failed: Network error
[AutoSave] ❌ Auto-save failed: ...
```

**Draft load failed (acceptable):**
```
[DraftService] ℹ️ No draft available, starting fresh
```

## Benefits

✅ **Never lose progress** - Auto-saves every 10 seconds
✅ **Resume anytime** - Draft persists across app restarts
✅ **Smart saving** - Only saves when data changes
✅ **Non-blocking** - Errors don't interrupt user
✅ **Production-ready** - Proper error handling and cleanup
✅ **Bandwidth efficient** - Debouncing reduces unnecessary saves

## Summary

| Feature | Status |
|---------|--------|
| Auto-save every 10 seconds | ✅ YES |
| Load draft on start | ✅ YES |
| Debouncing (skip if no changes) | ✅ YES |
| Non-blocking (background sync) | ✅ YES |
| Error handling | ✅ YES |
| Cleanup on unmount | ✅ YES |
| Production-ready | ✅ YES |

**Perfect solution for draft management!** 🎉
