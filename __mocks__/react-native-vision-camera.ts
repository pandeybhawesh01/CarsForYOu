import React from 'react';

// Functional mock Camera component that invokes lifecycle callbacks
export const Camera = React.forwardRef(({ onStarted, onError }: any, ref: any) => {
  React.useEffect(() => {
    // simulate successful start
    try {
      onStarted?.();
    } catch (e) {
      onError?.(e);
    }
  }, [onStarted, onError]);

  // If ref is provided, set a dummy object so callers can use it
  if (ref) {
    React.useImperativeHandle(ref, () => ({
    takePhoto: jest.fn(),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    }));
  }

  return null;
};

export const getCameraPermissionStatus = jest.fn().mockResolvedValue('granted');
export const getMicrophonePermissionStatus = jest.fn().mockResolvedValue('granted');
export const requestCameraPermission = jest.fn().mockResolvedValue('granted');
export const requestMicrophonePermission = jest.fn().mockResolvedValue('granted');

export const useCameraDevice = jest.fn().mockReturnValue({
  id: 'back-camera',
  position: 'back',
  hasFlash: true,
  hasTorch: true,
  isMultiCam: false,
  minZoom: 1,
  maxZoom: 10,
  neutralZoom: 1,
  minFocusDistance: 0,
  supportsDepthCapture: false,
  supportsRawCapture: false,
  supportsLowLightBoost: false,
  supportsFocus: true,
  name: 'Back Camera',
  formats: [],
  sensorOrientation: 'landscape-left',
  hardwareLevel: 'full',
  deviceType: 'wide-angle-camera',
});

export const useCameraPermissions = jest.fn().mockReturnValue([
  { granted: true },
  jest.fn(),
]);

export const useFrameProcessor = jest.fn();
