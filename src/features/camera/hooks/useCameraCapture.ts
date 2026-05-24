/**
 * useCameraCapture - Manages photo capture workflow and state
 * Coordinates permissions, camera modal visibility, and capture operations
 */

import { useCallback, useRef, useState } from 'react';
import { useCameraPermissions } from './useCameraPermissions';
import type { CameraError, UseCameraCaptureReturn } from '../types';

// ============================================================================
// Hook
// ============================================================================

export function useCameraCapture(): UseCameraCaptureReturn {
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);

  // Resolve callback stored between openCamera() and onCapture()
  const captureResolveRef = useRef<((uri: string) => void) | null>(null);
  const captureRejectRef = useRef<((err: CameraError) => void) | null>(null);

  const {
    hasCameraPermission,
    requestCameraPermission,
  } = useCameraPermissions();

  // --------------------------------------------------------------------------
  // Open / Close camera modal
  // --------------------------------------------------------------------------

  const openCamera = useCallback(async (): Promise<void> => {
    setError(null);

    // Ensure permission before showing camera
    let hasPermission = hasCameraPermission;
    if (!hasPermission) {
      hasPermission = await requestCameraPermission();
    }

    if (!hasPermission) {
      // Permission denied — caller should read error state
      return;
    }

    setIsCameraVisible(true);
  }, [hasCameraPermission, requestCameraPermission]);

  const closeCamera = useCallback(() => {
    setIsCameraVisible(false);
    setIsCapturing(false);

    // Reject any pending capture promise
    if (captureRejectRef.current) {
      captureRejectRef.current(
        new (require('../types').CameraError)(
          require('../types').CameraErrorCode.CAPTURE_FAILED,
          'Camera closed before capture',
          'Photo capture was cancelled.',
        ),
      );
      captureResolveRef.current = null;
      captureRejectRef.current = null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // Capture photo — called by CameraModal after takePhoto()
  // --------------------------------------------------------------------------

  /**
   * Returns a promise that resolves with the captured URI.
   * The CameraModal calls onCapture(uri) which resolves this promise.
   */
  const capturePhoto = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      captureResolveRef.current = resolve;
      captureRejectRef.current = reject;
    });
  }, []);

  /**
   * Called by CameraModal when a photo has been successfully captured
   */
  const handleCaptureSuccess = useCallback((uri: string) => {
    setIsCapturing(false);
    setIsCameraVisible(false);

    if (captureResolveRef.current) {
      captureResolveRef.current(uri);
      captureResolveRef.current = null;
      captureRejectRef.current = null;
    }
  }, []);

  /**
   * Called by CameraModal when an error occurs during capture
   */
  const handleCaptureError = useCallback((err: CameraError) => {
    setIsCapturing(false);
    setError(err);

    if (captureRejectRef.current) {
      captureRejectRef.current(err);
      captureResolveRef.current = null;
      captureRejectRef.current = null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // Permission helpers
  // --------------------------------------------------------------------------

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return requestCameraPermission();
  }, [requestCameraPermission]);

  return {
    isCameraVisible,
    isCapturing,
    error,
    openCamera,
    closeCamera,
    capturePhoto,
    hasPermission: hasCameraPermission,
    requestPermission,
    // Internal callbacks used by CameraModal
    _onCaptureSuccess: handleCaptureSuccess,
    _onCaptureError: handleCaptureError,
  } as UseCameraCaptureReturn & {
    _onCaptureSuccess: (uri: string) => void;
    _onCaptureError: (err: CameraError) => void;
  };
}
