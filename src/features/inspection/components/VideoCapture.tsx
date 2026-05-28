/**
 * VideoCapture - Video recording UI with real camera integration and video preview
 * Uses CameraModal for actual recording; shows video preview with playback controls
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs } from '../../../utils/scaling';
import CameraModal from '../../camera/components/CameraModal';
import type { CameraError } from '../../camera/types';
import {
  doesMediaFileExist,
  getMediaFileSize,
  isValidMediaUri,
  normalizeMediaUri,
} from '../../camera/utils/mediaUtils';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildVideoPreviewHtml = (videoUri: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
      }
    </style>
  </head>
  <body>
    <video controls playsinline webkit-playsinline src="${escapeHtml(encodeURI(videoUri))}"></video>
  </body>
</html>`;

// ============================================================================
// Props (unchanged — backward compatible)
// ============================================================================

interface VideoCaptureProps {
  label: string;
  videoUri?: string;
  onCapture: (uri: string) => void;
  isRequired?: boolean;
  hint?: string;
  // S3 upload parameters
  uploadPath?: string;
  sectionKey?: string;
  appointmentId?: string;
}

// ============================================================================
// Component
// ============================================================================

const VideoCapture: React.FC<VideoCaptureProps> = ({
  label,
  videoUri,
  onCapture,
  isRequired = false,
  hint,
  uploadPath,
  sectionKey,
  appointmentId,
}) => {
  const logPreview = useCallback((message: string, ...details: unknown[]) => {
    console.log(`[VideoCapture] ${message}`, ...details);
  }, []);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleOpenCamera = useCallback(() => {
    logPreview('Open camera pressed', { label, videoUri });
    setCameraError(null);
    setIsPlaying(false);
    setIsCameraOpen(true);
  }, [label, logPreview, videoUri]);

  const handleRecordingSuccess = useCallback(
    (uri: string) => {
      logPreview('Recording success', { label, uri });
      setIsCameraOpen(false);
      setIsPlaying(false);
      setVideoLoadError(false);
      setVideoFileError(null);
      onCapture(uri);
    },
    [label, logPreview, onCapture],
  );

  const handleCameraClose = useCallback(() => {
    logPreview('Camera modal closed', { label });
    setIsCameraOpen(false);
  }, [label, logPreview]);

  const handleCameraError = useCallback((err: CameraError) => {
    console.error('[VideoCapture] Camera error:', err);
    setIsCameraOpen(false);
    setCameraError(err.userMessage);
  }, []);

  const handleEdit = useCallback(() => {
    logPreview('Re-record pressed', { label, videoUri });
    onCapture('');
    setIsPlaying(false);
    setVideoLoadError(false);
    setVideoFileError(null);
  }, [label, logPreview, onCapture, videoUri]);

  const handleVideoError = useCallback((error: any) => {
    console.error('[VideoCapture] Video load error:', error);
    console.error('[VideoCapture] Video URI that failed:', videoUri);
    setIsPlaying(false);
    setVideoLoadError(true);
  }, [videoUri]);

  useEffect(() => {
    let isCancelled = false;

    const checkVideoFile = async () => {
      if (!videoUri) {
        logPreview('Skipping video file check because videoUri is empty', { label });
        setVideoFileError(null);
        return;
      }

      const normalized = normalizeMediaUri(videoUri);
      logPreview('Checking video file', { label, videoUri, normalized });
      if (!isValidMediaUri(normalized)) {
        logPreview('Video URI is invalid', { label, normalized });
        if (!isCancelled) {
          setVideoFileError('Invalid video URI');
        }
        return;
      }

      try {
        const exists = await doesMediaFileExist(normalized);
        logPreview('Video file exists check result', { label, normalized, exists });
        if (!exists) {
          if (!isCancelled) {
            setVideoFileError('Video file not found');
          }
          return;
        }

        const size = await getMediaFileSize(normalized);
        logPreview('Video file size result', { label, normalized, size });
        if (size <= 0) {
          if (!isCancelled) {
            setVideoFileError('Video file is empty');
          }
          return;
        }

        if (!isCancelled) {
          setVideoFileError(null);
        }
      } catch (error) {
        console.error('[VideoCapture] Video file check failed:', error);
        if (!isCancelled) {
          setVideoFileError('Unable to read video file');
        }
      }
    };

    checkVideoFile();

    return () => {
      isCancelled = true;
    };
  }, [videoUri]);

  const normalizedVideoUri = videoUri ? normalizeMediaUri(videoUri) : '';
  const canRenderVideo = Boolean(
    videoUri &&
    !videoLoadError &&
    !videoFileError &&
    isValidMediaUri(normalizedVideoUri),
  );

  useEffect(() => {
    logPreview('Preview render state', {
      label,
      videoUri,
      normalizedVideoUri,
      canRenderVideo,
      isPlaying,
      videoLoadError,
      videoFileError,
      cameraError,
    });
  }, [
    cameraError,
    canRenderVideo,
    label,
    logPreview,
    normalizedVideoUri,
    isPlaying,
    videoFileError,
    videoLoadError,
    videoUri,
  ]);

  const errorMessage = cameraError ?? videoFileError;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Label row */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}

      {/* Error message */}
      {errorMessage && (
        <View
          style={styles.errorContainer}
          accessible
          accessibilityRole="alert">
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Preview or record button */}
      {videoUri ? (
        <View style={styles.previewContainer}>
          {canRenderVideo ? (
            <View style={styles.videoThumbnail}>
              <WebView
                style={styles.thumbnailVideo}
                originWhitelist={['*']}
                source={{ html: buildVideoPreviewHtml(normalizedVideoUri) }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                onError={(event: any) => console.log('[VideoCapture] preview WebView error', event.nativeEvent)}
              />
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderIcon}>🎥</Text>
              <Text style={styles.videoPlaceholderText}>
                {videoFileError ?? (videoLoadError ? 'Video preview unavailable' : 'Video recorded')}
              </Text>
            </View>
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.actionButton}
              accessibilityLabel="Re-record video"
              accessibilityRole="button">
              <Text style={styles.actionText}>↻ Re-record</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleOpenCamera}
          activeOpacity={0.7}
          accessibilityLabel={`Record video: ${label}`}
          accessibilityHint="Double tap to open camera for video recording"
          accessibilityRole="button">
          <Text style={styles.videoIcon}>🎥</Text>
          <Text style={styles.captureText}>Tap to record</Text>
        </TouchableOpacity>
      )}

      {/* Camera modal — fully isolated camera logic */}
      <CameraModal
        visible={isCameraOpen}
        mode="video"
        onClose={handleCameraClose}
        onCapture={handleRecordingSuccess}
        onError={handleCameraError}
        uploadPath={uploadPath}
        sectionKey={sectionKey}
        appointmentId={appointmentId}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(20),
  },
  header: {
    flexDirection: 'row',
    marginBottom: vs(8),
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  required: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: vs(8),
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: vs(8),
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
  },
  captureButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: vs(28),
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  videoIcon: {
    fontSize: 32,
    marginBottom: vs(8),
  },
  captureText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  previewContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  videoThumbnail: {
    height: vs(160),
    backgroundColor: colors.surfaceSecondary,
  },
  thumbnailVideo: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
  },
  videoPlaceholder: {
    height: vs(160),
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: vs(8),
  },
  videoPlaceholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 22,
    color: colors.surface,
  },
  actionRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default memo(VideoCapture);
