# Race Condition Fix - Auto-Save Draft

## Problem Identified

### The Issue:
When user exits from step screens back to home screen, auto-save was triggered with empty data, overwriting the filled data in Redis.

### What Was Happening:

```
1. User fills Step 1 → Data saved to Redis ✅
   Payload: { vehicle: {...}, engineTransmission: {...} }

2. User clicks back → Returns to InspectionHomeScreen

3. Auto-save triggers on InspectionHomeScreen
   Payload: { additionalImages: [] }  ← EMPTY! ❌

4. Empty payload overwrites filled data in Redis 😱

5. User returns to Step 1 → All data is gone!
```

### Console Evidence:

```
// Step screen - Good payload
[PayloadBuilder] 📊 Flat fields extracted: 27 fields
[PayloadBuilder] 📦 Full payload: {
  "formData": {
    "vehicle": {...},
    "engineTransmission": {...},
    "electricalsInteriors": {...}
  }
}
[DraftService] ✅ Draft saved successfully

// Exit to home screen - Empty payload!
[PayloadBuilder] 📊 Flat fields extracted: 1 field  ← Only additionalImages!
[PayloadBuilder] 📦 Full payload: {
  "formData": {
    "additionalImages": []  ← EMPTY!
  }
}
[AutoSave] 💾 Data changed, saving draft...  ← Overwrites filled data!
```

## Root Cause

**Auto-save was running on InspectionHomeScreen**, which doesn't have access to the filled form data. The home screen only shows the step list, not the actual form fields.

## Solution

### Move Auto-Save to Step Screens Only

**Before (Wrong):**
```
InspectionHomeScreen
  ↓
  useAutoSaveDraft() ← Running here (wrong place!)
  ↓
  Empty data saved
```

**After (Correct):**
```
InspectionStepScreen (Step 1, 2, 3, 4, 5, 6)
  ↓
  useAutoSaveDraft() ← Running here (correct place!)
  ↓
  Filled data saved
```

### Changes Made:

#### 1. Removed Auto-Save from InspectionHomeScreen

**File:** `src/features/inspection/screens/InspectionHomeScreen.tsx`

```typescript
// REMOVED
const catalog = useCatalogViewModel(selectCatalog);
useAutoSaveDraft({
  session: currentSession,
  catalog,
  enabled: !!currentSession,
});
```

#### 2. Added Auto-Save to InspectionStepScreen

**File:** `src/features/inspection/screens/InspectionStepScreen.tsx`

```typescript
// ADDED
const { currentSession } = useInspectionStore();
const catalog = useCatalogViewModel(selectCatalog);

useAutoSaveDraft({
  session: currentSession,
  catalog,
  enabled: !!currentSession,
});
```

## How It Works Now

### Correct Flow:

```
1. User opens Step 1
   ↓
   Auto-save starts (inside step screen)
   ↓
   User fills fields
   ↓
   Every 10s → Save filled data to Redis ✅

2. User clicks back → Returns to home screen
   ↓
   Auto-save stops (cleanup on unmount) ✅
   ↓
   No empty payload sent! ✅

3. User opens Step 2
   ↓
   Auto-save starts again (inside step screen)
   ↓
   User fills fields
   ↓
   Every 10s → Save filled data to Redis ✅
```

### Console Output (Fixed):

```
// Inside step screen - Good!
[AutoSave] 🚀 Auto-save enabled for appointment: 35821299199
[PayloadBuilder] 📊 Flat fields extracted: 27 fields
[PayloadBuilder] 📦 Full payload: {
  "formData": {
    "vehicle": {...},
    "engineTransmission": {...}
  }
}
[AutoSave] 💾 Data changed, saving draft...
[DraftService] ✅ Draft saved successfully

// Exit to home screen - Auto-save stops!
[AutoSave] 🛑 Auto-save stopped  ← Cleanup triggered

// No empty payload sent! ✅
```

## Benefits of This Fix

### 1. No Race Condition
- Auto-save only runs when user is actively filling forms
- Stops when user exits to home screen
- No empty payloads overwriting filled data

### 2. Better Performance
- Auto-save only active during form filling
- Inactive on home screen (saves battery/network)

### 3. Correct Data
- Always saves the current step's data
- Never saves empty data
- Draft always reflects actual progress

## Testing

### Test 1: Fill and Exit (No Data Loss)
```
1. Open Step 1
2. Fill some fields
3. Wait 10 seconds → Check console: "Draft saved"
4. Click back to home screen
5. Check console: "Auto-save stopped"
6. Open Step 1 again
7. Fields should still be filled ✅
```

### Test 2: Multiple Steps
```
1. Fill Step 1 → Auto-save
2. Exit to home → Auto-save stops
3. Fill Step 2 → Auto-save
4. Exit to home → Auto-save stops
5. Reopen app
6. Both steps should be filled ✅
```

### Test 3: No Empty Payloads
```
1. Fill Step 1
2. Exit to home screen
3. Check console logs
4. Should NOT see: "Flat fields extracted: 1 field"
5. Should see: "Auto-save stopped" ✅
```

## Summary

| Issue | Status |
|-------|--------|
| Race condition | ✅ FIXED |
| Empty payloads overwriting data | ✅ FIXED |
| Auto-save on wrong screen | ✅ FIXED |
| Data loss on exit | ✅ FIXED |
| Auto-save cleanup | ✅ WORKING |

**Race condition eliminated! Data is safe!** 🎉
