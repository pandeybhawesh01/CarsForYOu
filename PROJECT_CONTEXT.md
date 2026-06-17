# Cars24 Inspection App - Project Context

This file is the single source of truth for the inspection app, media capture behavior, and the fixes that were documented in the deleted markdown files.

## Catalog-Driven UI Rules

All inspection step screens are rendered from the catalog API:
`GET /api/v1/forms/inspection-report/catalog?view=tree`

### API Schema

Each catalog node contains:
- `type`: `group` or `field`
- `key`: shared identifier, merged by key when siblings repeat
- `label`: display label, sometimes with `/` separators
- `path`: storage path such as `vehicleDetails.chassisEmbossing`
- `inputs[]`: array of `{ inputType, dataType, allowsMultiple, options[] }`
- `children[]`: nested nodes

### Rendering Rules

- Depth 0 groups render inline as the step sections themselves.
- Nested groups render as tappable `GroupPhotoCard` entries.
- For file uploads, `field` nodes render `PhotoCapture` or `VideoCapture` directly.
- For nested `group` nodes, use `GroupPhotoCard` and open `InspectionImageDetailPanel`.
- `select` + `BOOLEAN` uses `ChipSelector` with Yes/No labels.
- `select` + `STRING` uses `ChipSelector` with option labels.
- `multi-select` uses `MultiSelectChips`.
- `text` or `number` with options renders one input per option.
- `text` or `number` without options renders a single `AppInput`.

### File Upload Label Rules

- If the option label is `image`, render `PhotoCapture` using the node label.
- If the option label is `video`, render `VideoCapture` using the node label.
- Otherwise, use the option label itself such as `RC Front` or `Front Main`.

### Conditional Sub-Options

- Some `select` options carry `subOptions1`.
- When the option is selected, render its sub-options beneath the chip selector.
- `file-upload` sub-options use `PhotoCapture` or `VideoCapture` based on the sub-option label.
- The storage path becomes `${nodePath}.${sub.value}`.
- `multi-select` sub-options use `MultiSelectChips` with `subOptions2` choices.
- This is used for conditional media capture, such as sunroof or music system follow-up uploads.

### Same-Key Merging

- Nodes with the same `key` at the same level are merged.
- At depth 0, merged nodes render inline under one tab.
- At depth 1 or deeper, merged nodes render as one `GroupPhotoCard`.

### Tab Bar

- Top-level groups become horizontal tabs.
- The tab bar appears only when there are at least two top-level sections.
- Each tab shows a badge for filled fields.

### Section to Step Mapping

| Step | File | Section key | `InspectionStepId` |
|------|------|-------------|-------------------|
| 1 | `Step1_BasicVerification.tsx` | `vehicle` | `BasicVerification` |
| 2 | `Step4_Engine.tsx` | `engineTransmission` | `Engine` |
| 3 | `Step2_AirConditioning.tsx` | `airConditioning` | `Exterior` |
| 4 | `Step3_Interior.tsx` | `steeringBrakes` | `Interior` |
| 5 | `Step5_ElectricalsInteriors.tsx` | `electricalInteriors` | `Documents` |
| 6 | `Step6_Media.tsx` | `exterior` | `Media` |

### Data Storage

- Form data is stored in `InspectionStore` via `updateFormData(stepId, { [path]: value })`.
- Photo details are stored in `media.documentPhotoDetails` keyed by slot path such as `carImages.frontMain`.
- Direct captures are stored as `{ photos: [uri], status: 'good' }`.

## Media Capture Implementation

The app uses `react-native-vision-camera` v4 for real device photo and video capture.

### Component Stack

Inspection step -> `PhotoCapture` / `VideoCapture` -> `CameraModal` -> `CameraPreview` -> `CameraControls` -> `CameraService` -> `PermissionService`

### PhotoCapture

- File: `src/features/inspection/components/PhotoCapture.tsx`
- Handles photo capture UI and thumbnail preview.
- Props: `label`, `imageUri`, `onCapture`, `isRequired`, `hint`.

### VideoCapture

- File: `src/features/inspection/components/VideoCapture.tsx`
- Handles video recording UI and preview flow.
- Props: `label`, `videoUri`, `onCapture`, `isRequired`, `hint`.
- After recording, the UI shows a thumbnail preview, a Preview action, and a Re-record action.
- The full-screen preview includes play and pause controls plus Keep Video and Re-record buttons.

### CameraModal

- File: `src/features/camera/components/CameraModal.tsx`
- Full-screen camera UI for both photo and video modes.
- Manages permissions, initialization, recording, and errors.

### CameraPreview

- File: `src/features/camera/components/CameraPreview.tsx`
- Wraps the Vision Camera component.
- Must enable the right capabilities for the mode.

Required flags:

```typescript
<Camera
  photo={mode === 'photo' || mode === 'video'}
  video={mode === 'video'}
  audio={mode === 'video'}
/>
```

### CameraService

- File: `src/features/camera/services/CameraService.ts`
- `capturePhoto(camera, options)` captures photos.
- `startRecording(camera, onFinished, onError)` starts video recording.
- `stopRecording(camera)` stops the current recording.

### PermissionService

- File: `src/features/camera/services/PermissionService.ts`
- Handles camera and microphone permission requests.

### Dependencies

- `react-native-vision-camera`: `^4.6.0`
- `react-native-video`: `^6.7.3`

### Android Permissions

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Photo Capture Fix

The photo capture bug was caused by the camera being initialized without the required capability flags.

### Root Cause

- `photo={true}` was missing for photo capture.
- `video={true}` and `audio={true}` were missing for video recording.

### Fix

- `CameraPreview` now accepts a `mode` prop.
- In photo mode, it enables `photo={true}`.
- In video mode, it enables `photo={true}`, `video={true}`, and `audio={true}`.
- `CameraModal` passes the mode through to `CameraPreview`.

### Result

- Photo capture works again.
- Video recording initializes correctly on real devices.

## Video Preview Implementation

The video capture flow now lets users review what they recorded before keeping it.

### Behavior

- After recording, the component shows a video thumbnail of the first frame.
- The user can open a full-screen preview.
- The preview includes play and pause controls.
- The user can keep the clip or re-record it.

### User Flow

1. Tap `Tap to record`.
2. Record a video.
3. Review the thumbnail preview.
4. Open Preview to watch the full clip.
5. Choose Keep Video or Re-record.

## Inspection Step Usage

All six inspection steps use `PhotoCapture` and `VideoCapture` when the catalog returns `file-upload` inputs.

- If the label contains `image`, render `PhotoCapture`.
- If the label contains `video`, render `VideoCapture`.
- This works across Basic Verification, Air Conditioning, Interior, Engine, Electricals and Interiors, and Media.

## Testing and Validation

### Photo and Video Checks

- Verify photo capture on a real device.
- Verify video recording on a real device.
- Confirm the video thumbnail appears after recording.
- Confirm preview playback works.
- Confirm re-record replaces the previous media.
- Confirm permission prompts appear when access is missing.

### Rebuild After Camera Changes

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Useful Diagnostics

```bash
npx tsc --noEmit
npm run lint
```

## Important Notes

- Use a physical device for camera testing.
- Emulator camera support is limited.
- Camera features require permissions and free storage.
- Video files are saved to device cache as MP4 using H.264.
- Photos are saved to device cache as JPEG.

## File Locations

- Catalog service: `src/services/api/catalogService.ts`
- Catalog view model: `src/viewmodels/catalogViewModel.ts`
- Photo capture component: `src/features/inspection/components/PhotoCapture.tsx`
- Video capture component: `src/features/inspection/components/VideoCapture.tsx`
- Camera modal: `src/features/camera/components/CameraModal.tsx`
- Camera preview: `src/features/camera/components/CameraPreview.tsx`
- Camera service: `src/features/camera/services/CameraService.ts`
- Permission service: `src/features/camera/services/PermissionService.ts`

## Legacy Notes Kept From Deleted Docs

- Top-level navigation starts at `MainTabs` during debugging.
- Shared rendering helpers remain local to each step screen to avoid cross-screen coupling.
- The Android build fixes removed incompatible nitro modules and adjusted Vision Camera Kotlin compatibility.
- `VIDEO_CAPTURE_SUMMARY.txt` remains as a non-markdown reference file.
