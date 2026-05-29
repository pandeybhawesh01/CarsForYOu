/**
 * ConnectedVideoCapture
 *
 * A thin store-connected wrapper around VideoCapture.
 *
 * WHY THIS EXISTS:
 * renderNodes() in DynamicInspectionStep is a plain function, not a React
 * component tree. To prevent ANR we made renderHandlers stable (no formData
 * dependency), which means renderNodes never re-runs on field changes.
 * That's correct for performance, but it means VideoCapture would never
 * receive an updated videoUri prop after a capture.
 *
 * Solution: this component subscribes to ONLY its own storage key in the
 * store. When the user captures a video, only this component re-renders —
 * the rest of the form tree stays completely untouched.
 *
 * This is the same pattern as Redux connect() or Zustand's per-field selector.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useInspectionStore } from '../store/inspectionStore';
import VideoCapture from './VideoCapture';
import { getByPath, stripSectionPrefix } from '../utils/nestedFormData';
import type { PhotoIssueInspectionBlock } from '../types';

interface ConnectedVideoCaptureProps {
  storageKey: string;        // full dotted path e.g. "electricalsInteriors.video"
  label: string;
  sectionKey: string;        // e.g. "electricalsInteriors"
  appointmentId: string;
  uploadPath?: string;
  onDirectCapture: (storageKey: string, uri: string, capturedAt?: string) => void;
}

/**
 * IMPORTANT (Zustand v5):
 * In Zustand v5, the second-argument equality fn was REMOVED from the hook
 * signature. Returning a NEW object from the selector on every store update
 * therefore causes an infinite re-render loop.
 *
 * H-9: One composite selector returning a `${url}|${capturedAt}` string.
 * Strings compare with `===`, so the component only re-renders when its
 * specific value actually changes. Halves the selector evaluations vs. the
 * previous "two separate string selectors" approach.
 */
const ConnectedVideoCapture: React.FC<ConnectedVideoCaptureProps> = ({
  storageKey,
  label,
  sectionKey,
  appointmentId,
  uploadPath,
  onDirectCapture,
}) => {
  const sig = useInspectionStore(
    useCallback(
      (state) => {
        const sectionData = (state.currentSession?.formData[sectionKey] ?? {}) as Record<string, unknown>;
        const block = getByPath(sectionData, stripSectionPrefix(storageKey)) as PhotoIssueInspectionBlock | undefined;
        const photo = block?.photos?.[0] as { url?: string; capturedAt?: string } | undefined;
        return `${photo?.url ?? ''}|${photo?.capturedAt ?? ''}`;
      },
      [sectionKey, storageKey],
    ),
  );

  const { videoUri, capturedAt } = useMemo(() => {
    const idx = sig.indexOf('|');
    const url = idx >= 0 ? sig.slice(0, idx) : sig;
    const ts = idx >= 0 ? sig.slice(idx + 1) : '';
    return {
      videoUri: url || undefined,
      capturedAt: ts || undefined,
    };
  }, [sig]);

  const handleCapture = useCallback(
    (uri: string, timestamp?: string) => {
      onDirectCapture(storageKey, uri, timestamp);
    },
    [onDirectCapture, storageKey],
  );

  return (
    <VideoCapture
      label={label}
      videoUri={videoUri}
      capturedAt={capturedAt}
      onCapture={handleCapture}
      uploadPath={uploadPath}
      sectionKey={sectionKey}
      appointmentId={appointmentId}
    />
  );
};

export default memo(ConnectedVideoCapture);