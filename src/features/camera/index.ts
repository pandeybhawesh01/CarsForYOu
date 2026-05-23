/**
 * Public API for the camera feature module
 * Import from here instead of reaching into subdirectories
 */

// Components
export { default as CameraModal } from './components/CameraModal';
export { default as CameraControls } from './components/CameraControls';
export { default as CameraPreview } from './components/CameraPreview';
export { RecordingTimer } from './components/RecordingTimer';

// Hooks
export { useCameraCapture } from './hooks/useCameraCapture';
export { useCameraRecording } from './hooks/useCameraRecording';
export { useCameraPermissions } from './hooks/useCameraPermissions';

// Services
export { CameraService } from './services/CameraService';
export { PermissionService } from './services/PermissionService';

// Utilities
export {
  generateMediaFileName,
  getMediaFilePath,
  normalizeMediaUri,
  isValidMediaUri,
  getMediaUriScheme,
  deleteMediaFile,
  getMediaFileSize,
  doesMediaFileExist,
  getCacheDirectory,
  getTemporaryDirectory,
  getPlatformUri,
} from './utils/mediaUtils';

export {
  CAMERA_CONFIG,
  FLASH_MODES,
  CAMERA_POSITIONS,
  VIDEO_QUALITIES,
  getNextFlashMode,
  isValidFlashMode,
  isValidCameraPosition,
  isValidVideoQuality,
} from './utils/cameraConfig';

export {
  ERROR_MESSAGES,
  logCameraError,
  createPermissionDeniedError,
  createCameraNotAvailableError,
  createCaptureFailedError,
  createRecordingFailedError,
  createStorageError,
} from './utils/cameraErrors';

// Types
export type {
  PermissionStatus,
  PermissionState,
  CameraMode,
  CameraPosition,
  FlashMode,
  VideoQuality,
  VideoCodec,
  PhotoCaptureOptions,
  VideoRecordingOptions,
  MediaFile,
  MediaMetadata,
  CameraState,
  CameraSessionState,
  CameraModalProps,
  CameraControlsProps,
  CameraPreviewProps,
  UseCameraCaptureReturn,
  UseCameraRecordingReturn,
  UseCameraPermissionsReturn,
} from './types';

export { CameraError, CameraErrorCode } from './types';
