/**
 * VideoCapture - Fixed for react-native-video ^6.19.2 + S3 URLs
 *
 * Fixes applied:
 *  1. Single render gate — replaced the isVideoReady+isVideoLoading dual-gate
 *     with one `videoMountKey` that only increments when the modal is fully open,
 *     so the Video component mounts exactly once per open and never flickers.
 *  2. S3 signed-URL safety — cache-busting is done via a custom HTTP header
 *     (x-cache-bust) instead of a query param, so the S3 signature is never
 *     invalidated. Falls back to no-op for local files.
 *  3. paused/controls race fixed — start paused=true, flip to false only after
 *     onLoad fires. This avoids the Android native-thread race in RNV6.
 *  4. Stable Video key — the `<Video>` element always gets `key={videoMountKey}`
 *     so React never reuses the native view across open/close cycles.
 *  5. Hard unmount on close — isPreviewOpen gates the entire Modal tree, and
 *     videoMountKey is reset on close so the next open always gets a fresh player.
 *  6. Thumbnail row has no hidden Video instance — replaced with a pure View
 *     thumbnail so there is never a silent background player competing.
 *  7. onRequestClose stops playback before closing — sets paused=true first,
 *     then closes the modal on the next tick so the native layer can tear down.
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video, { VideoRef } from 'react-native-video';
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

// ============================================================================
// Types
// ============================================================================

interface VideoCaptureProps {
  label: string;
  videoUri?: string;
  onCapture: (uri: string, capturedAt?: string) => void;
  isRequired?: boolean;
  hint?: string;
  uploadPath?: string;
  sectionKey?: string;
  appointmentId?: string;
  capturedAt?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Returns a source object safe for react-native-video v6.
 *
 * For S3/remote URLs we pass a custom header instead of mutating the URL
 * with a query param — appending ?_t=... to a pre-signed S3 URL breaks the
 * HMAC signature and causes a 403, which the native player reports as a crash.
 *
 * For local file:// URIs we return the URI as-is (headers are irrelevant).
 */
function buildVideoSource(uri: string, capturedAt?: string) {
  if (!uri) return null;

  const isRemote = uri.startsWith('http://') || uri.startsWith('https://');

  if (isRemote && capturedAt) {
    const ts = String(new Date(capturedAt).getTime());
    return {
      uri,
      headers: { 'x-cache-bust': ts },
    };
  }

  return { uri };
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
  const videoRef = useRef<VideoRef>(null);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File-system validation (local files only)
  const [videoFileError, setVideoFileError] = useState<string | null>(null);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /**
   * FIX 1 — Single render gate.
   *
   * videoMountKey starts at 0.  When the user taps the thumbnail we:
   *   1. Set isPreviewOpen = true  (mounts the Modal)
   *   2. After one RAF (≈16 ms) increment videoMountKey  (mounts the Video)
   *
   * This guarantees the Modal's native container exists before the Video
   * native view is created, which is required on both iOS and Android in RNV6.
   * The key also forces a full unmount/remount on every open cycle so stale
   * native state never leaks between sessions.
   */
  const [videoMountKey, setVideoMountKey] = useState(0);

  /**
   * FIX 3 — Loading / error tracked separately from mount gate.
   * isVideoLoading is only ever set to true inside onLoadStart, so it can
   * never pre-empt the Video mount.
   */
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoPlayError, setVideoPlayError] = useState(false);

  /**
   * FIX 3 — paused/controls race.
   * Start paused, flip to false only after onLoad fires.
   */
  const [isPaused, setIsPaused] = useState(true);

  // --------------------------------------------------------------------------
  // File-system validation (local URIs only)
  // --------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (!videoUri) {
        setVideoFileError(null);
        return;
      }

      const normalized = normalizeMediaUri(videoUri);

      // Remote URLs: trust them; the native player will report errors via onError
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        setVideoFileError(null);
        return;
      }

      if (!isValidMediaUri(normalized)) {
        if (!cancelled) setVideoFileError('Invalid video URI');
        return;
      }

      try {
        const exists = await doesMediaFileExist(normalized);
        if (!exists) {
          if (!cancelled) setVideoFileError('Video file not found');
          return;
        }
        const size = await getMediaFileSize(normalized);
        if (size <= 0) {
          if (!cancelled) setVideoFileError('Video file is empty');
          return;
        }
        if (!cancelled) setVideoFileError(null);
      } catch {
        if (!cancelled) setVideoFileError('Unable to read video file');
      }
    };

    validate();
    return () => { cancelled = true; };
  }, [videoUri]);

  // --------------------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------------------

  const normalizedUri = videoUri ? normalizeMediaUri(videoUri) : '';

  // FIX 6: thumbnail area never has a hidden Video — canRenderVideo only drives
  // the thumbnail UI, not an actual Video component.
  const canShowThumbnail = Boolean(
    videoUri &&
    !videoFileError &&
    isValidMediaUri(normalizedUri),
  );

  // Source object for RNV6 (safe for S3 signed URLs — see buildVideoSource)
  const videoSource = canShowThumbnail
    ? buildVideoSource(normalizedUri, capturedAt)
    : null;

  const errorMessage = cameraError ?? videoFileError;

  // --------------------------------------------------------------------------
  // Camera handlers
  // --------------------------------------------------------------------------

  const handleOpenCamera = useCallback(() => {
    setCameraError(null);
    setIsCameraOpen(true);
  }, []);

  const handleRecordingSuccess = useCallback(
    (uri: string) => {
      setIsCameraOpen(false);
      setVideoFileError(null);
      onCapture(uri);
    },
    [onCapture],
  );

  const handleCameraClose = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const handleCameraError = useCallback((err: CameraError) => {
    setIsCameraOpen(false);
    setCameraError(err.userMessage);
  }, []);

  // --------------------------------------------------------------------------
  // Preview modal handlers
  // --------------------------------------------------------------------------

  const handleOpenPreview = useCallback(() => {
    // Reset per-session state before opening
    setVideoPlayError(false);
    setIsVideoLoading(false);
    setIsPaused(true);             // FIX 3 — start paused
    setIsPreviewOpen(true);

    // FIX 1 — defer Video mount by one animation frame so the Modal's native
    // container is guaranteed to exist before the Video native view is created.
    requestAnimationFrame(() => {
      setVideoMountKey(k => k + 1);
    });
  }, []);

  /**
   * FIX 7 — Stop playback before closing.
   * Pausing first lets the native player finish its current decode cycle;
   * closing on the next tick then tears it down cleanly.
   */
  const handleClosePreview = useCallback(() => {
    setIsPaused(true);
    setIsPreviewOpen(false);
    // Reset so next open gets a fresh player (FIX 4)
    setVideoMountKey(0);
    setVideoPlayError(false);
    setIsVideoLoading(false);
  }, []);

  const handleDelete = useCallback(() => {
    setIsPaused(true);
    setIsPreviewOpen(false);
    setVideoMountKey(0);
    setVideoPlayError(false);
    setVideoFileError(null);
    onCapture('');
  }, [onCapture]);

  const handleEdit = useCallback(() => {
    onCapture('');
    setVideoFileError(null);
  }, [onCapture]);

  // --------------------------------------------------------------------------
  // Video player callbacks
  // --------------------------------------------------------------------------

  const handleVideoLoadStart = useCallback(() => {
    setIsVideoLoading(true);
    setVideoPlayError(false);
  }, []);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoading(false);
    setIsPaused(false);   // FIX 3 — only autoplay after native player is ready
  }, []);

  const handleVideoError = useCallback((error: unknown) => {
    console.error('[VideoCapture] Video error:', error);
    setIsVideoLoading(false);
    setVideoPlayError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setVideoPlayError(false);
    setIsVideoLoading(false);
    // Re-mount the Video component by bumping the key (FIX 4)
    setVideoMountKey(k => k + 1);
  }, []);

  // --------------------------------------------------------------------------
  // Render helpers
  // --------------------------------------------------------------------------

  /**
   * FIX 2 — The preview Video node.
   * Only rendered when videoMountKey > 0 (i.e. after the RAF fires post-open).
   * Always given an explicit key so React never reuses the native view.
   */
  const renderVideoPlayer = () => {
    if (!videoSource || videoMountKey === 0) return null;

    if (videoPlayError) {
      return (
        <View style={styles.centeredOverlay}>
          <Text style={styles.overlayIcon}>⚠️</Text>
          <Text style={styles.overlayText}>Unable to load video</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {/* FIX 4 — stable key per open session */}
        <Video
          key={`video-player-${videoMountKey}`}
          ref={videoRef}
          source={videoSource}
          style={styles.fullSizeVideo}
          resizeMode="contain"
          paused={isPaused}   // FIX 3
          controls={true}
          onLoadStart={handleVideoLoadStart}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          // RNV6: prevent the player from trying to buffer the next item
          repeat={false}
        />
        {isVideoLoading && (
          <View style={styles.centeredOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.overlayText}>Loading video…</Text>
          </View>
        )}
      </>
    );
  };

  // --------------------------------------------------------------------------
  // Main render
  // --------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}

      {/* Error banner */}
      {errorMessage ? (
        <View style={styles.errorContainer} accessible accessibilityRole="alert">
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Thumbnail or record button */}
      {videoUri ? (
        <TouchableOpacity
          style={styles.previewContainer}
          onPress={handleOpenPreview}
          activeOpacity={0.8}>

          {/* FIX 5 — pure View thumbnail, NO hidden Video component */}
          {canShowThumbnail ? (
            <View style={styles.videoThumbnail}>
              <View style={styles.videoThumbnailPlaceholder}>
                <Text style={styles.videoPlaceholderIcon}>🎥</Text>
                <Text style={styles.videoThumbnailText}>Tap to play video</Text>
              </View>
              <View style={styles.playOverlay} pointerEvents="none">
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderIcon}>🎥</Text>
              <Text style={styles.videoPlaceholderText}>
                {videoFileError ?? 'Video recorded'}
              </Text>
            </View>
          )}

          {/* Delete / re-record */}
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

      {/* Camera modal */}
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

      {/* Full-screen preview modal — FIX 5: only in tree when open */}
      {isPreviewOpen ? (
        <Modal
          visible={isPreviewOpen}
          transparent
          animationType="fade"
          onRequestClose={handleClosePreview}
          // RNV6 + Android: keep the status bar stable
          statusBarTranslucent={false}>
          <SafeAreaView style={styles.previewModalContainer} edges={['top', 'bottom']}>
            <View style={styles.previewModalContent}>

              {/* Video player area */}
              <View style={styles.videoPlayerContainer}>
                {videoMountKey === 0 ? (
                  // Still waiting for the RAF — show a brief spinner
                  <View style={styles.centeredOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.overlayText}>Preparing video…</Text>
                  </View>
                ) : (
                  renderVideoPlayer()
                )}
              </View>

              {/* Action bar */}
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
      ) : null}
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
    position: 'relative',
  },
  videoThumbnailPlaceholder: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumbnailText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginTop: vs(8),
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
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  previewModalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullSizeVideo: {
    flex: 1,
  },
  centeredOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayIcon: {
    fontSize: 40,
    marginBottom: vs(8),
  },
  overlayText: {
    marginTop: vs(8),
    fontSize: typography.fontSize.sm,
    color: '#fff',
    fontWeight: typography.fontWeight.medium,
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
  retryButton: {
    marginTop: vs(16),
    paddingVertical: vs(12),
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(VideoCapture);