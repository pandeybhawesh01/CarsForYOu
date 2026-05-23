# Draft Load Timing Fix

## Problem

Draft was being loaded when clicking the card on the dashboard, not when clicking "Start Inspection" button.

### Before (Wrong):

```
Dashboard
  ↓
Click card → startInspection() → Load draft ❌
  ↓
LeadDetailsScreen (shows lead info)
  ↓
Click "Start Inspection" button → Just navigate
  ↓
InspectionHomeScreen
```

**Issue:** Draft loaded too early, before user confirms they want to start.

### After (Correct):

```
Dashboard
  ↓
Click card → setCurrentLead() → No draft load ✅
  ↓
LeadDetailsScreen (shows lead info)
  ↓
Click "Start Inspection" button → startInspection() → Load draft ✅
  ↓
InspectionHomeScreen (with draft pre-filled)
```

**Fixed:** Draft loads only when user explicitly starts inspection.

## Changes Made

### 1. Added `setCurrentLead()` Function

**File:** `src/features/inspection/store/inspectionStore.ts`

```typescript
interface InspectionActions {
  setCurrentLead: (lead: InspectionLead) => void;  // ← NEW
  startInspection: (lead: InspectionLead) => Promise<void>;
  // ...
}

// Set lead without loading draft
setCurrentLead: (lead) => {
  console.log('[InspectionStore] 📋 Setting current lead:', lead.appointmentId);
  set({
    currentLead: lead,
    currentSession: createEmptySession(lead),
    error: null,
  });
},

// Start inspection with draft loading
startInspection: async (lead) => {
  console.log('[InspectionStore] 🚀 Starting inspection for lead:', lead.appointmentId);
  
  // Create empty session
  const emptySession = createEmptySession(lead);
  set({ currentLead: lead, currentSession: emptySession, isLoading: true });
  
  // Load draft from Redis
  const draft = await draftService.loadDraft(lead.appointmentId);
  
  if (draft) {
    // Merge draft into session
    set({ currentSession: { ...emptySession, formData: draft.formData }, isLoading: false });
  }
},
```

### 2. Updated DashboardScreen

**File:** `src/features/dashboard/screens/DashboardScreen.tsx`

```typescript
// BEFORE
const { startInspection } = useInspectionStore();

const handleCardPress = (lead) => {
  startInspection(lead);  // ← Loaded draft here (wrong)
  navigation.navigate('LeadDetails');
};

// AFTER
const { setCurrentLead } = useInspectionStore();

const handleCardPress = (lead) => {
  setCurrentLead(lead);  // ← Just set lead, no draft load ✅
  navigation.navigate('LeadDetails');
};
```

### 3. Updated LeadDetailsScreen

**File:** `src/features/inspection/screens/LeadDetailsScreen.tsx`

```typescript
// BEFORE
const handleStartInspection = () => {
  navigation.replace('InspectionHome');  // ← Just navigate (wrong)
};

// AFTER
const { startInspection } = useInspectionStore();

const handleStartInspection = async () => {
  await startInspection(currentLead);  // ← Load draft here ✅
  navigation.replace('InspectionHome');
};
```

## Flow Comparison

### Before (Wrong):

```
1. Dashboard → Click card
   ↓
   startInspection() called
   ↓
   GET /api/v1/forms/inspection-report/draft/35821299199 ❌
   ↓
   Draft loaded (user hasn't confirmed yet)

2. LeadDetailsScreen → Click "Start Inspection"
   ↓
   Just navigate (no API call)
   ↓
   InspectionHomeScreen
```

### After (Correct):

```
1. Dashboard → Click card
   ↓
   setCurrentLead() called
   ↓
   No API call ✅
   ↓
   Just show lead details

2. LeadDetailsScreen → Click "Start Inspection"
   ↓
   startInspection() called
   ↓
   GET /api/v1/forms/inspection-report/draft/35821299199 ✅
   ↓
   Draft loaded and pre-filled
   ↓
   InspectionHomeScreen (with draft)
```

## Console Output

### Before (Wrong):

```
// Click card on dashboard
[InspectionStore] 🚀 Starting inspection for lead: 35821299199
[DraftService] 📥 Loading draft for appointment: 35821299199
[HTTP] 🌐 GET .../draft/35821299199  ← Too early!

// Click "Start Inspection" button
// (no logs, just navigation)
```

### After (Correct):

```
// Click card on dashboard
[InspectionStore] 📋 Setting current lead: 35821299199
// (no API call)

// Click "Start Inspection" button
[LeadDetails] 🚀 Start Inspection button clicked
[InspectionStore] 🚀 Starting inspection for lead: 35821299199
[DraftService] 📥 Loading draft for appointment: 35821299199
[HTTP] 🌐 GET .../draft/35821299199  ← Perfect timing!
[DraftService] ✅ Draft loaded successfully
[InspectionStore] ✅ Draft loaded and applied
```

## Benefits

### 1. Better UX
- User sees lead details first
- Draft loads only when user confirms
- No unnecessary API calls

### 2. Performance
- No API call on card click
- Faster navigation to lead details
- API call only when needed

### 3. Clearer Intent
- Card click = "Show me details"
- Button click = "Start inspection" (load draft)

## Testing

### Test 1: Card Click (No Draft Load)
```
1. Click card on dashboard
2. Check console
3. Should see: "Setting current lead"
4. Should NOT see: "Loading draft"
5. Should NOT see: GET /draft API call ✅
```

### Test 2: Start Button (Draft Loads)
```
1. Click card on dashboard
2. On lead details screen, click "Start Inspection"
3. Check console
4. Should see: "Starting inspection"
5. Should see: "Loading draft"
6. Should see: GET /draft API call ✅
```

### Test 3: Draft Pre-Fill
```
1. Fill some fields in inspection
2. Exit app
3. Reopen app
4. Click same lead card
5. Click "Start Inspection" button
6. Check: Fields should be pre-filled ✅
```

## Summary

| Action | Before | After |
|--------|--------|-------|
| Click dashboard card | Load draft ❌ | Just set lead ✅ |
| Click "Start Inspection" | Just navigate ❌ | Load draft ✅ |
| API call timing | Too early ❌ | Perfect ✅ |
| User experience | Confusing ❌ | Clear ✅ |

**Draft now loads at the right time!** 🎯
