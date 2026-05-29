/**
 * Media utility functions for file handling and URI management
 * Provides cross-platform utilities for media file operations
 */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CAMERA_CONFIG } from './cameraConfig';

// Monotonic counter to guarantee uniqueness even within the same millisecond
let _fileNameCounter = 0;

// ============================================================================
// Directory Utilities
// ============================================================================

/**
 * Gets the temporary directory path for the current platform
 */
export function getTemporaryDirectory(): string {
  return RNFS.TemporaryDirectoryPath;
}

/**
 * Gets the cache directory path for the current platform
 */
export function getCacheDirectory(): string {
  return RNFS.CachesDirectoryPath;
}

// ============================================================================
// File Naming Utilities
// ============================================================================

/**
 * Generates a unique media file name with timestamp + monotonic counter
 * Format: {prefix}_{timestamp}_{counter}.{extension}
 * The counter guarantees uniqueness even for rapid successive calls within the same ms
 */
export function generateMediaFileName(type: 'photo' | 'video'): string {
  const timestamp = Date.now();
  const counter = ++_fileNameCounter;
  const prefix =
    type === 'photo'
      ? CAMERA_CONFIG.PHOTO_FILE_PREFIX
      : CAMERA_CONFIG.VIDEO_FILE_PREFIX;
  const extension =
    type === 'photo'
      ? CAMERA_CONFIG.FILE_EXTENSION_PHOTO
      : CAMERA_CONFIG.FILE_EXTENSION_VIDEO;

  return `${prefix}${timestamp}_${counter}${extension}`;
}

/**
 * Gets the full file path for a media file in the cache directory
 */
export function getMediaFilePath(type: 'photo' | 'video'): string {
  const directory = CAMERA_CONFIG.USE_CACHE_DIRECTORY
    ? getCacheDirectory()
    : getTemporaryDirectory();
  const fileName = generateMediaFileName(type);

  return `${directory}/${fileName}`;
}

// ============================================================================
// URI Utilities
// ============================================================================

/**
 * Normalizes a media URI to ensure it has a valid scheme
 * Handles platform-specific URI formats
 */
export function normalizeMediaUri(uri: string): string {
  if (!uri) {
    return '';
  }

  // Already has a valid scheme
  if (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://')
  ) {
    return uri;
  }

  // Add file:// scheme for absolute paths
  if (Platform.OS === 'ios') {
    return `file://${uri}`;
  }

  // Android may use content:// for some files, but default to file://
  return `file://${uri}`;
}

/**
 * Validates if a string is a valid media URI
 */
export function isValidMediaUri(uri: string): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }

  try {
    const validSchemes = ['file://', 'content://', 'http://', 'https://'];
    return validSchemes.some(scheme => uri.startsWith(scheme));
  } catch {
    return false;
  }
}

/**
 * Gets the URI scheme from a media URI
 */
export function getMediaUriScheme(
  uri: string,
): 'file' | 'content' | 'http' | 'https' | null {
  if (uri.startsWith('file://')) return 'file';
  if (uri.startsWith('content://')) return 'content';
  if (uri.startsWith('https://')) return 'https';
  if (uri.startsWith('http://')) return 'http';
  return null;
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Deletes a media file at the given URI
 */
export async function deleteMediaFile(uri: string): Promise<void> {
  try {
    const filePath = uri.replace('file://', '');
    const exists = await RNFS.exists(filePath);

    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    console.error('[mediaUtils] Failed to delete media file:', error);
    throw error;
  }
}

/**
 * Gets the file size in bytes for a media file
 */
export async function getMediaFileSize(uri: string): Promise<number> {
  try {
    const filePath = uri.replace('file://', '');
    const stat = await RNFS.stat(filePath);
    return parseInt(String(stat.size), 10);
  } catch (error) {
    console.error('[mediaUtils] Failed to get media file size:', error);
    return 0;
  }
}

/**
 * Checks if a media file exists at the given URI
 */
export async function doesMediaFileExist(uri: string): Promise<boolean> {
  try {
    const filePath = uri.replace('file://', '');
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('[mediaUtils] Failed to check media file existence:', error);
    return false;
  }
}

// ============================================================================
// Platform-Specific Utilities
// ============================================================================

/**
 * Converts a URI to file:// scheme (iOS compatible)
 */
export function convertToFileUri(uri: string): string {
  if (uri.startsWith('file://')) {
    return uri;
  }

  if (uri.startsWith('content://')) {
    // On Android, content:// URIs need special handling
    // For now, return as-is (may need platform-specific conversion)
    return uri;
  }

  return `file://${uri}`;
}

/**
 * Converts a URI to content:// scheme (Android compatible)
 * Note: This is a placeholder - actual implementation may require
 * platform-specific file provider setup
 */
export function convertToContentUri(uri: string): string {
  if (uri.startsWith('content://')) {
    return uri;
  }

  // For Android, we might need to use a FileProvider
  // This is a simplified implementation
  return uri;
}

/**
 * Gets a platform-appropriate URI for the given file path
 */
export function getPlatformUri(filePath: string): string {
  if (Platform.OS === 'ios') {
    return convertToFileUri(filePath);
  }

  // Android can use file:// URIs for most cases
  return convertToFileUri(filePath);
}
