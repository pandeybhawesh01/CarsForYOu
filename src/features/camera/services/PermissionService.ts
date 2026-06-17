/**
 * PermissionService - Handles all camera and microphone permission operations
 * Uses react-native-vision-camera v5 VisionCamera API
 */

import { Linking, Platform } from 'react-native';
import type { PermissionStatus } from '../types';
import { logCameraError, createPermissionDeniedError } from '../utils/cameraErrors';
import { VisionCamera } from '../utils/visionCamera';

// ============================================================================
// Permission Status Mapping
// ============================================================================

/**
 * Maps react-native-vision-camera v5 PermissionStatus to our PermissionStatus type
 * v5 uses: 'authorized' | 'not-determined' | 'denied' | 'restricted'
 */
function mapPermissionStatus(
  status: 'authorized' | 'not-determined' | 'denied' | 'restricted',
): PermissionStatus {
  switch (status) {
    case 'authorized':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'restricted':
      return 'blocked';
    case 'not-determined':
      return 'unavailable';
    default:
      return 'unavailable';
  }
}

// ============================================================================
// PermissionService
// ============================================================================

export class PermissionService {
  // --------------------------------------------------------------------------
  // Permission Checking (synchronous in v5 via VisionCamera properties)
  // --------------------------------------------------------------------------

  static async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      const status = VisionCamera.cameraPermissionStatus;
      return mapPermissionStatus(status);
    } catch (error) {
      logCameraError(createPermissionDeniedError(error), 'checkCameraPermission');
      return 'unavailable';
    }
  }

  static async checkMicrophonePermission(): Promise<PermissionStatus> {
    try {
      const status = VisionCamera.microphonePermissionStatus;
      return mapPermissionStatus(status);
    } catch (error) {
      logCameraError(createPermissionDeniedError(error), 'checkMicrophonePermission');
      return 'unavailable';
    }
  }

  // --------------------------------------------------------------------------
  // Permission Requesting
  // --------------------------------------------------------------------------

  static async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      const granted = await VisionCamera.requestCameraPermission();
      return granted ? 'granted' : 'denied';
    } catch (error) {
      logCameraError(createPermissionDeniedError(error), 'requestCameraPermission');
      return 'denied';
    }
  }

  static async requestMicrophonePermission(): Promise<PermissionStatus> {
    try {
      const granted = await VisionCamera.requestMicrophonePermission();
      return granted ? 'granted' : 'denied';
    } catch (error) {
      logCameraError(createPermissionDeniedError(error), 'requestMicrophonePermission');
      return 'denied';
    }
  }

  static async requestAllPermissions(): Promise<boolean> {
    const [cameraStatus, micStatus] = await Promise.all([
      PermissionService.requestCameraPermission(),
      PermissionService.requestMicrophonePermission(),
    ]);
    return cameraStatus === 'granted' && micStatus === 'granted';
  }

  // --------------------------------------------------------------------------
  // Settings Navigation
  // --------------------------------------------------------------------------

  static openAppSettings(): void {
    try {
      Linking.openSettings();
    } catch (error) {
      console.error('[PermissionService] Failed to open app settings:', error);
    }
  }

  static async shouldShowPermissionRationale(
    _permission: 'camera' | 'microphone',
  ): Promise<boolean> {
    return Platform.OS === 'android';
  }

  // --------------------------------------------------------------------------
  // Convenience Helpers
  // --------------------------------------------------------------------------

  static async isCameraPermissionGranted(): Promise<boolean> {
    const status = await PermissionService.checkCameraPermission();
    return status === 'granted';
  }

  static async isMicrophonePermissionGranted(): Promise<boolean> {
    const status = await PermissionService.checkMicrophonePermission();
    return status === 'granted';
  }

  static async areAllPermissionsGranted(): Promise<boolean> {
    const [camera, mic] = await Promise.all([
      PermissionService.isCameraPermissionGranted(),
      PermissionService.isMicrophonePermissionGranted(),
    ]);
    return camera && mic;
  }
}
