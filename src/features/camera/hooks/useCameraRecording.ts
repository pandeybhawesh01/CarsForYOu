/**
 * useCameraRecording - Manages video recording workflow and state
 * Coordinates permissions, camera modal visibility, and recording operations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraPermissions } from './useCameraPermissions';
import { CameraError, CameraErrorCode, type UseCameraRecordingReturn } from '../types';

// ============================================================================
// Hook
// ============================================================================

export function useCameraRecording(): UseCameraRecordingReturn {
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<CameraError | null>(null);

  // Resolve callback stored between openCamera() and onCapture()
  const recordingResolveRef = useRef<((uri: string) => void) | null>(null);
  const recordingRejectRef = useRef<((err: CameraError) => void) | null>(null);

  // Timer ref for recording duration
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    hasCameraPermission,
    hasMicrophonePermission,
    requestAllPermissions,
  } = useCameraPermissions();

  // --------------------------------------------------------------------------
  // Recording duration timer
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // --------------------------------------------------------------------------
  // Open / Close camera modal
  // --------------------------------------------------------------------------

  const openCamera = useCallback(async (): Promise<void> => {
    setError(null);

    // Video requires both camera and microphone permissions
    const hasPermissions = hasCameraPermission && hasMicrophonePermission;
    if (!hasPermissions) {
      const granted = await requestAllPermissions();
      if (!granted) {
        return;
      }
    }

    setIsCameraVisible(true);
  }, [hasCameraPermission, hasMicrophonePermission, requestAllPermissions]);

  const closeCamera = useCallback(() => {
    setIsCameraVisible(false);
    setIsRecording(false);
    setRecordingDuration(0);

    if (recordingRejectRef.current) {
      recordingRejectRef.current(
        new CameraError(
          CameraErrorCode.RECORDING_FAILED,
          'Camera closed before recording finished',
          'Video recording was cancelled.',
        ),
      );
      recordingResolveRef.current = null;
      recordingRejectRef.current = null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // Recording controls
  // --------------------------------------------------------------------------

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null);
    setIsRecording(true);
  }, []);

  /**
   * Returns a promise that resolves with the recorded video URI.
   * The CameraModal calls _onRecordingFinished(uri) which resolves this promise.
   */
  const stopRecording = useCallback((): Promise<string> => {
    setIsRecording(false);
    return new Promise((resolve, reject) => {
      recordingResolveRef.current = resolve;
      recordingRejectRef.current = reject;
    });
  }, []);

  /**
   * Called by CameraModal when recording has finished successfully
   */
  const handleRecordingFinished = useCallback((uri: string) => {
    setIsRecording(false);
    setIsCameraVisible(false);
    setRecordingDuration(0);

    if (recordingResolveRef.current) {
      recordingResolveRef.current(uri);
      recordingResolveRef.current = null;
      recordingRejectRef.current = null;
    }
  }, []);

  /**
   * Called by CameraModal when a recording error occurs
   */
  const handleRecordingError = useCallback((err: CameraError) => {
    setIsRecording(false);
    setError(err);

    if (recordingRejectRef.current) {
      recordingRejectRef.current(err);
      recordingResolveRef.current = null;
      recordingRejectRef.current = null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // Permission helpers
  // --------------------------------------------------------------------------

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return requestAllPermissions();
  }, [requestAllPermissions]);

  const hasPermission = hasCameraPermission && hasMicrophonePermission;

  return {
    isCameraVisible,
    isRecording,
    recordingDuration,
    error,
    openCamera,
    closeCamera,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
    // Internal callbacks used by CameraModal
    _onRecordingFinished: handleRecordingFinished,
    _onRecordingError: handleRecordingError,
  } as UseCameraRecordingReturn & {
    _onRecordingFinished: (uri: string) => void;
    _onRecordingError: (err: CameraError) => void;
  };
}
