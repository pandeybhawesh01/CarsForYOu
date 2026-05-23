# Empty Payload Validation Fix

## Problem
The auto-save system was saving empty payloads to Redis when:
- User clicked "Start Inspection" button
- Draft was loaded but formData was empty
- Auto-save triggered immediately with only `additionalImages: []`
- This overwrote any existing draft with empty data

## Root Cause
The auto-save hook (`useAutoSaveDraft.ts`) was not validating if the payload contained meaningful data before saving. It would save even if `formData` only had:
```json
{
  "additionalImages": []
}
```

## Solution
Added validation in both auto-save and manual save functions to check if payload has meaningful form fields:

```typescript
// ✅ VALIDATION: Check if payload has meaningful data
const formDataKeys = Object.keys(payload.formData || {});
const hasOnlyAdditionalImages = 
  formDataKeys.length === 0 || 
  (formDataKeys.length === 1 && formDataKeys[0] === 'additionalImages');

if (hasOnlyAdditionalImages) {
  console.log('[AutoSave] ⏭️ Empty payload detected (no form fields), skipping save');
  return;
}
```

## What Gets Validated
- **Empty formData**: `{}` → ❌ Not saved
- **Only additionalImages**: `{ additionalImages: [] }` → ❌ Not saved
- **Has actual fields**: `{ vehicle: {...}, additionalImages: [] }` → ✅ Saved

## Benefits
✅ Prevents overwriting existing drafts with empty data
✅ Reduces unnecessary Redis writes
✅ Saves bandwidth and server resources
✅ User's filled data is protected from accidental overwrites

## Files Modified
- `src/hooks/useAutoSaveDraft.ts`
  - Added validation in `autoSave()` function
  - Added validation in `saveNow()` function

## Testing Checklist
- [ ] Click "Start Inspection" with existing draft → Should load draft, NOT overwrite with empty
- [ ] Fill some fields → Should auto-save after 10 seconds
- [ ] Navigate back without filling → Should NOT save empty payload
- [ ] Fill fields, then navigate → Should save filled data
- [ ] Close app with filled data → Should save on unmount

## Production Behavior
1. **Initial Load**: Draft loads from Redis, no save happens (empty payload blocked)
2. **User Fills Data**: After 10 seconds, auto-save triggers and saves filled data
3. **User Navigates**: On unmount, saves only if data exists
4. **User Returns**: Draft loads successfully with previously saved data

## Console Logs
When empty payload is detected:
```
[AutoSave] ⏭️ Empty payload detected (no form fields), skipping save
```

When valid data is saved:
```
[AutoSave] 💾 Data changed, saving draft...
[AutoSave] ✅ Draft saved successfully
```
