/**
 * Type definitions for the camera capture feature
 * Provides type safety for camera operations, permissions, and media handling
 */

import type { Camera as VisionCamera, CameraDevice } from 'react-native-vision-camera';

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionState {
  camera: {
    status: PermissionStatus;
    lastChecked: number;
    requestCount: number;
  };
  microphone: {
    status: PermissionStatus;
    lastChecked: number;
    requestCount: number;
  };
}

// ============================================================================
// Camera Types
// ============================================================================

export type CameraMode = 'photo' | 'video';
export type CameraPosition = 'back' | 'front';
export type FlashMode = 'off' | 'on' | 'auto';
export type VideoQuality = '480p' | '720p' | '1080p' | '4k';
export type VideoCodec = 'h264' | 'h265';

// ============================================================================
// Capture Options
// ============================================================================

export interface PhotoCaptureOptions {
  quality: number; // 0-100
  format: 'jpeg' | 'png';
  enableAutoFocus: boolean;
  enableAutoExposure: boolean;
  flashMode: FlashMode;
  enableAutoStabilization?: boolean;
}

export interface VideoRecordingOptions {
  quality: VideoQuality;
  fps: 24 | 30 | 60;
  codec: VideoCodec;
  bitRate: number;
  enableAudio: boolean;
}

// ============================================================================
// Media Types
// ============================================================================

export interface MediaFile {
  uri: string;
  type: 'photo' | 'video';
  size: number;
  timestamp: number;
}

export interface MediaMetadata extends MediaFile {
  width?: number;
  height?: number;
  duration?: number; // for videos
  format: string;
  cameraPosition: CameraPosition;
}

// ============================================================================
// Camera State
// ============================================================================

export interface CameraState {
  isInitialized: boolean;
  isActive: boolean;
  isRecording: boolean;
  error: CameraError | null;
}

export interface CameraSessionState extends CameraState {
  sessionId: string;
  mode: CameraMode;
  device: CameraDevice | null;
  position: CameraPosition;
  flashMode: FlashMode;
  recordingStartTime: number | null;
  capturedMedia: MediaFile | null;
}

// ============================================================================
// Error Types
// ============================================================================

export enum CameraErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CAMERA_NOT_AVAILABLE = 'CAMERA_NOT_AVAILABLE',
  CAMERA_IN_USE = 'CAMERA_IN_USE',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  RECORDING_FAILED = 'RECORDING_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class CameraError extends Error {
  code: CameraErrorCode;
  userMessage: string;
  originalError?: unknown;

  constructor(
    code: CameraErrorCode,
    message: string,
    userMessage: string,
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'CameraError';
    this.code = code;
    this.userMessage = userMessage;
    this.originalError = originalError;
  }

  static fromUnknown(error: unknown): CameraError {
    if (error instanceof CameraError) {
      return error;
    }

    if (error instanceof Error) {
      return new CameraError(
        CameraErrorCode.UNKNOWN_ERROR,
        error.message,
        'An unexpected error occurred',
        error,
      );
    }

    return new CameraError(
      CameraErrorCode.UNKNOWN_ERROR,
      String(error),
      'An unexpected error occurred',
      error,
    );
  }

  static isRecoverable(error: CameraError): boolean {
    return [
      CameraErrorCode.PERMISSION_DENIED,
      CameraErrorCode.CAMERA_IN_USE,
      CameraErrorCode.STORAGE_ERROR,
    ].includes(error.code);
  }
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface CameraModalProps {
  visible: boolean;
  mode: CameraMode;
  onClose: () => void;
  onCapture: (uri: string) => void;
  onError: (error: CameraError) => void;
  // S3 upload parameters (optional - if not provided, returns local URI)
  uploadPath?: string;
  sectionKey?: string;
  appointmentId?: string;
}

export interface CameraControlsProps {
  mode: CameraMode;
  isRecording: boolean;
  hasFlash: boolean;
  flashMode: FlashMode;
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancel: () => void;
  onToggleFlash: () => void;
}

export interface CameraPreviewProps {
  device: CameraDevice;
  isActive: boolean;
  onInitialized: () => void;
  onError: (error: CameraError) => void;
  children?: React.ReactNode;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseCameraCaptureReturn {
  // State
  isCameraVisible: boolean;
  isCapturing: boolean;
  error: CameraError | null;

  // Actions
  openCamera: () => Promise<void>;
  closeCamera: () => void;
  capturePhoto: () => Promise<string>;

  // Permission state
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export interface UseCameraRecordingReturn {
  // State
  isCameraVisible: boolean;
  isRecording: boolean;
  recordingDuration: number;
  error: CameraError | null;

  // Actions
  openCamera: () => Promise<void>;
  closeCamera: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;

  // Permission state
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export interface UseCameraPermissionsReturn {
  // Permission status
  cameraPermission: PermissionStatus;
  microphonePermission: PermissionStatus;

  // Actions
  requestCameraPermission: () => Promise<boolean>;
  requestMicrophonePermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<boolean>;
  openSettings: () => void;

  // Computed state
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  hasAllPermissions: boolean;
}

// ============================================================================
// Re-export react-native-vision-camera types
// ============================================================================

export type { CameraDevice, VisionCamera };
