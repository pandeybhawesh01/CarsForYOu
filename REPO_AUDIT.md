# Full Repo Audit — Faults & Corrections

**Date:** 29 May 2026
**Scope:** Full scan of `src/**` plus `App.tsx`, cross-checked against `fix.md`, `PROJECT_CONTEXT.md`, `COMPLETE_WORKFLOW_ANALYSIS.md`, `MEDIA_PREVIEW_ENHANCEMENTS.md`, `PRESIGNED_URL_OPTIMIZATION_STRATEGY.md`, `IMPLEMENTATION_COMPLETE.md`.
**Verdict:** The ANR fix in `fix.md` is correctly implemented at the leaf level (`Connected*` components, stable `renderHandlers`, debounced `filledPerSection`). But several **upstream patterns silently undo the optimisation**, plus there are crash bugs, dead code, security issues, and architecture drift.

This document is the single source of truth for what to fix and how. Issues are grouped by severity and ordered by impact.

---

## How to read this doc

Each entry has:

- **Where:** file path + line numbers
- **What's wrong:** the bug or anti-pattern
- **Why it matters:** the user-visible or system-level consequence
- **Fix:** exact code change
- **fix.md link:** does this conflict with the documented architecture rules?

---

# 0. Storage Architecture — Assessment

The repo has 5 storage tiers. The shape is right; the implementation has gaps.

| Tier | What it holds | Persistence | Source of truth? |
|---|---|---|---|
| Zustand `useInspectionStore` | live form data, current lead | RAM only | No (Redis is) |
| Zustand `useCatalogViewModel` | runtime catalog mirror | RAM only | No (backend is) |
| AsyncStorage `catalogCache` | catalog tree + version | Persistent (24 h TTL) | Cache only |
| AsyncStorage (other) | nothing else (drafts go to Redis) | — | — |
| Backend Redis | inspection drafts | Persistent | Yes (cross-device) |
| S3 | media files (photos/videos) | Persistent | Yes |
| Firebase | auth user | Persistent | Yes |

**What's good:**
- Right data in right tier — no accidental duplication of authority.
- Zustand deliberately not persisted — avoids multi-user data leak and stale-form-on-version-bump problems.
- Catalog cache uses backend version for invalidation (admin can force every device to refresh).
- Media goes only to S3; Zustand only stores URLs (Zustand doesn't bloat).

**What's broken (full details below):**

| ID | Issue | Severity |
|---|---|---|
| C-5 | Presigned-URL cache leaks across appointments | CRITICAL |
| M-9 | Logout doesn't clear any cache (Zustand, AsyncStorage, presigned) | MEDIUM (multi-user leak) |
| C-4 | Catalog can be `null` mid-render, crashes pre-load | CRITICAL |
| H-14 | Catalog cache provides no real offline benefit (always hits network) | HIGH |
| M-15 | AsyncStorage read twice per fetch (`getVersion` + `get`) | MEDIUM |
| H-20 | `isValidCatalog` hardcoded to legacy section names — fixed | HIGH (FIXED) |
| H-21 | PresignedUrlService cache is in-memory only — wasted refetch | HIGH |
| H-22 | No offline queue for failed writes (drafts, submit, S3) | HIGH |
| H-23 | No data-version migration for AsyncStorage entries | MEDIUM |
| M-10 | Auto-save shape mismatch between interval and `saveNow` | MEDIUM |
| H-24 | No MMKV — can't synchronously hydrate Zustand on cold start | LOW |

**Storage architecture grade:** **B** (good design, several execution gaps).

After fixing the items above (especially C-5, M-9, C-4, H-14, H-20, H-22), the grade goes to **A−**. There's no need to add MMKV or persist Zustand right now; the current shape will scale once the bugs are out.

---

# 1. CRITICAL — fix immediately

These cause crashes, ANR, security issues, or undo the existing performance work.

## C-1. Whole-store destructuring re-renders every screen on every store change

This is the single biggest hidden problem in the repo. It silently undoes the entire ANR fix at the *parent* level.

**Where**

| File | Line | Code |
|---|---|---|
| `src/features/inspection/screens/steps/DynamicInspectionStep.tsx` | 543 | `const { currentSession, updateFormDataBySection, markStepCompleteByKey } = useInspectionStore();` |
| `src/features/inspection/screens/InspectionHomeScreen.tsx` | 62 | `const { currentLead, currentSession } = useInspectionStore();` |
| `src/features/inspection/screens/InspectionStepScreen.tsx` | 26 | `const { currentSession } = useInspectionStore();` |
| `src/features/inspection/screens/LeadDetailsScreen.tsx` | 80 | `const { currentLead, startInspection } = useInspectionStore();` |
| `src/features/inspection/screens/ReviewSubmitScreen.tsx` | 94 | `const { currentLead, currentSession, submitInspection } = useInspectionStore();` |
| `src/features/inspection/screens/InspectionSuccessScreen.tsx` | 16 | `const { currentLead, currentSession, resetInspection } = useInspectionStore();` |
| `src/features/dashboard/screens/DashboardScreen.tsx` | 41 | `const { setCurrentLead } = useInspectionStore();` |

**What's wrong**
Calling `useInspectionStore()` with no selector returns the *full state* on every store mutation. Zustand v5 removed the `equalityFn` second argument — so any field change anywhere in the store re-renders this component. On `DynamicInspectionStep`, that means every keystroke and every photo capture re-renders the parent shell, which re-derives `formData = (currentSession?.formData[sectionKey] ?? {})` (a new `{}` reference on every render), which invalidates downstream effects.

**Why it matters**
The whole point of the `Connected*` pattern from `fix.md` is "subscribe to the smallest slice". The parent shell currently subscribes to the *entire* store, defeating it. Combined with C-2 below, this resets the `filledPerSection` debounce on every render and forces every Connected child to re-evaluate its selector unnecessarily.

**Fix**
Replace whole-store destructures with scoped selectors. Each call returns a single primitive or stable function reference; component re-renders only when *that* slice changes.

```ts
// BEFORE
const { currentSession, updateFormDataBySection, markStepCompleteByKey } =
  useInspectionStore();

// AFTER
const currentSession        = useInspectionStore(s => s.currentSession);
const updateFormDataBySection = useInspectionStore(s => s.updateFormDataBySection);
const markStepCompleteByKey   = useInspectionStore(s => s.markStepCompleteByKey);
```

Action references are stable (Zustand never replaces them), so those subscriptions never fire updates after mount. The component then re-renders only when `currentSession` itself is replaced.

For grouped reads where you genuinely need multiple primitives at once, install `zustand` shallow helper:

```ts
import { useShallow } from 'zustand/react/shallow';

const { currentLead, currentSession } = useInspectionStore(
  useShallow(s => ({ currentLead: s.currentLead, currentSession: s.currentSession }))
);
```

**fix.md:** Violates the spirit of fix.md §5 (subscribe to single slice). This is the most important rule, and it's currently broken at every screen.

---

## C-2. `formData` literal `?? {}` creates new reference every render → `filledPerSection` debounce never settles

**Where:** `DynamicInspectionStep.tsx:552, 615`

```ts
// 552
const formData = (currentSession?.formData[sectionKey] ?? {}) as Record<string, unknown>;
...
// 615
}, [formData, mergedSections]);
```

**What's wrong**
`(... ?? {})` returns a brand-new `{}` on every render where the section is undefined. And once C-1 is in play, the `currentSession` reference is replaced on every store mutation, so `currentSession.formData[sectionKey]` is a new reference too. The `useEffect` deps change every render. The debounced `setTimeout` is cleared and restarted forever — the count never updates while the user is interacting; it only settles after they stop completely.

**Why it matters**
- Filled count badge in the tab bar lags badly during interaction.
- Wasted timer churn on the hot path.

**Fix**
Use a scoped selector that returns a stable reference (only changes when the section's data actually changes), and stop using `?? {}` in the dep position.

```ts
const sectionFormData = useInspectionStore(
  s => s.currentSession?.formData[sectionKey],
);
const formData = sectionFormData ?? EMPTY_OBJ;   // module-level const

// effect deps
}, [sectionFormData, mergedSections]);
```

`EMPTY_OBJ` is a single shared `Object.freeze({})` defined at module scope — it always has the same identity.

**fix.md:** Adjacent to rule 3. The debounce exists, but reference instability defeats it.

---

## C-3. `useEffect` without dep array writes a ref every render

**Where:** `DynamicInspectionStep.tsx:562-565`

```ts
useEffect(() => {
  formDataRef.current = formData;
}); // no dep array — runs every render
```

**What's wrong**
The effect runs *after commit*. So when `renderNodes` runs *during* that render and calls `getFormValue(...)`, the ref still points at the **previous** render's data. For one frame, every text/select/chip input shows stale data. With fast typing, the displayed value can lag by one keystroke.

**Why it matters**
- Visible input lag.
- The effect fires on every render which is wasted work.

**Fix**
Refs are not state — it's safe to assign synchronously in render. Or use `useLayoutEffect` with the right dep so it commits before paint.

```ts
// Option 1 — simplest, fastest
formDataRef.current = formData;          // in render body, no useEffect

// Option 2 — useLayoutEffect with deps
useLayoutEffect(() => {
  formDataRef.current = formData;
}, [formData]);
```

**fix.md:** Implementation detail of fix.md §4 — fix.md shows the same buggy snippet. Update fix.md after the change so future reviewers don't restore the bug.

---

## C-4. Catalog null-deref crashes the app pre-load

**Where (selected)**

| File | Line | Code |
|---|---|---|
| `DynamicInspectionStep.tsx` | 547, 624 | `catalog.uploadPathsBySection?.[sectionKey]` |
| `InspectionStepScreen.tsx` | 38 | `const sections = catalog.sections;` |
| `LeadDetailsScreen.tsx` | 88 | `if (!catalog.sections || ...)` (already null-deref'd) |
| `InspectionHomeScreen.tsx` | 67-71 | passes `catalog` to `useAutoSaveDraft` even when null |
| `useAutoSaveDraft.ts` | 45 | calls `buildFinalInspectionPayload(session, catalog)` |
| `buildFinalInspectionPayload.ts` | 60-63 | reads `catalog.fieldsByPath[...]` |

**What's wrong**
`useCatalogViewModel(s => s.catalog)` returns `NormalisedCatalog | null`. The screens above dereference it without a null guard. If a user opens the app on a slow network and taps a card before catalog finishes loading, the app crashes.

**Why it matters**
Cold-start crash, especially on bad networks or right after a forced cache invalidation.

**Fix**
Two acceptable patterns — pick one and apply consistently:

**Pattern A — default-empty catalog (preferred):**
```ts
// catalogViewModel.ts
const EMPTY_CATALOG: NormalisedCatalog = {
  sections: [], fieldsByPath: {}, uploadPathsBySection: {}, /* ... */
};
export const selectCatalog = (s: CatalogState) => s.catalog ?? EMPTY_CATALOG;
```

**Pattern B — explicit null guard at every consumer:**
```ts
const catalog = useCatalogViewModel(s => s.catalog);
if (!catalog) return <LoadingScreen />;
```

Also tighten `useAutoSaveDraft`'s prop type to `NormalisedCatalog | null` and skip when null.

**fix.md:** Not covered.

---

## C-5. Presigned-URL cache leaks across appointments

**Where:** `src/services/api/presignedUrlService.ts:32, 105, 168-172`

```ts
private cache: Record<string, SectionCache> = {};   // keyed only by sectionKey
this.cache[sectionKey] = { urls, fetchedAt: Date.now() };
```

**What's wrong**
Cache key is just `sectionKey`. When user finishes inspection A and starts inspection B (different `appointmentId`), the cached URLs for A are returned for B. Those URLs were signed against A's S3 path — uploads either go to the wrong path or get a 403 from AWS.

**Why it matters**
Data corruption across appointments. Silently misrouted uploads.

**Fix**

```ts
private cache: Record<string, SectionCache> = {};

private cacheKey(appointmentId: string, sectionKey: string) {
  return `${appointmentId}:${sectionKey}`;
}

// In every cache read/write:
const key = this.cacheKey(appointmentId, sectionKey);
this.cache[key] = { urls, fetchedAt: Date.now() };
```

Also clear the whole cache on `resetInspection` and `logout` — see M-9.

**fix.md:** Not covered.

---

## C-6. Submit payload uses hardcoded section list — breaks "fully dynamic" architecture

**Where:** `src/features/inspection/utils/buildFinalInspectionPayload.ts:90-104`

```ts
const sections = ['vehicle','engineTransmission','airConditioning','steeringBrakes','electricalsInteriors','exterior'] as const;
for (const sectionKey of sections) { ... }
```

**What's wrong**
`PROJECT_CONTEXT.md` claims the app is fully dynamic — adding a section in the catalog requires no frontend changes. But this file ignores any section not in the hardcoded list. New sections silently disappear from `submit` and from `auto-save` (which reuses this builder).

**Why it matters**
- New backend section never makes it to submit.
- Backend may reject incomplete payload.
- Documentation is wrong.

**Fix**

```ts
const sectionKeys = catalog.sections.map(s => s.section);
for (const sectionKey of sectionKeys) {
  const section = (session.formData as Record<string, unknown>)[sectionKey];
  if (!section || typeof section !== 'object' || Object.keys(section).length === 0) continue;
  formData[sectionKey] = processNestedData(section as AnyRecord, catalog, sectionKey);
}
```

**fix.md:** Not covered, but contradicts `PROJECT_CONTEXT.md`.

---

## C-7. Step IDs are arbitrary catalog keys cast to enum — legacy actions silently no-op

**Where:** `src/services/mockData.ts:184` and `src/features/inspection/store/inspectionStore.ts:32-44, 113-145, 178-198`

```ts
// mockData.ts
id: sec.section as any,

// inspectionStore.ts uses InspectionStepId enum for getStepKey, markStepComplete, markStepIncomplete
```

**What's wrong**
Step IDs are now strings (catalog section keys), but the legacy actions still compare against the `InspectionStepId` enum. Any caller that uses `markStepComplete(InspectionStepId.Engine)` silently does nothing. The type system says it's typed; the runtime behaviour is broken.

**Why it matters**
Latent bug. If anyone re-enables the enum-based callers, completion tracking breaks.

**Fix**
Delete the legacy actions. Keep only:
- `updateFormDataBySection`
- `markStepCompleteByKey`
- `resetInspection`
- `setCurrentLead`
- `startInspection`
- `submitInspection`
- `setError`/`setLoading`

Remove `getStepKey`, `updateFormData`, `updateFormDataByKey`, `markStepComplete`, `markStepIncomplete`. They're dead code.

**fix.md:** Not covered.

---

## C-8. Dashboard loads only `mockInspections` — no real data, no per-user filtering

**Where:** `src/features/dashboard/screens/DashboardScreen.tsx:79-82, 121-124, 138-152`

**What's wrong**
- `mockInspections` is the only data source. Every user sees the same hardcoded list.
- `handleRefresh` flips `isRefreshing` and never refetches.

**Why it matters**
Production-blocker. Privacy concern if real users ever see this.

**Fix**
Add `inspectionLeadsService.fetchLeadsForUser(userId)` and load on focus / refresh. Wire `handleRefresh` to refetch.

**fix.md:** Not covered.

---

## C-9. Hardcoded `API_KEY = 'test'` in source

**Where:** `src/services/api/endpoints.ts:28`

```ts
export const API_KEY = 'test';
export const API_BASE_URL = 'https://inspection-backend-production-cdac.up.railway.app/api/v1';
```

**What's wrong**
- API key in plaintext, committed to git.
- Comment says "FORCE LOCAL DEV SERVER" but URL points to a production-looking Railway host.

**Why it matters**
Security. Anyone with the binary or repo has the key.

**Fix**
Move to `react-native-config` (`.env.development`, `.env.production`). Pick base URL via `__DEV__`.

```ts
import Config from 'react-native-config';
export const API_KEY = Config.API_KEY!;
export const API_BASE_URL = Config.API_BASE_URL!;
```

**fix.md:** Not covered.

---

## C-10. S3 uploads can't be aborted — setState fires on unmounted CameraModal

**Where:** `src/utils/s3Upload.ts:55-93`, `src/features/camera/components/CameraModal.tsx:513-570`

**What's wrong**
`uploadToS3` doesn't expose the `XMLHttpRequest` object. If the user closes CameraModal mid-upload, the XHR keeps running and the resolved/reject path calls `setIsUploading(false)`, `setUploadProgress(...)` etc. on an unmounted component.

**Why it matters**
- React warning "Can't perform state update on unmounted component".
- Wasted bandwidth.
- Possible orphan upload to S3 of a file the user already deleted.

**Fix**

```ts
// s3Upload.ts
export function uploadToS3(...): { promise: Promise<void>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  // ... existing setup ...
  return {
    promise: new Promise<void>((resolve, reject) => { /* wire xhr */ }),
    abort: () => xhr.abort(),
  };
}
```

In `CameraModal`:
```ts
const uploadRef = useRef<{ abort: () => void } | null>(null);
const isMountedRef = useRef(true);
useEffect(() => () => { isMountedRef.current = false; uploadRef.current?.abort(); }, []);
// guard every setState: if (!isMountedRef.current) return;
```

**fix.md:** Not covered.

---

# 2. HIGH — fix soon

## H-1. `useAutoSaveDraft` re-stringifies the entire payload every 10s

**Where:** `src/hooks/useAutoSaveDraft.ts:42-66`

**What's wrong:** Every interval rebuilds `buildFinalInspectionPayload` (recursive walk) and `JSON.stringify`s it just to compute a diff.

**Fix:** Compare the `session.formData` reference (Zustand replaces it on every change). Only run the build + stringify when the reference changes since the last save.

---

## H-2. `useAutoSaveDraft` `saveOnUnmount` fires on every navigation, not on flow exit

**Where:** `src/hooks/useAutoSaveDraft.ts:79-89`, `InspectionHomeScreen.tsx:67-71`

**What's wrong:** The cleanup runs whenever any dep changes (`enabled`, `session`, `catalog`, `saveOnUnmount`), and React Navigation unmounts the home screen on every navigation. Comment says "only on home or app close" — that's not what happens.

**Fix:** Use `@react-navigation/native`'s `useFocusEffect` to detect *flow blur*, plus `AppState` listeners for app close.

---

## H-3. `startInspection` race — late draft loader can overwrite a reset session

**Where:** `inspectionStore.ts:62-115`

**What's wrong:** Fire-and-forget IIFE awaits `loadDraft`. Guard checks `currentLead.appointmentId` only — doesn't notice if `currentSession` was set to null by `resetInspection`.

**Fix:** Track a `generationId` per call. Bump on `resetInspection`. Late responses with a stale generation are dropped. Always `set({ isLoading: false })` in `finally`.

---

## H-4. ProgressRow gets `total={0}` — bar always shows 0%, label says "All complete" even when nothing is filled

**Where:** `DynamicInspectionStep.tsx:749`

```tsx
<ProgressRow filled={totalFilled} total={0} />
```

**Fix:** Compute `totalRequired` from the catalog (count `is-required` nodes in `mergedSections`).

---

## H-5. `mergeByKey` re-runs on every render inside `renderNodes`

**Where:** `DynamicInspectionStep.tsx:474-484, 567`

**What's wrong:** `renderNodes` is a plain function; it re-merges nested groups every call.

**Fix:** Cache by reference using `WeakMap<CatalogNode[], MergedSection[]>`, or convert `renderNodes` into a memoized `<Nodes />` component.

---

## H-6. `collectIssueOptions` walks the full subtree every render — and the result is unused

**Where:** `DynamicInspectionStep.tsx:511, 523, 806`

**What's wrong:** `renderInput`'s `issueOptions` parameter is *never read* in the function body (see H-7). The recursive walk produces a value that's thrown away.

**Fix:** Delete `collectIssueOptions` calls from `renderSingleNode`; pass `[]` (or remove the param).

---

## H-7. `issueOptions` parameter to `renderInput` is dead

**Where:** `DynamicInspectionStep.tsx:288-294`, `renderInput` body never references `issueOptions`.

**Fix:** Remove from signature and call sites.

---

## H-8. Photo-detail modal flow is dead code

**Where:** `DynamicInspectionStep.tsx:79-83, 108, 657, 696-704, 778-794`

**What's wrong:** `handlePhotoSlotPress` / `<Modal visible={activeSlot !== null} ...>` / `InspectionImageDetailPanel` / `handlePhotoChange` / `photoDetails` cast — none of this is reachable. After the `Connected*` refactor, no code path sets `activeSlot`. The Modal is always mounted but always hidden.

**Why it matters:** Dead code costs CPU and Android keeps the hidden Modal in the tree.

**Fix:** Delete:
- `activeSlot` state + `setActiveSlot`
- `<Modal visible={activeSlot !== null} ...>` block
- `handlePhotoSlotPress`, `handleCloseModal`, `handlePhotoChange`, `photoDetails`
- `ActivePhotoSlot.issueOptions`
- `RenderHandlers.onPhotoSlotPress` (and remove from the memo deps)

Or wire it up again — currently it's purely dead.

---

## H-9. Each Connected slot makes two Zustand subscriptions

**Where:** `Connectedphotocapture.tsx:37-58`, `Connectedvideocapture.tsx:54-75`

**What's wrong:** Two `useInspectionStore` calls (one per primitive). Each re-runs `getByPath` on every store update. With 50 slots, that's 100 active selectors firing on every store change.

**Fix:** One selector that returns a composite primitive:

```ts
const photoSig = useInspectionStore(useCallback(s => {
  const block = getByPath(s.currentSession?.formData[sectionKey] ?? {}, stripSectionPrefix(storageKey));
  const photo = (block as any)?.photos?.[0];
  return `${photo?.url ?? ''}|${photo?.capturedAt ?? ''}`;
}, [sectionKey, storageKey]));

const [imageUri, capturedAt] = useMemo(() => {
  const [u, c] = photoSig.split('|');
  return [u || undefined, c || undefined];
}, [photoSig]);
```

String compare with `===` — no infinite loop, half the selector work.

**fix.md:** Compatible (still subscribes to a single key) but cuts cost in half.

---

## H-10. `InspectionImageDetailPanel` `useEffect([value, title, layout])` wipes draft on every parent render

**Where:** `InspectionImageDetailPanel.tsx:51-53`

**What's wrong:** Even when the parent passes the *same content* but a new object reference, the effect resets `draft = value ?? {}`, blowing away the user's in-flight changes.

**Fix:** Compare a stable *slot key* instead of the value reference:

```ts
useEffect(() => {
  setDraft(value ?? {});
}, [slotKey]);   // or a deep-equality flag
```

---

## H-11. `PhotoCapture` cache-busting via `?_t=` would break signed S3 URLs

**Where:** `src/features/inspection/components/PhotoCapture.tsx:121-134, 173`

**What's wrong:** Today the project uses public/CloudFront URLs so this works. The day someone switches to signed URLs, every preview 403s because `X-Amz-Signature` covers query strings. `VideoCapture` already uses the safer `headers: { 'x-cache-bust': ts }` pattern.

**Fix:** Match `VideoCapture`:

```tsx
<Image source={{ uri: imageUri, headers: { 'x-cache-bust': String(timestamp) } }} ... />
```

---

## H-12. CameraModal doesn't reset upload state on cancel/reopen

**Where:** `CameraModal.tsx:380-401`

**Fix:** Reset `isUploading`, `uploadProgress`, `uploadError`, `videoFileError`, `isVideoFileReady` in a `useEffect(() => { /* reset all */ }, [visible])`.

---

## H-13. Two video-player implementations — WebView in CameraModal, react-native-video in VideoCapture

**Where:** `CameraModal.tsx:33-67, 718-740`; `VideoCapture.tsx:330-396`

**What's wrong:** CameraModal previews the just-recorded video via a WebView with inline `<video>`. VideoCapture preview uses react-native-video. Two players, two sets of bugs to maintain. WebView is heavier and harder to debug.

**Fix:** Replace the WebView with a `<Video>` from `react-native-video`, applying the same `videoMountKey`/`paused`/`key` rules from fix.md.

---

## H-14. Catalog cache provides no offline benefit

**Where:** `src/services/api/catalogService.ts:209-261`

**What's wrong:** Comment says "use cache (fast!)" but the implementation always calls the API to *check* the version, then compares to cache. If network is slow, cold start is slow.

**Fix:** True stale-while-revalidate — return cached catalog immediately, fire the version check in the background, swap state when fresh data arrives.

---

## H-15. `httpClient` has no request timeout

**Where:** `src/services/api/httpClient.ts:23-44`

**What's wrong:** No default `AbortController` timeout. Stalled requests hang forever.

**Fix:**

```ts
export async function httpRequest<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), init.timeoutMs ?? 30_000);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
    return res.json();
  } finally { clearTimeout(timeout); }
}
```

---

## H-16. `getMediaFileSize` returns 0 on failure — confused with "empty file"

**Where:** `src/features/camera/utils/mediaUtils.ts:151-160`; consumers `VideoCapture.tsx:170`, `CameraModal.tsx:206-216`

**Fix:** Throw on real errors, return `null` if file doesn't exist. Distinguish "couldn't read" from "size is zero".

---

## H-17. `setTimeout` without cleanup in DashboardScreen

**Where:** `DashboardScreen.tsx:121-124`

**Fix:** Track timer in ref; clear in cleanup or use `isMounted` ref.

---

## H-18. `httpPost` calls `httpGet` with `method:'POST'` — confusing and duplicated

**Where:** `src/services/api/httpClient.ts:46-49`

**Fix:** Extract a single `request()` and have both wrappers thin-call it.

---

## H-19. `processNestedData` drops `null`/`undefined` values

**Where:** `buildFinalInspectionPayload.ts:21-26`

**What's wrong:** A field the user explicitly cleared is dropped from the payload. Backend never sees the deletion.

**Fix:** Decide on the contract (emit `null` for cleared fields, or drop). Document either way.

---

## H-20. `catalogCache.isValidCatalog` hardcoded to legacy section names — contradicts dynamic catalog

**Where:** `src/services/cache/catalogCache.ts:30-44` (before fix)

**What's wrong**

```ts
function isValidCatalog(data: unknown): data is NormalisedCatalog {
  return (
    Array.isArray(d.sections) &&
    typeof d.optionsByPath === 'object' &&
    typeof d.airConditioning === 'object' &&    // ← hardcoded
    typeof d.engineTransmission === 'object' && // ← hardcoded
    typeof d.steeringBrakes === 'object' &&     // ← hardcoded
    typeof d.vehicle === 'object' &&            // ← hardcoded
    typeof d.electricalInteriors === 'object'   // ← hardcoded + typo (missing 's')
  );
}
```

This contradicts the "fully dynamic catalog" architecture. A backend rename or removal of any of these sections will invalidate every cached entry on every device. The validator was also leaking the legacy snake-case typo (`electricalInteriors` vs `electricalsInteriors` in the canonical catalog).

**Why it matters**
- Brittle: any future section rename causes a global cache wipe.
- Misleading: passes despite the typo, because the typo'd key isn't in the live catalog so it always fails for fresh data → existing caches passing then turning invalid on next restart.
- Contradicts `PROJECT_CONTEXT.md`'s "fully dynamic" claim.

**Fix (already applied):**
Validate only the structural invariants every catalog must have:

```ts
function isValidCatalog(data: unknown): data is NormalisedCatalog {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.fieldsByPath !== 'object' || d.fieldsByPath === null) return false;
  if (typeof d.optionsByPath !== 'object' || d.optionsByPath === null) return false;
  if (typeof d.uploadPathsBySection !== 'object' || d.uploadPathsBySection === null) return false;

  if (!Array.isArray(d.sections) || d.sections.length === 0) return false;

  for (const sec of d.sections) {
    if (!sec || typeof sec !== 'object') return false;
    const s = sec as Record<string, unknown>;
    if (typeof s.section !== 'string' || s.section.length === 0) return false;
    if (typeof s.label !== 'string') return false;
    if (!Array.isArray(s.children)) return false;
  }
  return true;
}
```

**Status:** ✅ Fixed.

---

## H-21. PresignedUrlService cache is in-memory only — wasted refetch within URL lifetime

**Where:** `src/services/api/presignedUrlService.ts:32` `private cache: Record<string, SectionCache> = {};`

**What's wrong**
Presigned URLs typically have a 1-hour TTL. When the user kills the app and reopens it 5 minutes later, the cache is gone and every section refetches its URLs unnecessarily.

**Why it matters**
Wasted backend calls; slower section first-render after cold start.

**Fix**
Persist the cache to AsyncStorage keyed by `${appointmentId}:${sectionKey}`. On cold start, hydrate the in-memory cache, but honor `expiresAt` — if all entries are expired, drop them.

```ts
const STORAGE_KEY = '@autoinspectai:presigned_url_cache_v1';

async hydrate() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed: Record<string, SectionCache> = JSON.parse(raw);
  const now = Date.now();
  for (const [k, v] of Object.entries(parsed)) {
    const stillValid = Object.values(v.urls).every(u => u.expiresAt > now);
    if (stillValid) this.cache[k] = v;
  }
}
```

This is conditional on **C-5** being applied first (cache key must include `appointmentId`).

**Severity:** HIGH (perf, not correctness).

---

## H-22. No offline queue for failed network writes

**Where:** `src/hooks/useAutoSaveDraft.ts:42-66`, `src/utils/s3Upload.ts:55-93`, `ReviewSubmitScreen.tsx`

**What's wrong**
- Auto-save fails silently and never retries (line 60-63: `// Don't throw - auto-save is non-critical`).
- `submitInspection` failures rely on user to retry manually.
- S3 upload: `CameraModal.handleConfirmPhoto` calls `deleteLocalFile` *after* a "successful" upload. If the upload was partial and the local file is gone, the photo is lost forever.

**Why it matters**
On flaky mobile networks, users will silently lose progress. There's no "outbox" / "queue" pattern.

**Fix**
Build a small retry queue:
- Persist failed draft writes to AsyncStorage.
- On `NetInfo` reconnect (or `AppState` foreground), drain the queue.
- For S3 uploads: keep the local file until the upload returns 2xx **and** the URL is written into Zustand. Only then delete locally.

**Severity:** HIGH (data loss risk).

---

## H-23. No data-version migration for AsyncStorage entries

**Where:** `src/services/cache/catalogCache.ts` (cache key `@autoinspectai:inspection_catalog_v1`)

**What's wrong**
The catalog cache key has `_v1` baked in but there's no migration path. If `NormalisedCatalog`'s shape changes in a future release (say, adds a required field), old entries written by the previous app version stay around until TTL expires. The shape mismatch is caught reactively by `isValidCatalog` and the entry is wiped — but the cost is a cache miss on the first launch after upgrade.

**Why it matters**
Minor — the existing reactive validation already handles it. But there's no proactive migration, no version bump strategy, no upgrade hook.

**Fix (low priority)**
- Bump the storage key (`_v2`) when the schema changes.
- Optionally add a one-time migration function on app start that converts known v1 → v2 shapes.

**Severity:** MEDIUM.

---

## H-24. No MMKV — synchronous hydration of Zustand on cold start is impossible

**Where:** Storage layer in general (`AsyncStorage`).

**What's wrong**
AsyncStorage is fully async. Hydrating Zustand from AsyncStorage on app start requires a `useEffect` that runs after first render — so the first frame *always* shows empty state, then re-renders with hydrated state.

For a small set of values (catalog version, last-used appointment, auth user shape), MMKV provides synchronous reads and writes via `react-native-mmkv`, which would let you hydrate Zustand synchronously before the first render.

**Why it matters**
Cosmetic flicker on cold start. AsyncStorage is fine for the catalog blob (large, async OK). Not worth migrating now.

**Fix (low priority)**
Add `react-native-mmkv` for hot-path keys (auth, last-known catalog version) only. Keep AsyncStorage for the large catalog payload.

**Severity:** LOW.

# 3. MEDIUM — quality of life and architecture

## M-1. `// @ts-ignore` masking real bugs
- `DynamicInspectionStep.tsx:504, 595` — fix by typing `photoBlock` properly
- `DashboardScreen.tsx:111`, `InspectionSuccessScreen.tsx:19` — fix navigator types

## M-2. `as any` / `as unknown as ...` everywhere
- `mockData.ts:184, 206`
- `draftService.ts:61` (`response.data as any`)
- `s3Upload.ts:93` (`xhr.send({...} as any)`)
- `DynamicInspectionStep.tsx:336, 375, 407, 412, 439`
- Add proper types to `CatalogOption`, `CatalogInput`, `DraftResponse.data`.

## M-3. Console-log noise
- `inspectionStore.ts`, `presignedUrlService.ts`, `draftService.ts`, `catalogService.ts`, `CameraModal.tsx`, `s3Upload.ts`.
- `PhotoCapture.tsx:143-145` logs in render body — runs every render.
- Wrap in `if (__DEV__)` and remove the render-body ones.

## M-4. `PhotoCapture.tsx:143-145` — three `console.log` in render body
Combined with C-1, this hammers Logcat. Remove.

## M-5. Debug-only `useEffect` in DashboardScreen
`DashboardScreen.tsx:69-77` exists only to log. Remove.

## M-6. Duplicate selector subscriptions
`DashboardScreen.tsx:64-66` subscribes to the same value twice. Delete `catalogState`.

## M-7. Dead actions in inspectionStore
Remove `updateFormData`, `updateFormDataByKey`, `markStepComplete`, `markStepIncomplete`, `getStepKey`.

## M-8. `mockUser.zone` / `employeeId` shown to authenticated user
`DashboardScreen.tsx:200, 202` — replace with real user fields.

## M-9. Logout doesn't clear per-user caches
`AuthContext.logout()` (line 76-89) doesn't call `useInspectionStore.getState().resetInspection()`, `useCatalogViewModel.getState().refreshCatalog()`, or `presignedUrlService.clearAll()`. Multi-user devices leak data.

**Fix:**
```ts
// In logout()
useInspectionStore.getState().resetInspection();
presignedUrlService.clearAll();
await catalogCache.clear();
```

## M-10. `useAutoSaveDraft.saveNow` saves raw shape; interval saves transformed shape
`useAutoSaveDraft.ts:90-104` vs `42-66`. Pick one.

## M-11. `draftService.loadDraft` strips fields with `as any`
`draftService.ts:61` — formalise the envelope so new metadata fields don't leak into formData.

## M-12. Pervasive `error: any`
`AuthContext.tsx:60, 76`; `DashboardScreen.tsx:60`; `LeadDetailsScreen.tsx:140`; `MainTabNavigator.tsx:42`. Replace with `unknown` and narrow.

## M-13. 5-second AuthContext boot timeout = blank screen
`AuthContext.tsx:34-39`. Show a branded splash, persist user from MMKV/AsyncStorage synchronously.

## M-14. `loadCatalog` doesn't dedupe in-flight calls
`catalogViewModel.ts:38-72`. On rapid retry-clicks, two fetches can race.

**Fix:** Track an in-flight `Promise` ref and return it on overlapping calls.

## M-15. `catalogCache` reads `AsyncStorage` twice
`catalogService.ts:213-214`. Single read returning `{ data, version }`.

## M-16. No global "loading catalog" UX
`App.tsx:13-23` `<CatalogBootstrap />` fires fetch but doesn't block navigation. User can land on a screen that crashes (C-4).

## M-17. `<ScrollView key={resolvedActiveKey}>` forces unmount/remount on every tab switch
`DynamicInspectionStep.tsx:763`. Every tab change unmounts every Connected child. Drop the `key` prop.

## M-18. `InspectionImageDetailPanel.listBackTitle` defaults to a legacy section name
`InspectionImageDetailPanel.tsx:48, 52`. Default is `'Exterior + Tyres'` — leftover. Make it required (no default) or default to empty.

## M-19. Magic number `?? 6` for steps
`InspectionHomeScreen.tsx:75-76`. Use `?? 0`.

## M-20. `s3Upload.ts` content-type detection is naive
`localUri.includes('.mp4') || localUri.includes('video')` — false positives on any path containing the word "video". Take `contentType` from the caller, or detect via extension only.

## M-21. CameraModal `outputs` typed as `any[]`
`CameraModal.tsx:128`. Type properly.

## M-22. `ReviewSubmitScreen.handleSubmit` reads `currentSession` from a closure inside an `Alert.alert` callback
`ReviewSubmitScreen.tsx:103-156`. Use `useInspectionStore.getState().currentSession` inside the callback to avoid a stale snapshot.

## M-23. Tests rely on `as any` for camera mocks
`src/features/camera/services/__tests__/CameraService.test.ts`. Tighten test types.

## M-24. `ProfileScreen` defined inline in `MainTabNavigator.tsx` (240+ LOC)
Move to its own file for maintainability.

## M-25. Dead `.js` files in `src/features/inspection/screens/steps/`
`catlouge.js`, `exampleresponse.js` — typo'd, unused. Delete.

## M-26. Documentation drift
`PROJECT_CONTEXT.md` and `COMPLETE_WORKFLOW_ANALYSIS.md` describe `Step1_BasicVerification.tsx` etc. that don't exist. The repo is now fully dynamic via `DynamicInspectionStep.tsx`. Update or delete those docs.

## M-27. Multiple overlapping audit/fix docs
`fix.md`, `OPTIMIZATION_ANALYSIS.md`, `ANR_FIX_VERIFICATION.md`, `IMPLEMENTATION_COMPLETE.md`, `COMPLETE_WORKFLOW_ANALYSIS.md`, plus this one. Consolidate or clearly mark outdated ones as historical.

---

# 4. LOW — cosmetic / micro-perf

- **L-1.** File names `Connectedphotocapture.tsx` / `Connectedvideocapture.tsx` should be PascalCase to match every other component (`ConnectedPhotoCapture.tsx`, `ConnectedVideoCapture.tsx`).
- **L-2.** `cleanLabel` (`DynamicInspectionStep.tsx:128`) uses `pop()!.trim()` — non-null assertion, throws on empty input.
- **L-3.** Inline `() => onChange(val)` in many tap handlers (`DynamicInspectionStep.tsx:209, 233, 354, 371, 387, 406, 446`, `MultiSelectChips.tsx:73`). Fine in non-memoised children, but combined with C-1 they cause many cheap renders.
- **L-4.** Hardcoded section icons array `['📋','⚙️','❄️',...]` in `mockData.ts:187` — cycles for >8 sections. Cosmetic.
- **L-5.** `InspectionPhotoSummaryRow` uses string-match `.includes('ISSUE')` for special-case rendering — magic.
- **L-6.** `RootNavigator` shows `ActivityIndicator` during boot — no branded splash.

---

# fix.md Rule Compliance

| Rule (fix.md §10) | Status | Issues that violate it |
|---|---|---|
| 1. Never add `formData` to `renderHandlers` deps | OK | — |
| 2. Never render `<VideoCapture>`/`<PhotoCapture>` directly in `renderInput` | OK in `renderInput`. `InspectionImageDetailPanel` uses `PhotoCapture` directly but the prop is local-state-driven, not store-driven, so it's fine. | — |
| 3. Never `useEffect([formData])` without debounce | Debounce exists, but reference instability defeats it | C-1, C-2 |
| 4. Never remove `key` from `<Video>` | OK | — |
| 5. Never `paused={false}` at Video mount | OK | — |
| Spirit: subscribe to smallest slice | **Broken at every screen** | C-1, H-9 |

---

# Recommended Fix Order

Each fix in 1 should be applied before moving to the next; some unblock others.

| # | Fix | Status |
|---|---|---|
| 1 | **C-1** — convert all whole-store destructures to scoped selectors | ✅ Applied |
| 2 | **C-4** — null-safe catalog access (default-empty `EMPTY_CATALOG`) | ✅ Applied |
| 3 | **C-3** + **C-2** — synchronous `formDataRef` write, scoped `sectionFormData` selector | ✅ Applied |
| 4 | **C-5** — key presigned cache by `appointmentId:sectionKey` | ✅ Applied |
| 5 | **C-6** — dynamic section iteration in `buildFinalInspectionPayload` | ✅ Applied |
| 6 | **H-20** — replace hardcoded section names in `isValidCatalog` with structural validation | ✅ Applied |
| 7 | **H-8** + **H-7** + **H-6** — delete the dead photo-modal flow and `issueOptions` plumbing | ✅ Applied |
| 8 | **H-4** — fix `total={0}` ProgressRow | ✅ Applied |
| 9 | **H-9** — single composite selector in `Connected*` | ✅ Applied |
| 10 | **C-9** — move API key to env config (`appConfig.ts` + `process.env` reads) | ✅ Applied |
| 11 | **C-10** — abortable S3 upload, `isMounted` guards in CameraModal | ✅ Applied |
| 12 | **M-9** — clear all per-user caches on logout | ✅ Applied |
| 13 | **C-7** + **M-7** — delete dead store actions (legacy `InspectionStepId`-based) | ✅ Applied |
| 14 | **H-14** + **H-15** — true SWR catalog cache + httpClient timeouts | ✅ Applied |
| 15 | **H-22** — offline queue for drafts, submit, and S3 uploads | ✅ Applied (drafts + submit; S3 upload has abortable handle, queueing left to caller-side retry) |
| 16 | **H-21** — persist presigned-URL cache (only after C-5 lands) | ✅ Applied |
| 17 | **C-8** — real lead-fetch API | ⏸ Deferred (manual / backend dependency) |

After step 1 alone, you should see a dramatic drop in re-render counts on every screen. After steps 1-3, `DynamicInspectionStep` should feel instant.

---

# Quick Self-Check (after applying C-1)

Add this temporary log at the top of `DynamicInspectionStep.tsx`:

```ts
console.log('[DynamicStep RENDER]', sectionKey, Date.now());
```

**Expected after fix:** It logs only when:
- the screen mounts,
- the user switches tabs,
- `currentSession` is replaced (rare — only on `setCurrentLead`/`startInspection`/`resetInspection`).

**You should NOT see it log on every keystroke or every photo capture.** If you do, C-1 is not fully applied — find the remaining whole-store destructure.
