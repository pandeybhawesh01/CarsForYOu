# API Configuration Update

## Changes Made

### 1. Updated Computer IP Address
**File:** `src/services/api/endpoints.ts`

**Old IP:** `192.168.1.37`
**New IP:** `172.16.143.120`

```typescript
export const API_BASE_URL = 'http://172.16.143.120:3002/api/v1';
```

## Why You See Catalog Endpoint Being Called

The submission flow is **working correctly**. Here's what happens when you submit:

### Submission Flow (ReviewSubmitScreen.tsx)
1. **Fetch Latest Catalog** → `GET /api/v1/forms/inspection-report/catalog?view=tree`
   - This is intentional and necessary
   - Gets the latest field definitions to properly type and validate the payload
   
2. **Build Final Payload** → Uses catalog to transform formData
   - Converts string numbers to actual numbers
   - Merges issues with extents into proper array format
   - Validates field types against catalog
   
3. **Submit Inspection** → `POST /api/v1/forms/inspection-report/submit`
   - Sends the final payload to the backend
   - This is the actual submission

### Why Both Endpoints Are Called
```typescript
// Step 1: Fetch catalog (line 130)
const latestCatalog = await catalogService.fetchCatalog();

// Step 2: Build payload using catalog (line 137)
const payload = buildFinalInspectionPayload(currentSession, latestCatalog);

// Step 3: Submit to backend (line 142)
const resp = await inspectionReportService.submit(payload);
```

## Troubleshooting Network Errors

### 1. Verify Backend Server is Running
```bash
# Make sure your backend is running on port 3002
# Check the terminal where you started the backend
```

### 2. Verify Computer IP
```bash
# Run this command to confirm your current IP
ipconfig
# Look for "Ethernet adapter Ethernet 3" → IPv4 Address
```

### 3. Verify Phone and Computer on Same Network
- Both devices must be on the same WiFi/network
- Computer IP: `172.16.143.120`
- Backend port: `3002`

### 4. Test Backend Accessibility
From your phone's browser, try:
```
http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
```

If this loads JSON, the backend is accessible.

### 5. Rebuild App with New IP
```bash
# Clear cache and restart
npm start -- --reset-cache

# In another terminal, rebuild Android
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

## Console Logs to Check

When you submit, you should see this sequence:

```
[ReviewSubmit] 🌐 Fetching latest catalog...
[CatalogService] 📥 Fetching catalog from: http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 🌐 GET http://172.16.143.120:3002/api/v1/forms/inspection-report/catalog?view=tree
[HTTP] 📡 Response: 200 OK
[ReviewSubmit] ✅ Catalog fetched successfully
[ReviewSubmit] 🔧 Building final payload...
[ReviewSubmit] 📦 Final payload to submit: {...}
[ReviewSubmit] 🌐 Sending to API: POST /api/v1/forms/inspection-report/submit
[HTTP] 📤 POST http://172.16.143.120:3002/api/v1/forms/inspection-report/submit
[HTTP] 📦 Payload: {...}
[HTTP] 📡 Response: 200 OK
[ReviewSubmit] ✅ API Response: {...}
[ReviewSubmit] 🎉 Submission successful!
```

## Common Issues

### Issue: "Network request failed"
**Cause:** Phone can't reach computer
**Fix:** 
- Verify both on same network
- Check firewall isn't blocking port 3002
- Try pinging computer from phone

### Issue: "Connection refused"
**Cause:** Backend not running or wrong port
**Fix:**
- Start backend server
- Verify it's listening on port 3002
- Check backend logs

### Issue: "Timeout"
**Cause:** Backend is slow or hung
**Fix:**
- Check backend terminal for errors
- Restart backend server
- Check database connection

## Next Steps

1. **Verify backend is running** on `http://172.16.143.120:3002`
2. **Test from phone browser** to confirm accessibility
3. **Rebuild app** with new IP address
4. **Check console logs** during submission to see exact error
5. **Share error logs** if issue persists

## Backend Server Commands

```bash
# Start backend (adjust based on your setup)
cd path/to/backend
npm start
# or
node server.js
# or
npm run dev
```

Make sure it shows:
```
Server listening on port 3002
```
