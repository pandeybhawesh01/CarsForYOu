/**
 * ConnectedPhotoCapture
 *
 * Same self-subscribing pattern as ConnectedVideoCapture, for photos.
 * Only re-renders when its own storageKey value changes in the store.
 *
 * IMPORTANT (Zustand v5):
 * v5 removed the second-argument equality fn. Returning a NEW object from
 * the selector on every store update therefore causes an infinite loop.
 *
 * H-9: One composite selector returning a `${url}|${capturedAt}` string,
 * split locally with useMemo. Halves the selector evaluations vs. two
 * separate selectors.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useInspectionStore } from '../store/inspectionStore';
import PhotoCapture from './PhotoCapture';
import { getByPath, stripSectionPrefix } from '../utils/nestedFormData';
import type { PhotoIssueInspectionBlock } from '../types';

interface ConnectedPhotoCaptureProps {
  storageKey: string;
  label: string;
  sectionKey: string;
  appointmentId: string;
  uploadPath?: string;
  onDirectCapture: (storageKey: string, uri: string, capturedAt?: string) => void;
}

const ConnectedPhotoCapture: React.FC<ConnectedPhotoCaptureProps> = ({
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

  const { imageUri, capturedAt } = useMemo(() => {
    const idx = sig.indexOf('|');
    const url = idx >= 0 ? sig.slice(0, idx) : sig;
    const ts = idx >= 0 ? sig.slice(idx + 1) : '';
    return {
      imageUri: url || undefined,
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
    <PhotoCapture
      label={label}
      imageUri={imageUri}
      capturedAt={capturedAt}
      onCapture={handleCapture}
      uploadPath={uploadPath}
      sectionKey={sectionKey}
      appointmentId={appointmentId}
    />
  );
};

export default memo(ConnectedPhotoCapture);