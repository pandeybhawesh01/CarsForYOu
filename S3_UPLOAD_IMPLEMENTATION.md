# S3 Presigned URL Upload Implementation

## 📋 Overview

This document describes the S3 presigned URL upload system implemented for the CarsForYou inspection app.

---

## 🎯 Key Features

1. **Automatic Upload on "Use Photo/Video"** - Upload happens when user confirms capture
2. **Backend-Controlled Expiry** - Uses `expiresAt` timestamp from backend
3. **Section-Level Caching** - Caches presigned URLs per section
4. **Progress Tracking** - Shows upload progress percentage
5. **Error Handling** - Retry button on upload failure
6. **Clean FormData** - Only S3 URLs stored, never local URIs

---

## 📁 Files Created/Modified

### **New Files Created:**

1. **`src/services/api/presignedUrlService.ts`**
   - Manages presigned URL fetching and caching
   - Uses backend's `expiresAt` for expiry tracking
   - Section-level cache with automatic refetch on expiry

2. **`src/utils/s3Upload.ts`**
   - Handles file upload to S3 using presigned URLs
   - Progress tracking with percentage
   - Local file deletion after successful upload

### **Modified Files:**

3. **`src/services/api/endpoints.ts`**
   - Added `PRESIGNED_UPLOAD` endpoint

4. **`src/services/api/types.ts`**
   - Added `uploadPath?: string` to `CatalogInput` interface

5. **`src/features/camera/types/index.ts`**
   - Added upload parameters to `CameraModalProps`:
     - `uploadPath?: string`
     - `sectionKey?: string`
     - `appointmentId?: string`

6. **`src/features/camera/components/CameraModal.tsx`**
   - Added upload state management
   - Integrated S3 upload on "Use Photo/Video" button click
   - Shows upload progress and error handling
   - Falls back to local URI if upload params not provided

7. **`src/features/inspection/components/PhotoCapture.tsx`**
   - Added upload parameters to props
   - Passes parameters to CameraModal

8. **`src/features/inspection/components/VideoCapture.tsx`**
   - Added upload parameters to props
   - Passes parameters to CameraModal

9. **`src/features/inspection/screens/steps/DynamicInspectionStep.tsx`**
   - Updated `RenderHandlers` interface with `sectionKey` and `appointmentId`
   - Extracts `uploadPath` from catalog input
   - Passes upload parameters to PhotoCapture/VideoCapture components

---

## 🔄 Upload Flow

```
1. User enters section (e.g., "Electricals Interiors")
   ↓
2. DynamicInspectionStep mounts
   ↓
3. Extract all uploadPaths from section catalog
   ↓
4. Call presignedUrlService.getUrlsForSection() in background
   ↓
5. Backend returns presigned URLs with expiresAt timestamps
   ↓
6. URLs cached in memory (section-level cache)
   ↓
7. User taps placeholder → Camera opens
   ↓
8. User captures photo/video
   ↓
9. Preview screen shows with local URI
   ↓
10. User clicks "Use Photo/Video" button
    ↓
11. CameraModal calls presignedUrlService.getUrlForPath()
    ↓
12. Service returns CACHED URL (no API call needed!)
    ↓
13. Upload to S3 starts with progress tracking
    ↓
14. Preview shows "Uploading... X%" with spinner
    ↓
15. Upload to S3 completes
    ↓
16. Save S3 URL to FormData: { photos: [{ url, capturedAt: timestamp }] }
    ↓
17. Delete local file
    ↓
18. Preview closes automatically
    ↓
19. Placeholder shows image from FormData (S3 URL)
```

---

## 💾 Data Structure

### **FormData (Redis/Backend)**
```typescript
{
  "electricalsInteriors": {
    "Doors": {
      "frontLeftWindow": {
        "Image": {
          "photos": [
            {
              "url": "https://files.carswipe.in/...",  // S3 URL only
              "capturedAt": 1748364301000  // Unix timestamp in milliseconds
            }
          ]
        }
      }
    }
  }
}
```

### **Presigned URL Cache**
```typescript
{
  "electricalsInteriors": {
    "urls": {
      "electricalsInteriors/Doors/frontLeftWindow/image": {
        "uploadUrl": "https://s3.amazonaws.com/...",
        "fileUrl": "https://files.carswipe.in/...",
        "expiresAt": 1779916839823  // Backend timestamp
      }
    },
    "fetchedAt": 1779913239823
  }
}
```

---

## 🔧 API Integration

### **Presigned URL Request**
```bash
POST /api/v1/media/presign-upload
Headers: X-API-Key: {{token}}
Body: {
  "appointmentId": "APT-9001",
  "files": [
    {
      "fileName": "electricalsInteriors_Doors_frontLeftWindow_image.jpg",
      "contentType": "image/jpeg",
      "visibility": "public",
      "folder": "car-images"
    }
  ]
}
```

### **Presigned URL Response**
```json
{
  "success": true,
  "message": "Presigned upload URLs generated",
  "data": {
    "files": [
      {
        "key": "inspections-dev/car-images/public/28-05-2026/APT-9001/insp-1/front.jpg",
        "uploadUrl": "https://s3.amazonaws.com/...",
        "fileUrl": "https://files.carswipe.in/...",
        "expiresAt": 1779916839823
      }
    ]
  }
}
```

---

## 📊 Cache Strategy

### **When to Fetch**
- On section mount (optional - can be lazy)
- On first photo/video capture in section
- When cached URL is expired

### **Expiry Check**
```typescript
const now = Date.now();
const isExpired = now >= cachedUrl.expiresAt;
```

### **Refetch Logic**
- If ANY URL in section is expired → Refetch entire section
- If URL is missing → Fetch just that path
- Backend controls TTL via `expiresAt` timestamp

---

## 🎨 UI States

### **Preview Screen States**

| State | Display | Button |
|-------|---------|--------|
| **Captured** | Local URI | "Use Photo/Video" / "Retake" |
| **Uploading** | Local URI + Spinner | "Uploading... X%" (disabled) |
| **Success** | Auto-close | None |
| **Error** | Local URI + Error | "Retry" / "Cancel" |

### **Placeholder States**

| State | Display | Source |
|-------|---------|--------|
| **Empty** | Camera icon | None |
| **Uploaded** | Image preview | FormData S3 URL |

---

## ⚠️ Error Handling

### **Upload Failure**
- Shows error message in preview
- Keeps local URI for retry
- "Retry" button triggers upload again
- "Cancel" button closes modal without saving

### **Presigned URL Fetch Failure**
- Throws error with message
- Can be caught and displayed to user
- Retry mechanism available

### **Network Offline**
- Upload will fail with network error
- User can retry when online
- Local file preserved until successful upload

---

## 🧪 Testing Checklist

- [ ] Photo capture and upload
- [ ] Video capture and upload
- [ ] Upload progress display
- [ ] Upload error and retry
- [ ] Cache hit (no refetch)
- [ ] Cache miss (refetch)
- [ ] Cache expiry (refetch)
- [ ] Multiple photos in same section
- [ ] FormData only contains S3 URLs
- [ ] Local files deleted after upload
- [ ] Placeholder shows S3 URL after upload
- [ ] Reload from Redis shows S3 URL

---

## 🚀 Next Steps

1. Test with real backend API
2. Add offline queue for failed uploads
3. Add retry logic with exponential backoff
4. Add upload analytics/monitoring
5. Optimize cache invalidation strategy
6. Add section-level prefetch on mount (optional)

---

## 📝 Notes

- **No local URIs in FormData** - Clean separation of concerns
- **Backend controls expiry** - Simpler client logic
- **Section-level caching** - Efficient batch operations
- **Automatic cleanup** - Local files deleted after upload
- **Graceful degradation** - Works without upload params (returns local URI)

---

**Implementation Date:** May 28, 2026  
**Status:** ✅ Complete - Ready for Testing
