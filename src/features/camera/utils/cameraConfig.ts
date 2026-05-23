/**
 * Camera configuration constants
 * Centralized configuration for camera quality, performance, and storage settings
 */

import type { FlashMode, CameraPosition, VideoQuality } from '../types';

// ============================================================================
// Camera Configuration
// ============================================================================

export const CAMERA_CONFIG = {
  // Photo settings
  PHOTO_QUALITY: 100, // 0-100, 100 = maximum quality
  PHOTO_FORMAT: 'jpeg' as const,
  PHOTO_MAX_RESOLUTION: { width: 4096, height: 3072 },

  // Video settings
  VIDEO_QUALITY: '1080p' as const,
  VIDEO_FPS: 30,
  VIDEO_CODEC: 'h264' as const,
  VIDEO_BIT_RATE: 5000000, // 5 Mbps

  // Camera settings
  DEFAULT_CAMERA: 'back' as const,
  ENABLE_AUTO_FOCUS: true,
  ENABLE_AUTO_EXPOSURE: true,
  ENABLE_AUTO_STABILIZATION: true,

  // Performance settings
  CAMERA_INIT_TIMEOUT: 2000, // 2 seconds
  MAX_RECORDING_DURATION: 300000, // 5 minutes in milliseconds

  // Storage settings
  USE_CACHE_DIRECTORY: true,
  AUTO_CLEANUP_ON_UNMOUNT: false,

  // File naming
  PHOTO_FILE_PREFIX: 'photo_',
  VIDEO_FILE_PREFIX: 'video_',
  FILE_EXTENSION_PHOTO: '.jpg',
  FILE_EXTENSION_VIDEO: '.mp4',
} as const;

// ============================================================================
// Flash Modes
// ============================================================================

export const FLASH_MODES = ['off', 'on', 'auto'] as const;
export type FlashModeType = typeof FLASH_MODES[number];

// ============================================================================
// Camera Positions
// ============================================================================

export const CAMERA_POSITIONS = ['back', 'front'] as const;
export type CameraPositionType = typeof CAMERA_POSITIONS[number];

// ============================================================================
// Video Qualities
// ============================================================================

export const VIDEO_QUALITIES = ['480p', '720p', '1080p', '4k'] as const;
export type VideoQualityType = typeof VIDEO_QUALITIES[number];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a flash mode is valid
 */
export function isValidFlashMode(mode: string): mode is FlashMode {
  return FLASH_MODES.includes(mode as FlashMode);
}

/**
 * Checks if a camera position is valid
 */
export function isValidCameraPosition(
  position: string,
): position is CameraPosition {
  return CAMERA_POSITIONS.includes(position as CameraPosition);
}

/**
 * Checks if a video quality is valid
 */
export function isValidVideoQuality(quality: string): quality is VideoQuality {
  return VIDEO_QUALITIES.includes(quality as VideoQuality);
}

/**
 * Gets the next flash mode in the cycle (off -> on -> auto -> off)
 */
export function getNextFlashMode(currentMode: FlashMode): FlashMode {
  const currentIndex = FLASH_MODES.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % FLASH_MODES.length;
  return FLASH_MODES[nextIndex];
}
