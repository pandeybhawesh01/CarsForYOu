/**
 * Camera error definitions and user-friendly error messages
 * Provides centralized error handling for camera operations
 */

import { CameraError, CameraErrorCode } from '../types';

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES: Record<CameraErrorCode, string> = {
  [CameraErrorCode.PERMISSION_DENIED]:
    'Camera permission is required. Please grant permission in Settings.',
  [CameraErrorCode.CAMERA_NOT_AVAILABLE]:
    'No camera detected on this device.',
  [CameraErrorCode.CAMERA_IN_USE]:
    'Camera is being used by another app. Please close it and try again.',
  [CameraErrorCode.INITIALIZATION_FAILED]:
    'Failed to initialize camera. Please try again.',
  [CameraErrorCode.CAPTURE_FAILED]:
    'Failed to capture photo. Please try again.',
  [CameraErrorCode.RECORDING_FAILED]:
    'Failed to record video. Please try again.',
  [CameraErrorCode.STORAGE_ERROR]:
    'Insufficient storage space. Please free up space and try again.',
  [CameraErrorCode.UNKNOWN_ERROR]:
    'An unexpected error occurred. Please try again.',
};

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Logs camera errors with context for debugging
 * In production, this should send to error tracking service (e.g., Sentry)
 */
export function logCameraError(error: CameraError, context: string): void {
  console.error(`[Camera Error] ${context}`, {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    originalError: error.originalError,
    timestamp: new Date().toISOString(),
  });

  // TODO: In production, send to error tracking service
  // ErrorTracker.captureException(error, { context });
}

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Creates a CameraError for permission denial
 */
export function createPermissionDeniedError(
  originalError?: unknown,
): CameraError {
  return new CameraError(
    CameraErrorCode.PERMISSION_DENIED,
    'Camera permission denied',
    ERROR_MESSAGES[CameraErrorCode.PERMISSION_DENIED],
    originalError,
  );
}

/**
 * Creates a CameraError for camera not available
 */
export function createCameraNotAvailableError(
  originalError?: unknown,
): CameraError {
  return new CameraError(
    CameraErrorCode.CAMERA_NOT_AVAILABLE,
    'Camera not available',
    ERROR_MESSAGES[CameraErrorCode.CAMERA_NOT_AVAILABLE],
    originalError,
  );
}

/**
 * Creates a CameraError for camera in use
 */
export function createCameraInUseError(originalError?: unknown): CameraError {
  return new CameraError(
    CameraErrorCode.CAMERA_IN_USE,
    'Camera in use',
    ERROR_MESSAGES[CameraErrorCode.CAMERA_IN_USE],
    originalError,
  );
}

/**
 * Creates a CameraError for initialization failure
 */
export function createInitializationFailedError(
  originalError?: unknown,
): CameraError {
  return new CameraError(
    CameraErrorCode.INITIALIZATION_FAILED,
    'Camera initialization failed',
    ERROR_MESSAGES[CameraErrorCode.INITIALIZATION_FAILED],
    originalError,
  );
}

/**
 * Creates a CameraError for capture failure
 */
export function createCaptureFailedError(
  originalError?: unknown,
): CameraError {
  return new CameraError(
    CameraErrorCode.CAPTURE_FAILED,
    'Photo capture failed',
    ERROR_MESSAGES[CameraErrorCode.CAPTURE_FAILED],
    originalError,
  );
}

/**
 * Creates a CameraError for recording failure
 */
export function createRecordingFailedError(
  originalError?: unknown,
): CameraError {
  return new CameraError(
    CameraErrorCode.RECORDING_FAILED,
    'Video recording failed',
    ERROR_MESSAGES[CameraErrorCode.RECORDING_FAILED],
    originalError,
  );
}

/**
 * Creates a CameraError for storage error
 */
export function createStorageError(originalError?: unknown): CameraError {
  return new CameraError(
    CameraErrorCode.STORAGE_ERROR,
    'Storage error',
    ERROR_MESSAGES[CameraErrorCode.STORAGE_ERROR],
    originalError,
  );
}

// ============================================================================
// Exports
// ============================================================================

export { CameraError, CameraErrorCode } from '../types';
