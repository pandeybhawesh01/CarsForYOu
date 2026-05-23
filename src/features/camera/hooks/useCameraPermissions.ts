/**
 * useCameraPermissions - Manages camera and microphone permission state
 * Uses react-native-vision-camera v5 useCameraPermission / useMicrophonePermission hooks
 */

import { useCallback } from 'react';
import { PermissionService } from '../services/PermissionService';
import type { PermissionStatus, UseCameraPermissionsReturn } from '../types';
import {
  useCameraPermission,
  useMicrophonePermission,
} from '../utils/visionCamera';

// ============================================================================
// Hook
// ============================================================================

export function useCameraPermissions(): UseCameraPermissionsReturn {
  // v5 provides reactive permission hooks
  const cameraPermState = useCameraPermission();
  const micPermState = useMicrophonePermission();

  // Map v5 status ('authorized' | 'not-determined' | 'denied' | 'restricted')
  // to our PermissionStatus type
  const mapStatus = (
    status: 'authorized' | 'not-determined' | 'denied' | 'restricted',
  ): PermissionStatus => {
    switch (status) {
      case 'authorized': return 'granted';
      case 'denied': return 'denied';
      case 'restricted': return 'blocked';
      default: return 'unavailable';
    }
  };

  const cameraPermission = mapStatus(cameraPermState.status);
  const microphonePermission = mapStatus(micPermState.status);

  // --------------------------------------------------------------------------
  // Request functions
  // --------------------------------------------------------------------------

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    return cameraPermState.requestPermission();
  }, [cameraPermState]);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    return micPermState.requestPermission();
  }, [micPermState]);

  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    const [cameraGranted, micGranted] = await Promise.all([
      cameraPermState.requestPermission(),
      micPermState.requestPermission(),
    ]);
    return cameraGranted && micGranted;
  }, [cameraPermState, micPermState]);

  const openSettings = useCallback(() => {
    PermissionService.openAppSettings();
  }, []);

  // --------------------------------------------------------------------------
  // Computed state
  // --------------------------------------------------------------------------

  const hasCameraPermission = cameraPermState.hasPermission;
  const hasMicrophonePermission = micPermState.hasPermission;
  const hasAllPermissions = hasCameraPermission && hasMicrophonePermission;

  return {
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    requestAllPermissions,
    openSettings,
    hasCameraPermission,
    hasMicrophonePermission,
    hasAllPermissions,
  };
}
