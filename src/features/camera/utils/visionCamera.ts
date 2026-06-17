import React from 'react';
import type { CameraDevice } from 'react-native-vision-camera';

let visionCamera: any = null;
let loadError: Error | null = null;

const loadVisionCamera = () => {
  try {
    // Defer native module resolution until runtime so the app can fail gracefully.
    return require('react-native-vision-camera');
  } catch (error) {
    loadError = error as Error;
    console.warn('[Camera] Failed to load react-native-vision-camera:', loadError.message);
    return null;
  }
};

visionCamera = loadVisionCamera();

export const Camera = visionCamera?.Camera ?? React.forwardRef(() => null);

export const VisionCamera = visionCamera?.VisionCamera ?? {
  cameraPermissionStatus: 'denied' as const,
  microphonePermissionStatus: 'denied' as const,
  requestCameraPermission: async () => false,
  requestMicrophonePermission: async () => false,
};

// Wrapper for useCameraDevice that handles both string and position parameter
export const useCameraDevice = (position: 'back' | 'front' = 'back'): CameraDevice | undefined => {
  if (!visionCamera?.useCameraDevice) {
    console.warn('[Camera] useCameraDevice hook not available');
    return undefined;
  }
  
  try {
    // v4 API: useCameraDevice expects position as 'back' | 'front'
    return visionCamera.useCameraDevice(position);
  } catch (error) {
    console.error('[Camera] Error calling useCameraDevice:', error);
    return undefined;
  }
};

export const useCameraPermission =
  visionCamera?.useCameraPermission ?? (() => ({ hasPermission: false, status: 'denied', requestPermission: async () => false }));

export const useMicrophonePermission =
  visionCamera?.useMicrophonePermission ?? (() => ({ hasPermission: false, status: 'denied', requestPermission: async () => false }));

// v4 API: useFrameProcessor instead of usePhotoLibrary/useVideoRecording
// We'll use Camera ref methods instead
export const useFrameProcessor = visionCamera?.useFrameProcessor ?? (() => undefined);

export type { CameraDevice, CameraProps } from 'react-native-vision-camera';
