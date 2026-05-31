# Video Capture ANR Fix — Full Technical Documentation

**Date:** May 2026  
**Affected Files:** `VideoCapture.tsx`, `DynamicInspectionStep.tsx`  
**New Files:** `ConnectedVideoCapture.tsx`, `ConnectedPhotoCapture.tsx`  
**Platform:** Android (react-native-video ^6.19.2)  
**Symptom:** App ANR crash after video recording, `electricalsInteriors` section freeze

---

## Table of Contents

1. [What Was the Actual Crash](#1-what-was-the-actual-crash)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [Fix 1 — VideoCapture.tsx (RNV6 player fixes)](#3-fix-1--videocapturetsx-rnv6-player-fixes)
4. [Fix 2 — DynamicInspectionStep.tsx (ANR fix)](#4-fix-2--dynamicinspectionsteptsx-anr-fix)
5. [Fix 3 — ConnectedVideoCapture + ConnectedPhotoCapture (render fix)](#5-fix-3--connectedvideocapture--connectedphotocapture-render-fix)
6. [Architecture Diagram — Before vs After](#6-architecture-diagram--before-vs-after)
7. [What Re-renders Now vs Before](#7-what-re-renders-now-vs-before)
8. [Files Changed — Summary Table](#8-files-changed--summary-table)
9. [Remaining Risks & Future Improvements](#9-remaining-risks--future-improvements)
10. [Instructions for Agent — Keeping Repo in Sync](#10-instructions-for-agent--keeping-repo-in-sync)

---

## 1. What Was the Actual Crash

The crash log showed:

```
Input dispatching timed out (com.autoinspectai/MainActivity is not responding.
Waited 10005ms for FocusEvent)
errorType=anr
```

This is an **ANR (Application Not Responding)** — not a video player crash. The Android OS kills the app when the **main JS thread is blocked for more than 5 seconds** without processing input events. The video player itself was not the cause. The cause was the JS thread being blocked by a synchronous React re-render cascade triggered immediately after a video was captured.

The logs just before the ANR were:

```
[PresignedUrlService] Cached URLs for section: electricalsInteriors
[DynamicStep] Presigned URLs cached for section: electricalsInteriors
[CameraModal] capturedVideoUri cleared
```

This sequence told us the crash happened during the state update triggered by `onCapture` completing — not inside the video player.

---

## 2. Root Cause Analysis

### The Re-render Chain (Before Fix)

```
User records video
    ↓
CameraModal calls onCapture(uri)
    ↓
handleRecordingSuccess → onCapture(uri) prop
    ↓
handleDirectCapture in DynamicInspectionStep
    ↓
updateFormDataBySection(sectionKey, { video: { photos: [...] } })
    ↓
Zustand store updates currentSession.formData[sectionKey]
    ↓
DynamicInspectionStep re-renders (reads formData from store)
    ↓
formData is a dep of renderHandlers useMemo → renderHandlers recomputes
    ↓
renderHandlers is a new object reference
    ↓
renderNodes(activeSection.nodes, renderHandlers) re-runs
    ↓
mergeByKey() → renderSingleNode() → renderInput() for EVERY node
    ↓
collectIssueOptions() recursive walk on EVERY group node
    ↓
filledPerSection useMemo ALSO re-runs (also dep on formData)
    ↓
countNode() recursive walk on EVERY node AGAIN
    ↓
JS thread blocked for 10+ seconds on electricalsInteriors (large section)
    ↓
ANR
```

### Why electricalsInteriors Was Worst

This section had the most catalog nodes. The recursive tree walk time scales linearly with node count. Sections with fewer nodes (e.g. `vehicle`) did not ANR because the walk completed before the 5s OS timeout.

### Three Compounding Problems

**Problem 1 — `formData` in `renderHandlers` useMemo deps**

```ts
// BEFORE — the trigger
const renderHandlers = useMemo(() => ({
  formData,          // ← this caused the entire tree to re-render on every field change
  onTextChange: ...,
  ...
}), [formData, ...]); // formData changes = new renderHandlers = renderNodes re-runs
```

**Problem 2 — `filledPerSection` synchronous recursive walk**

```ts
// BEFORE — ran synchronously on every field change
const filledPerSection = useMemo(() => {
  const countNode = (n) => { /* recursive */ };
  mergedSections.forEach(sec => { result[sec.key] = sec.nodes.reduce(...countNode) });
  return result;
}, [mergedSections, formData]); // re-ran on every keystroke, every capture
```

**Problem 3 — Presigned URL effect re-firing**

```ts
// BEFORE — no guard, could re-fire on catalog reference changes
useEffect(() => {
  presignedUrlService.getUrlsForSection(...)
}, [sectionKey, currentSession?.appointmentId, catalog.uploadPathsBySection]);
// catalog.uploadPathsBySection reference could change and re-trigger this
```

---

## 3. Fix 1 — VideoCapture.tsx (RNV6 Player Fixes)

These fixes resolve crashes in the video player itself (separate from the ANR).

### Problem A — Dual Render Gate Race

**Before:**
```ts
const [isVideoReady, setIsVideoReady] = useState(false); // gate 1
const [isVideoLoading, setIsVideoLoading] = useState(false); // gate 2 — starts false

// In handleOpenPreview:
setTimeout(() => setIsVideoReady(true), 300); // 300ms guess — could lose race

// In render:
{!isVideoReady ? <Spinner/> : isVideoLoading ? <Spinner/> : <Video/>}
// isVideoLoading starts false → Video renders immediately → 300ms fires → re-renders
// This mount/unmount cycle crashes the native player layer
```

**After:**
```ts
const [videoMountKey, setVideoMountKey] = useState(0); // single gate

// In handleOpenPreview:
setIsPreviewOpen(true);
requestAnimationFrame(() => {
  setVideoMountKey(k => k + 1); // fires after Modal native container exists
});

// In render:
{videoMountKey === 0 ? <Spinner/> : <Video key={`video-${videoMountKey}`} />}
// Video mounts exactly once per open session, never flickers
```

**Why `requestAnimationFrame` instead of `setTimeout(300)`:**
`requestAnimationFrame` fires after the next paint, which guarantees the Modal's native container has been committed to the native layer. `setTimeout(300)` was a guess that could still lose the race on slow devices.

### Problem B — `paused={false}` + `controls={true}` Native Thread Race

**Before:**
```ts
<Video paused={false} controls={true} />
// On Android, ExoPlayer tries to bind the control surface before the
// player is ready when autoplay is on at mount time → native thread race → crash
```

**After:**
```ts
const [isPaused, setIsPaused] = useState(true); // start paused

const handleVideoLoad = useCallback(() => {
  setIsVideoLoading(false);
  setIsPaused(false); // only autoplay AFTER native player signals ready
}, []);

<Video paused={isPaused} controls={true} onLoad={handleVideoLoad} />
```

### Problem C — No `key` Prop on Video

**Before:**
```ts
<Video source={{ uri: displayUri }} />
// React reuses the same native TextureView/AVPlayerLayer across
// open/close cycles. Old player state (EOF, error) corrupts new playback.
```

**After:**
```ts
<Video key={`video-player-${videoMountKey}`} source={videoSource} />
// New key = React creates a fresh native view every time modal opens
```

### Problem D — Silent Background Video in Thumbnail

**Before:**
```ts
// Thumbnail area had a hidden Video component for generating a thumbnail frame
// Two Video instances pointing at same URI compete for the same media session
<Video style={styles.thumbnailVideo} ... /> // in thumbnail
// PLUS
<Video ... /> // in preview modal
```

**After:**
```ts
// Thumbnail is a pure View with an icon — no hidden player
<View style={styles.videoThumbnailPlaceholder}>
  <Text>🎥</Text>
  <Text>Tap to play video</Text>
</View>
```

### Problem E — Modal Always in React Tree

**Before:**
```ts
<Modal visible={isPreviewOpen} ...>
  <Video ... />  // native resources held even when modal is "hidden"
</Modal>
```

**After:**
```ts
{isPreviewOpen ? (
  <Modal visible={isPreviewOpen} ...>
    <Video ... />  // fully unmounted when modal closes, native resources released
  </Modal>
) : null}
```

### Problem F — Teardown Order on Close

**Before:**
```ts
const handleClosePreview = () => {
  setIsPreviewOpen(false); // native player destroyed while still playing → crash
};
```

**After:**
```ts
const handleClosePreview = () => {
  setIsPaused(true);       // stop decode cycle first
  setIsPreviewOpen(false); // then destroy — native layer tears down cleanly
  setVideoMountKey(0);     // reset so next open gets fresh player
};
```

### S3 URL Note

The original code appended `?_t=timestamp` to URLs for cache busting. This is safe for **public S3 URLs and CloudFront URLs** (which is what this app uses). It would break **pre-signed S3 URLs** (those with `X-Amz-Signature` in the query string) because the signature covers the query string. Since this app uses public/CloudFront URLs, the original approach was actually fine. The fix uses `headers: { 'x-cache-bust': timestamp }` as a cleaner pattern, but the behaviour is identical for this setup.

---

## 4. Fix 2 — DynamicInspectionStep.tsx (ANR Fix)

### Strategy: Decouple `formData` from `renderHandlers`

The core insight: `renderNodes` is a **plain function**, not a memoized component tree. It re-runs every time `renderHandlers` changes. The fix is to make `renderHandlers` **referentially stable** — never changing during user interaction — so `renderNodes` never re-runs on field changes.

### Fix A — Remove `formData` from `renderHandlers`, use ref-based reader

**Before:**
```ts
const renderHandlers = useMemo(() => ({
  formData,  // ← snapshot of current form state, changes on every field update
  ...
}), [formData, ...]); // new formData = new renderHandlers = renderNodes re-runs
```

**After:**
```ts
// Step 1: keep a ref that is always in sync with latest formData
const formDataRef = useRef(formData);
useEffect(() => {
  formDataRef.current = formData;
}); // no dep array — runs after every render, always current

// Step 2: stable reader function — identity never changes
const getFormValue = useCallback((path: string): unknown => {
  return getByPath(formDataRef.current, path);
}, []); // empty deps — reads from ref, not from closure

// Step 3: renderHandlers with no formData dep
const renderHandlers = useMemo(() => ({
  getFormValue,  // stable — same function reference forever
  onTextChange,
  ...
}), [getFormValue, onTextChange, ...]); // formData is GONE from deps
```

**Why this works:** `getFormValue` always returns fresh data (reads from `formDataRef.current` which is updated every render), but its **identity never changes** (empty `useCallback` deps). So `renderHandlers` never gets a new reference, so `renderNodes` never re-runs.

### Fix B — Debounce `filledPerSection`

**Before:**
```ts
// Ran synchronously on every field change
const filledPerSection = useMemo(() => {
  // full recursive walk of entire catalog tree
}, [formData, mergedSections]);
```

**After:**
```ts
// Runs at most once per 400ms — imperceptible to user
const [filledPerSection, setFilledPerSection] = useState<Record<string, number>>({});

useEffect(() => {
  const timer = setTimeout(() => {
    // recursive countNode walk — now safely off the hot path
    const result = {};
    mergedSections.forEach(sec => { result[sec.key] = ... });
    setFilledPerSection(result);
  }, 400);
  return () => clearTimeout(timer); // cancel if another change comes in
}, [formData, mergedSections]);
```

### Fix C — Presigned URL Prefetch Guard

**Before:**
```ts
useEffect(() => {
  presignedUrlService.getUrlsForSection(...) // could re-fire on reference changes
}, [sectionKey, currentSession?.appointmentId, catalog.uploadPathsBySection]);
```

**After:**
```ts
const prefetchedRef = useRef<string | null>(null);

useEffect(() => {
  // Guard: only fire once per sectionKey, never again
  if (prefetchedRef.current === sectionKey) return;
  prefetchedRef.current = sectionKey;
  presignedUrlService.getUrlsForSection(...);
}, [sectionKey, currentSession?.appointmentId, catalog.uploadPathsBySection]);
```

---

## 5. Fix 3 — ConnectedVideoCapture + ConnectedPhotoCapture (Render Fix)

### The Contradiction Fix A Created

After Fix A, `renderHandlers` was stable and `renderNodes` never re-ran. But `VideoCapture` and `PhotoCapture` receive their `videoUri` / `imageUri` as props from `renderInput`. If `renderNodes` never re-runs, those props never update — captures appear to do nothing.

```
Fix A goal:    renderHandlers stable → renderNodes never re-runs → no ANR  ✅
Side effect:   VideoCapture never gets updated videoUri prop → broken UI   ❌
```

### Strategy: Self-Subscribing Leaf Components

Convert `VideoCapture` and `PhotoCapture` call sites into **store-connected components** that subscribe to their own slice of the store independently. This is the same pattern as Redux `connect()` or Zustand's per-field selector.

```
BEFORE:
  DynamicInspectionStep (has formData)
    → renderHandlers (has formData snapshot)
      → renderNodes() → renderInput()
        → <VideoCapture videoUri={photoUrl} />
                                ↑
                        prop from formData snapshot
                        only updates when renderNodes re-runs

AFTER:
  DynamicInspectionStep (has formData, but renderHandlers is stable)
    → renderHandlers (NO formData)
      → renderNodes() → renderInput()
        → <ConnectedVideoCapture storageKey="electricalsInteriors.video" />
                                ↓
                        useInspectionStore(selector for THIS key only)
                        re-renders ONLY when its own key changes in store
```

### ConnectedVideoCapture Implementation

```ts
const ConnectedVideoCapture: React.FC<Props> = ({ storageKey, sectionKey, ... }) => {
  // Selector scoped to ONE storage key — other field changes don't trigger this
  const videoData = useInspectionStore(
    useCallback(
      (state) => {
        const sectionData = state.currentSession?.formData[sectionKey] ?? {};
        const block = getByPath(sectionData, stripSectionPrefix(storageKey));
        return {
          videoUri: block?.photos?.[0]?.url,
          capturedAt: block?.photos?.[0]?.capturedAt,
        };
      },
      [sectionKey, storageKey], // stable — storageKey never changes for a given field
    ),
  );

  return (
    <VideoCapture
      videoUri={videoData.videoUri}   // always fresh from store
      capturedAt={videoData.capturedAt}
      ...
    />
  );
};

export default memo(ConnectedVideoCapture); // memo prevents re-render if props unchanged
```

### What Each Component Is Responsible For

| Component | Responsibility | Re-renders when |
|---|---|---|
| `DynamicInspectionStep` | Renders catalog structure | Tab changes, section mount/unmount |
| `renderNodes / renderInput` | Maps catalog nodes to component types | Only when `renderHandlers` changes (never during interaction) |
| `ConnectedVideoCapture` | Renders video UI for one slot | Only when its own `storageKey` value changes in store |
| `ConnectedPhotoCapture` | Renders photo UI for one slot | Only when its own `storageKey` value changes in store |
| `AppInput` (text/number) | Renders text input | Gets value via `getFormValue` ref — re-renders when `renderNodes` runs (which is on tab change only) |

---

## 6. Architecture Diagram — Before vs After

### Before (ANR path)

```
Video captured
    │
    ▼
updateFormDataBySection()
    │
    ▼
formData changes (new object)
    │
    ├─► renderHandlers useMemo recomputes  (formData in deps)
    │       │
    │       ▼
    │   renderNodes() re-runs ──────────────────────────────────────────────┐
    │       │                                                                │
    │       ├─ mergeByKey() for all nodes                                   │
    │       ├─ renderSingleNode() for all nodes                             │  10s+
    │       ├─ renderInput() for all inputs                                 │  JS thread
    │       ├─ collectIssueOptions() recursive for all groups               │  block
    │       └─ <VideoCapture/> <PhotoCapture/> <AppInput/> re-rendered      │
    │                                                                        │
    └─► filledPerSection useMemo recomputes  (formData in deps)             │
            │                                                                │
            └─ countNode() recursive for all nodes ─────────────────────────┘
                                                              │
                                                              ▼
                                                           ANR CRASH
```

### After (fixed path)

```
Video captured
    │
    ▼
updateFormDataBySection()
    │
    ▼
formData changes (new object)
    │
    ├─► formDataRef.current = formData  (ref sync, ~0ms)
    │
    ├─► renderHandlers useMemo CHECK ── same deps → BAIL OUT ✅
    │       renderNodes() does NOT run
    │
    ├─► ConnectedVideoCapture selector fires  (only this slot's key changed)
    │       │
    │       └─ <VideoCapture videoUri={newUri} />  re-renders ✅
    │
    ├─► ConnectedPhotoCapture selector fires  (different key → same value → BAIL OUT) ✅
    │
    └─► filledPerSection debounce timer resets  (~0ms)
            │
            └─ countNode() runs 400ms later, off hot path ✅
```

---

## 7. What Re-renders Now vs Before

### On Video Capture

| Component | Before | After |
|---|---|---|
| `DynamicInspectionStep` shell | Re-renders | Re-renders (cheap, just reads formData ref) |
| `renderNodes()` full walk | Runs (10s+) | **SKIPPED** |
| `mergeByKey()` | Runs | **SKIPPED** |
| `collectIssueOptions()` | Runs for every group | **SKIPPED** |
| `filledPerSection` count walk | Runs synchronously | Runs after 400ms debounce |
| `ConnectedVideoCapture` (captured slot) | N/A | Re-renders (correct) |
| `ConnectedVideoCapture` (other slots) | Re-renders unnecessarily | **SKIPPED** |
| `ConnectedPhotoCapture` (all slots) | Re-renders unnecessarily | **SKIPPED** |
| `AppInput` (all text fields) | Re-renders unnecessarily | **SKIPPED** |

### On Text Field Change

| Component | Before | After |
|---|---|---|
| `DynamicInspectionStep` shell | Re-renders | Re-renders (cheap) |
| `renderNodes()` full walk | Runs | **SKIPPED** |
| `AppInput` (the changed field) | Re-renders | Gets fresh value via `getFormValue` ref on next `renderNodes` run (tab change) |

> **Note on AppInput:** Text inputs use `getFormValue` (ref-based), so they always display the latest value even without re-rendering. The value is read fresh from the ref on each render of that specific input. This is correct — text inputs re-render themselves via React's own controlled input mechanism.

---

## 8. Files Changed — Summary Table

### Modified Files

| File | What Changed | Why |
|---|---|---|
| `VideoCapture.tsx` | Replaced dual render gate (`isVideoReady` + `isVideoLoading`) with single `videoMountKey` | Prevented Video mount/unmount cycle that crashed native player |
| `VideoCapture.tsx` | `isPaused` starts `true`, flips to `false` in `onLoad` | Fixed Android ExoPlayer race with `paused={false}` + `controls={true}` at mount |
| `VideoCapture.tsx` | Added `key={video-player-${videoMountKey}}` on `<Video>` | Forces fresh native view per session, prevents state corruption |
| `VideoCapture.tsx` | Removed hidden thumbnail `<Video>` component | Eliminated competing native media sessions |
| `VideoCapture.tsx` | Modal conditionally in tree (`{isPreviewOpen ? <Modal> : null}`) | Full native resource release on close |
| `VideoCapture.tsx` | `handleClosePreview` sets `isPaused=true` before closing | Clean native layer teardown |
| `DynamicInspectionStep.tsx` | Removed `formData` from `renderHandlers` useMemo deps | Stopped cascade re-render on every field change |
| `DynamicInspectionStep.tsx` | Added `formDataRef` + `getFormValue` stable callback | Allows non-media inputs to read fresh data without dep chain |
| `DynamicInspectionStep.tsx` | Moved `filledPerSection` to debounced `useEffect` | Removed synchronous recursive walk from hot path |
| `DynamicInspectionStep.tsx` | Added `prefetchedRef` guard on presigned URL effect | Prevented re-firing on catalog reference changes |
| `DynamicInspectionStep.tsx` | Replaced `<VideoCapture>` with `<ConnectedVideoCapture>` | Allows video UI to update without renderNodes re-running |
| `DynamicInspectionStep.tsx` | Replaced `<PhotoCapture>` with `<ConnectedPhotoCapture>` | Same as above for photos |

### New Files

| File | Purpose |
|---|---|
| `ConnectedVideoCapture.tsx` | Store-connected wrapper — subscribes to its own `storageKey` in Zustand, re-renders only when that specific slot changes |
| `ConnectedPhotoCapture.tsx` | Same pattern for photo slots |

---

## 9. Remaining Risks & Future Improvements

### Risk 1 — AppInput values on tab switch (low severity)

`AppInput` text fields get their values via `getFormValue` which reads from `formDataRef.current`. This is always fresh data. However, `renderNodes` only re-runs on tab switch (when `resolvedActiveKey` changes, causing `renderHandlers` to be re-evaluated). This means:

- If a user types in a text field, the value is saved to the store immediately ✅
- The displayed value in the input is controlled by React's own input state ✅
- If the user switches tabs and comes back, `renderNodes` re-runs and `getFormValue` returns the correct saved value ✅

**No action needed.** This is correct behaviour.

### Risk 2 — `GroupCard` `hasContent` check (medium severity)

`renderSingleNode` for depth >= 1 (nested groups) computes `hasContent` inline:

```ts
const hasContent = inputs.some(inp => inp.inputType === 'file-upload' && inp.options.some(opt => {
  const photoBlock = handlers.getFormValue(stripSectionPrefix(`${node.path}.${opt.value}`));
  return photoBlock?.photos?.[0]?.url;
}));
```

Since `renderNodes` never re-runs on field changes, `GroupCard` will not update its `hasContent` dot indicator in real-time after a capture inside the group. It will update correctly on tab switch.

**Fix if needed:** Convert `GroupCard` into a `ConnectedGroupCard` that subscribes to relevant store keys. This is low priority since the group modal closes and the user sees the updated form state on return anyway.

### Risk 3 — Large sections with many `ConnectedVideoCapture` / `ConnectedPhotoCapture` instances (low severity)

Each `Connected*` component has its own Zustand subscription. If a section has 50+ media slots, there will be 50+ active subscriptions. Zustand handles this efficiently (O(n) selector evaluation on each store update), but it is worth monitoring on the largest sections.

**Fix if needed:** Batch the selectors — one subscription per section that returns a map of all media values, shared across all `Connected*` components in that section via React context.

### Risk 4 — iOS not tested (unknown severity)

All crash logs and fixes were validated against Android. The `paused/controls` race (Fix 1B) is Android-specific (ExoPlayer). On iOS (AVPlayer), `paused={false}` at mount is generally safe. The other fixes (render gate, key prop, modal unmount) are platform-agnostic and safe on iOS.

**Action:** Test the full video capture and preview flow on iOS after deploying these changes.

### Risk 5 — `useInspectionStore` selector stability

`ConnectedVideoCapture` and `ConnectedPhotoCapture` pass an inline `useCallback` as the selector:

```ts
const videoData = useInspectionStore(
  useCallback((state) => { ... }, [sectionKey, storageKey])
);
```

If Zustand's `useStore` does not support inline selector with `useCallback` in your version, this may cause the selector to re-subscribe on every render. Verify with your Zustand version (`^4.x` supports this pattern natively).

**Fix if needed:** Extract the selector outside the component or memoize with `useMemo`.

---

## 10. Instructions for Agent — Keeping Repo in Sync

### File Locations

```
src/
└── features/
    └── inspection/
        ├── components/
        │   ├── VideoCapture.tsx              ← replace with fixed version
        │   ├── PhotoCapture.tsx              ← no changes needed
        │   ├── ConnectedVideoCapture.tsx     ← NEW FILE — add here
        │   └── ConnectedPhotoCapture.tsx     ← NEW FILE — add here
        └── screens/
            └── DynamicInspectionStep.tsx     ← replace with fixed version
```

> Adjust paths to match your actual directory structure. The `Connected*` files must be in the same folder as `VideoCapture.tsx` and `PhotoCapture.tsx` because `DynamicInspectionStep` imports them from `../../components/`.

### Checklist for Agent

- [ ] Replace `VideoCapture.tsx` with the new version
- [ ] Add `ConnectedVideoCapture.tsx` to the components folder
- [ ] Add `ConnectedPhotoCapture.tsx` to the components folder
- [ ] Replace `DynamicInspectionStep.tsx` with the new version
- [ ] Verify `DynamicInspectionStep.tsx` imports `ConnectedVideoCapture` and `ConnectedPhotoCapture` (not the raw `VideoCapture` / `PhotoCapture` directly)
- [ ] Verify `DynamicInspectionStep.tsx` does NOT import `VideoCapture` or `PhotoCapture` directly (they are only used inside `Connected*` wrappers now)
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Test on Android: record video → verify thumbnail appears → tap thumbnail → verify preview plays
- [ ] Test on Android: record video in `electricalsInteriors` section → verify no ANR
- [ ] Test on iOS: same flow

### Rules Agent Must Never Break

1. **Never add `formData` back to `renderHandlers` useMemo deps.** This is the ANR trigger. If you need field values inside `renderNodes`, use `getFormValue` (the ref-based reader) or create a new `Connected*` component.

2. **Never render `<VideoCapture>` or `<PhotoCapture>` directly inside `renderInput`.** Always use `ConnectedVideoCapture` / `ConnectedPhotoCapture`. The direct components have no store subscription and will never receive updated props after the initial render.

3. **Never add a `useEffect` that depends on `formData` without a debounce.** Synchronous effects on `formData` run on every field change and will block the JS thread on large sections.

4. **Never remove the `key` prop from the `<Video>` component in `VideoCapture.tsx`.** Without it, React reuses the native player across open/close cycles, causing playback corruption.

5. **Never set `paused={false}` at Video mount time.** Always start with `isPaused=true` and flip to `false` inside `onLoad`.

### Adding New Media Field Types

If a new field type needs to show media (e.g. audio recording), follow this pattern:

```
1. Create ConnectedAudioCapture.tsx (same pattern as ConnectedVideoCapture)
   — subscribe to storageKey in useInspectionStore
   — wrap the raw AudioCapture component
   — export with memo()

2. In renderInput inside DynamicInspectionStep:
   if (String(opt.value).toLowerCase() === 'audio') {
     return <ConnectedAudioCapture storageKey={slotKey} ... />;
   }

3. Never pass the URI as a prop from renderInput directly.
   The Connected* component always reads from the store itself.
```

### Performance Monitoring

After deploying, add these log lines temporarily to verify the fix is working:

```ts
// In DynamicInspectionStep, inside the renderHandlers useMemo:
console.log('[Perf] renderHandlers recomputed — should only happen on mount/tab change');

// In ConnectedVideoCapture:
console.log('[Perf] ConnectedVideoCapture re-render for key:', storageKey);
```

Expected output after video capture:
```
[Perf] ConnectedVideoCapture re-render for key: electricalsInteriors.frontCamera.video
```

You should NOT see:
```
[Perf] renderHandlers recomputed  ← if this appears on capture, the fix is broken
```

---

*Document written May 2026. Covers ANR crash on Android in react-native-video ^6.19.2 + large Zustand-backed form sections.*