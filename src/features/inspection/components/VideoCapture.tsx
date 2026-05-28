/**
 * VideoCapture - Video recording UI with real camera integration and video preview
 * Uses CameraModal for actual recording; shows video preview with playback controls
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  onCapture: (uri: string, capturedAt?: string) => void;
  isRequired?: boolean;
  hint?: string;
  // S3 upload parameters
  uploadPath?: string;
  sectionKey?: string;
  appointmentId?: string;
  capturedAt?: string; // Timestamp for cache busting
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
  capturedAt,
}) => {
  const logPreview = useCallback((message: string, ...details: unknown[]) => {
    console.log(`[VideoCapture] ${message}`, ...details);
  }, []);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setIsVideoLoading(false);
  }, [videoUri]);

  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    setIsPreviewOpen(false);
    onCapture('');
    setIsPlaying(false);
    setVideoLoadError(false);
    setVideoFileError(null);
  }, [onCapture]);

  const handleVideoLoadStart = useCallback(() => {
    setIsVideoLoading(true);
  }, []);

  const handleVideoLoadEnd = useCallback(() => {
    setIsVideoLoading(false);
  }, []);

  // Add cache busting for S3 URLs to prevent stale video caching
  const getCacheBustedUri = useCallback((uri: string) => {
    if (!uri) return uri;
    
    // Only add cache buster for S3 URLs (remote videos)
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      // Use capturedAt timestamp if available, otherwise use current time
      const timestamp = capturedAt ? new Date(capturedAt).getTime() : Date.now();
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}_t=${timestamp}`;
    }
    
    // Local file URIs don't need cache busting
    return uri;
  }, [capturedAt]);

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
  const displayUri = getCacheBustedUri(normalizedVideoUri);
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
      displayUri,
      canRenderVideo,
      isPlaying,
      videoLoadError,
      videoFileError,
      cameraError,
    });
  }, [
    cameraError,
    canRenderVideo,
    displayUri,
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
        <TouchableOpacity 
          style={styles.previewContainer}
          onPress={handleOpenPreview}
          activeOpacity={0.8}>
          {canRenderVideo ? (
            <>
              <View style={styles.videoThumbnail}>
                <WebView
                  style={styles.thumbnailVideo}
                  originWhitelist={['*']}
                  source={{ html: buildVideoPreviewHtml(displayUri) }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  allowFileAccess
                  allowFileAccessFromFileURLs
                  allowUniversalAccessFromFileURLs
                  mixedContentMode="always"
                  onLoadStart={handleVideoLoadStart}
                  onLoadEnd={handleVideoLoadEnd}
                  onError={(event: any) => {
                    console.log('[VideoCapture] preview WebView error', event.nativeEvent);
                    handleVideoError(event.nativeEvent);
                  }}
                />
                {/* Play button overlay */}
                <View style={styles.playOverlay}>
                  <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>
              </View>
              {isVideoLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderIcon}>🎥</Text>
              <Text style={styles.videoPlaceholderText}>
                {videoFileError ?? (videoLoadError ? 'Video preview unavailable' : 'Video recorded')}
              </Text>
            </View>
          )}
          
          {/* Delete button overlay */}
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.deleteButton}
            accessibilityLabel="Delete video"
            accessibilityRole="button">
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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

      {/* Full-size preview modal */}
      <Modal
        visible={isPreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClosePreview}>
        <SafeAreaView style={styles.previewModalContainer} edges={['top', 'bottom']}>
          <View style={styles.previewModalContent}>
            {/* Full-size video player with zoom */}
            <ScrollView
              style={styles.videoScrollView}
              contentContainerStyle={styles.videoScrollContent}
              maximumZoomScale={2}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <View style={styles.videoPlayerContainer}>
                <WebView
                  style={styles.fullSizeVideo}
                  originWhitelist={['*']}
                  source={{ html: buildVideoPreviewHtml(displayUri) }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  allowFileAccess
                  allowFileAccessFromFileURLs
                  allowUniversalAccessFromFileURLs
                  mixedContentMode="always"
                />
              </View>
            </ScrollView>
            
            {/* Action buttons */}
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewActionButton, styles.deleteActionButton]}
                onPress={handleDelete}
                accessibilityLabel="Delete video"
                accessibilityRole="button">
                <Text style={styles.previewActionIcon}>🗑️</Text>
                <Text style={styles.previewActionText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.previewActionButton, styles.closeActionButton]}
                onPress={handleClosePreview}
                accessibilityLabel="Close preview"
                accessibilityRole="button">
                <Text style={styles.previewActionIcon}>✕</Text>
                <Text style={styles.previewActionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    position: 'relative',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playIcon: {
    fontSize: 28,
    color: colors.primary,
    marginLeft: 4,
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
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  deleteIcon: {
    fontSize: 18,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: vs(8),
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  previewModalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  videoScrollView: {
    flex: 1,
  },
  videoScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  fullSizeVideo: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(24),
    gap: spacing.base,
  },
  previewActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(16),
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  deleteActionButton: {
    backgroundColor: colors.error,
  },
  closeActionButton: {
    backgroundColor: colors.textSecondary,
  },
  previewActionIcon: {
    fontSize: 20,
  },
  previewActionText: {
    fontSize: typography.fontSize.base,
    color: colors.surface,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(VideoCapture);
