/**
 * S3 Upload Utility
 *
 * Handles file uploads to S3 using presigned URLs.
 * Supports progress tracking, content type handling, and abort.
 *
 * C-10: returns an `abort()` so callers can cancel mid-flight (e.g. if the
 * camera modal is closed during upload).
 */

import RNFS from 'react-native-fs';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadHandle {
  promise: Promise<void>;
  abort: () => void;
}

/**
 * Upload a file to S3 using a presigned URL.
 *
 * @returns `{ promise, abort }` — call `abort()` to cancel; `await promise`
 *          for completion. Aborting causes the promise to reject with an
 *          `Error('Upload aborted')`.
 */
export function uploadToS3(
  localUri: string,
  presignedUrl: string,
  onProgress?: (progress: UploadProgress) => void,
): UploadHandle {
  console.log('[S3Upload] 📤 Starting upload');
  console.log('[S3Upload] 📁 Local URI:', localUri);
  console.log('[S3Upload] 🔗 Presigned URL:', presignedUrl.substring(0, 100) + '...');

  let aborted = false;
  const xhr = new XMLHttpRequest();

  const promise = (async () => {
    // Normalize file path (remove file:// prefix if present)
    const filePath = localUri.replace('file://', '');

    // Determine content type from URI
    const isVideo = /\.(mp4|mov|m4v)$/i.test(filePath) || filePath.toLowerCase().includes('video');
    const contentType = isVideo ? 'video/mp4' : 'image/jpeg';

    console.log('[S3Upload] 📋 Content type:', contentType);
    console.log('[S3Upload] 📂 File path:', filePath);

    // Get file stats
    const fileStats = await RNFS.stat(filePath);
    const fileSize = fileStats.size;
    console.log('[S3Upload] 📊 File size:', fileSize, 'bytes');

    if (aborted) {
      throw new Error('Upload aborted');
    }

    await new Promise<void>((resolve, reject) => {
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      };

      xhr.onload = () => {
        console.log('[S3Upload] 📡 Upload response status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('[S3Upload] ✅ Upload successful');
          resolve();
        } else {
          console.error('[S3Upload] ❌ Upload failed with status:', xhr.status);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        if (aborted) {
          reject(new Error('Upload aborted'));
        } else {
          console.error('[S3Upload] ❌ Network error during upload');
          reject(new Error('Network error during upload'));
        }
      };

      xhr.onabort = () => {
        console.log('[S3Upload] ⏹ Upload aborted by caller');
        reject(new Error('Upload aborted'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // Open connection
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', contentType);

      // Send file using local URI (React Native XHR supports file:// URIs)
      console.log('[S3Upload] 🚀 Sending file...');
      xhr.send({ uri: localUri, type: contentType, name: 'file' } as unknown as Document);
    });
  })();

  return {
    promise,
    abort: () => {
      aborted = true;
      try {
        xhr.abort();
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * Delete a local file after successful upload.
 *
 * @param localUri - Local file URI to delete
 */
export async function deleteLocalFile(localUri: string): Promise<void> {
  try {
    console.log('[S3Upload] 🗑️ Deleting local file:', localUri);

    // Normalize file path
    const filePath = localUri.replace('file://', '');

    // Check if file exists
    const exists = await RNFS.exists(filePath);

    if (exists) {
      await RNFS.unlink(filePath);
      console.log('[S3Upload] ✅ Local file deleted');
    } else {
      console.log('[S3Upload] ℹ️ File does not exist, skipping deletion');
    }
  } catch (error) {
    console.error('[S3Upload] ⚠️ Failed to delete local file:', error);
    // Don't throw - deletion failure shouldn't break the flow
  }
}
