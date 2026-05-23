# Console Logging Guide

## Overview

The inspection form now includes comprehensive console logging throughout the entire flow. This helps you track form progression, data changes, and API submissions in real-time.

## Log Prefixes

Each component has a unique prefix for easy filtering:

| Prefix | Component | What it logs |
|--------|-----------|--------------|
| `[InspectionStore]` | State Management | Store operations, data updates, step completion |
| `[Step1]` | Basic Verification | Section navigation, form data, step completion |
| `[Step2-AC]` | Air Conditioning | Section navigation, AC form data, step completion |
| `[Step3-Interior]` | Interior | Section navigation, interior data, step completion |
| `[Step4-Engine]` | Engine & Transmission | Section navigation, engine data, step completion |
| `[Step5-Electricals]` | Electricals & Interiors | Section navigation, electrical data, step completion |
| `[Step6-Media]` | Media & Documents | Section navigation, media data, step completion |
| `[InspectionHome]` | Main Screen | Navigation to review, session state |
| `[ReviewSubmit]` | Review & Submit | Submission process, API calls, responses |

## Log Emojis

Logs use emojis for quick visual scanning:

- 🚀 **Start/Launch** - Inspection started, submission initiated
- 📝 **Data Update** - Form field changed, data written to store
- ✅ **Success/Complete** - Step completed, API success
- 🔄 **Navigation** - Moving between sections
- ➡️ **Direction** - Moving to next section/step
- 📊 **Data Display** - Current form data snapshot
- 📋 **Session Info** - Session state, appointment details
- 📤 **Outgoing** - Starting submission process
- 📥 **Incoming** - Fetching catalog, receiving data
- 🔧 **Processing** - Building payload, transforming data
- 📦 **Package** - Final payload ready to send
- 🌐 **Network** - API request details
- ❌ **Error** - Something went wrong
- ⚠️ **Warning** - Non-critical issue
- 🎉 **Celebration** - Final success
- 🏁 **Finish** - Process completed

## Example Flow

Here's what you'll see in the console during a typical inspection:

### 1. Starting Inspection
```
[InspectionStore] 🚀 Starting inspection for lead: {id: "...", car: {...}}
```

### 2. Filling Form Fields
```
[InspectionStore] 📝 Updating form data by key: basicVerification
[InspectionStore] ✅ Updated session for basicVerification: {...}
```

### 3. Moving Between Sections
```
[Step1] 🔄 Next button pressed
[Step1] ➡️ Moving to next section: vehicleDetails
```

### 4. Completing a Step
```
[Step1] ✅ Step 1 complete - proceeding to next step
[Step1] 📊 Current form data: {...}
[InspectionStore] ✅ Marking step complete: basicVerification
[InspectionStore] 📊 Progress: 1/6 steps completed
```

### 5. Navigating to Review
```
[InspectionHome] 📋 Navigating to Review & Submit screen
[InspectionHome] 📊 Current session state: {completedSteps: 6, totalSteps: 6, ...}
```

### 6. Submitting Inspection
```
[ReviewSubmit] 🚀 Submit button pressed - showing confirmation dialog
[ReviewSubmit] 📤 Starting submission process...
[ReviewSubmit] 📋 Session ID: "..."
[ReviewSubmit] 📋 Appointment ID: "..."
[ReviewSubmit] 📥 Fetching latest catalog...
[ReviewSubmit] ✅ Catalog fetched successfully
[ReviewSubmit] 📊 Raw form data: {...}
[ReviewSubmit] 🔧 Building final payload...
[ReviewSubmit] 📦 Final payload to submit: {...}
[ReviewSubmit] 🌐 Sending to API: POST /api/v1/forms/inspection-report/submit
[ReviewSubmit] ✅ API Response: {success: true, ...}
[ReviewSubmit] 🎉 Submission successful!
[InspectionStore] 🎉 Submitting inspection - marking as completed
[ReviewSubmit] 🏁 Submission process completed
```

## Filtering Logs

### In Chrome DevTools (React Native Debugger)
```javascript
// Show only submission logs
[ReviewSubmit]

// Show only store operations
[InspectionStore]

// Show only Step 2 (AC) logs
[Step2-AC]

// Show all errors
❌
```

### In VS Code Terminal (Metro Bundler)
Use Ctrl+F (Cmd+F on Mac) to search for specific prefixes.

## Debugging Tips

### 1. Track Form Data Changes
Search for `📝 Updating form data` to see every field change.

### 2. Verify Step Completion
Search for `✅ Marking step complete` to confirm steps are being marked as done.

### 3. Check API Payload
Search for `📦 Final payload to submit` to see exactly what's being sent to the API.

### 4. Debug API Errors
Search for `❌` to find all errors, or `[ReviewSubmit] ❌` for submission errors specifically.

### 5. Monitor Progress
Search for `📊 Progress:` to see step completion counts.

## Common Issues & Solutions

### Issue: No logs appearing
**Solution:** Make sure you have the React Native debugger connected or Metro bundler terminal visible.

### Issue: Logs are too verbose
**Solution:** Use the filter feature in your console to show only specific prefixes.

### Issue: Can't find submission payload
**Solution:** Search for `📦 Final payload to submit` - it will show the complete JSON structure.

### Issue: API call failing silently
**Solution:** Check for `[ReviewSubmit] ❌` logs which will show the error details.

## Production Considerations

⚠️ **Important:** These console logs are currently active in all environments. Before deploying to production, consider:

1. **Removing sensitive data** from logs (user info, tokens, etc.)
2. **Reducing log verbosity** in production builds
3. **Using a proper logging service** (Sentry, LogRocket, etc.) instead of console.log

To disable logs in production, you can wrap them:
```typescript
if (__DEV__) {
  console.log('[Component] Message');
}
```

## API Endpoint

All submissions go to:
```
POST https://inspection-backend-production-cdac.up.railway.app/api/v1/forms/inspection-report/submit
```

This is configured in `src/services/api/endpoints.ts`.
