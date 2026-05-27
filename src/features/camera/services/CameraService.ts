/**
 * CameraService - Encapsulates camera operation helpers
 * Works with react-native-vision-camera v5 output API
 */

import {
  CameraError,
  CameraErrorCode,
  type PhotoCaptureOptions,
  type VideoRecordingOptions,
} from '../types';
import { CAMERA_CONFIG } from '../utils/cameraConfig';
import { getPlatformUri } from '../utils/mediaUtils';
import {
  logCameraError,
  createCaptureFailedError,
  createRecordingFailedError,
  createCameraNotAvailableError,
  createInitializationFailedError,
} from '../utils/cameraErrors';

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_PHOTO_OPTIONS: PhotoCaptureOptions = {
  quality: CAMERA_CONFIG.PHOTO_QUALITY,
  format: CAMERA_CONFIG.PHOTO_FORMAT,
  enableAutoFocus: CAMERA_CONFIG.ENABLE_AUTO_FOCUS,
  enableAutoExposure: CAMERA_CONFIG.ENABLE_AUTO_EXPOSURE,
  flashMode: 'off',
  enableAutoStabilization: CAMERA_CONFIG.ENABLE_AUTO_STABILIZATION,
};

const DEFAULT_VIDEO_OPTIONS: VideoRecordingOptions = {
  quality: CAMERA_CONFIG.VIDEO_QUALITY,
  fps: CAMERA_CONFIG.VIDEO_FPS,
  codec: CAMERA_CONFIG.VIDEO_CODEC,
  bitRate: CAMERA_CONFIG.VIDEO_BIT_RATE,
  enableAudio: true,
};

// ============================================================================
// CameraService
// ============================================================================

export class CameraService {
  // --------------------------------------------------------------------------
  // Default Options
  // --------------------------------------------------------------------------

  static getDefaultPhotoOptions(): PhotoCaptureOptions {
    return { ...DEFAULT_PHOTO_OPTIONS };
  }

  static getDefaultVideoOptions(): VideoRecordingOptions {
    return { ...DEFAULT_VIDEO_OPTIONS };
  }

  // --------------------------------------------------------------------------
  // Photo Capture (v5: via photoOutput.capturePhotoToFile())
  // --------------------------------------------------------------------------

  /**
   * Captures a photo using the provided camera ref
   * Returns a normalized file URI compatible with React Native Image component
   */
  static async capturePhoto(
    photoOutput: any,
    options: Partial<PhotoCaptureOptions> = {},
  ): Promise<string> {
    const mergedOptions = { ...DEFAULT_PHOTO_OPTIONS, ...options };

    try {
      if (!photoOutput?.capturePhotoToFile) {
        throw createCameraNotAvailableError(new Error('Photo output not initialized'));
      }

      const photoFile = await photoOutput.capturePhotoToFile(
        { flashMode: mergedOptions.flashMode },
        {},
      );

      // filePath is an absolute file path — normalize to file:// URI
      const uri = getPlatformUri(photoFile.filePath);
      console.log('[CameraService] Photo captured at:', uri);
      return uri;
    } catch (error) {
      const cameraError = CameraService.handleCameraError(error, 'capturePhoto');
      logCameraError(cameraError, 'CameraService.capturePhoto');
      throw cameraError;
    }
  }

  // --------------------------------------------------------------------------
  // Video Recording (v5: via Recorder.startRecording() / Recorder.stopRecording())
  // --------------------------------------------------------------------------

  /**
   * Starts video recording using the provided camera ref
   */
  static async startRecording(
    recorder: any,
    onRecordingFinished: (uri: string) => void,
    onRecordingError: (error: CameraError) => void,
  ): Promise<void> {
    try {
      if (!recorder?.startRecording) {
        throw createCameraNotAvailableError(new Error('Recorder not initialized'));
      }

      await recorder.startRecording(
        (filePath: string) => {
          // Fix Vision Camera v5 bug: missing dot before mp4 extension
          // Changes "VisionCamera_123mp4" to "VisionCamera_123.mp4"
          const fixedPath = filePath.replace(/(\d+)(mp4)$/, '$1.$2');
          const uri = getPlatformUri(fixedPath);
          console.log('[CameraService] Video recorded at:', uri);
          onRecordingFinished(uri);
        },
        (error: Error) => {
          const cameraError = CameraService.handleCameraError(
            error,
            'startRecording',
          );
          logCameraError(cameraError, 'CameraService.startRecording');
          onRecordingError(cameraError);
        },
      );
    } catch (error) {
      const cameraError = CameraService.handleCameraError(error, 'startRecording');
      logCameraError(cameraError, 'CameraService.startRecording');
      throw cameraError;
    }
  }

  /**
   * Stops the current video recording
   */
  static async stopRecording(recorder: any): Promise<void> {
    try {
      if (!recorder?.stopRecording) {
        throw createCameraNotAvailableError(new Error('Recorder not initialized'));
      }
      await recorder.stopRecording();
      console.log('[CameraService] Recording stopped');
    } catch (error) {
      const cameraError = CameraService.handleCameraError(error, 'stopRecording');
      logCameraError(cameraError, 'CameraService.stopRecording');
      throw cameraError;
    }
  }

  // --------------------------------------------------------------------------
  // Error Handling
  // --------------------------------------------------------------------------

  static handleCameraError(error: unknown, context: string): CameraError {
    if (error instanceof CameraError) {
      return error;
    }

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes('permission') || msg.includes('unauthorized')) {
        return new CameraError(
          CameraErrorCode.PERMISSION_DENIED,
          error.message,
          'Camera permission is required. Please grant permission in Settings.',
          error,
        );
      }

      if (msg.includes('no camera') || msg.includes('not available') || msg.includes('unavailable')) {
        return createCameraNotAvailableError(error);
      }

      if (msg.includes('in use') || msg.includes('busy') || msg.includes('already')) {
        return new CameraError(
          CameraErrorCode.CAMERA_IN_USE,
          error.message,
          'Camera is being used by another app. Please close it and try again.',
          error,
        );
      }

      if (msg.includes('storage') || msg.includes('disk') || msg.includes('space')) {
        return new CameraError(
          CameraErrorCode.STORAGE_ERROR,
          error.message,
          'Insufficient storage space. Please free up space and try again.',
          error,
        );
      }

      if (context === 'capturePhoto') {
        return createCaptureFailedError(error);
      }

      if (context === 'startRecording' || context === 'stopRecording') {
        return createRecordingFailedError(error);
      }

      return createInitializationFailedError(error);
    }

    return CameraError.fromUnknown(error);
  }
}
