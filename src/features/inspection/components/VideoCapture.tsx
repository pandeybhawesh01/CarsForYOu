/**
 * VideoCapture
 *
 * Video preview is rendered inside a WebView with an HTML5 <video> element.
 *
 * Why WebView and not react-native-video?
 *   In RN 0.74+/bridgeless mode, react-native-video v6's ExoPlayer SurfaceView
 *   binds to the host View hierarchy at native-mount time. When the host is
 *   inside a Modal that has just opened, the SurfaceView attach can fail at
 *   the JNI layer, which on Android terminates the JS thread before any
 *   onError callback can fire. Symptom: the app silently dies as soon as
 *   the user taps the play thumbnail. There is no JS exception, so a
 *   React error boundary cannot catch it.
 *
 *   WebView playback is isolated in a separate native process, so even if
 *   the platform decoder fails, it cannot crash the app — it just shows a
 *   broken-video icon inside the WebView frame.
 *
 *   `CameraModal` already uses this exact pattern for its post-recording
 *   preview (see CameraModal.tsx::buildVideoPreviewHtml). We reuse the
 *   same approach here.
 *
 * Other safeguards:
 *   - The Modal is conditionally in the React tree (mounts only when open).
 *   - Cache-busting via query param is fine: our S3 URLs are public
 *     (no X-Amz-Signature), so adding ?_t=... does not break anything.
 *   - The thumbnail is a pure View with a play button — no hidden video
 *     player runs in the background.
 */

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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
// HTML builder for the WebView
// ============================================================================

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildVideoHtml = (videoUri: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
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
    <!--
      #t=0.5 makes the browser seek to the 0.5-second mark on load, so the
      first frame paints immediately as a still image while the video is
      paused. Without this, mobile browsers show a black rectangle until
      the user taps play.
    -->
    <video
      controls
      playsinline
      webkit-playsinline
      preload="auto"
      src="${escapeHtml(encodeURI(videoUri))}#t=0.5"
    ></video>
  </body>
</html>`;

/**
 * Lightweight HTML used for the THUMBNAIL.
 * Differences from the playback HTML:
 *   - no `controls` (clean image, no UI overlay)
 *   - `muted` so iOS allows the first-frame paint without user gesture
 *   - `pointer-events: none` in CSS so touches pass through to the parent
 *     TouchableOpacity (otherwise the WebView swallows them).
 *   - `object-fit: cover` for a tight thumbnail crop.
 *
 * `preload="metadata"` instructs the browser to fetch just enough of the
 * video to render the first frame — usually a few hundred KB.
 */
const buildThumbnailHtml = (videoUri: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        overflow: hidden;
        pointer-events: none;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #1a1a1a;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <video
      muted
      playsinline
      webkit-playsinline
      preload="metadata"
      src="${escapeHtml(encodeURI(videoUri))}#t=0.5"
    ></video>
  </body>
</html>`;

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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  // --------------------------------------------------------------------------
  // File-system validation (local URIs only — remote URIs trust the player)
  // --------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (!videoUri) {
        setVideoFileError(null);
        return;
      }

      const normalized = normalizeMediaUri(videoUri);
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
  // Derived
  // --------------------------------------------------------------------------

  const normalizedUri = videoUri ? normalizeMediaUri(videoUri) : '';
  const isRemote = normalizedUri.startsWith('http://') || normalizedUri.startsWith('https://');

  // Cache-bust public S3 URLs by appending the captured-at timestamp.
  // Safe because our S3 URLs are public (no X-Amz-Signature).
  const playbackUri = useMemo(() => {
    if (!normalizedUri) return '';
    if (isRemote && capturedAt) {
      const ts = new Date(capturedAt).getTime();
      const sep = normalizedUri.includes('?') ? '&' : '?';
      return `${normalizedUri}${sep}_t=${ts}`;
    }
    return normalizedUri;
  }, [normalizedUri, isRemote, capturedAt]);

  const canShowThumbnail = Boolean(
    videoUri && !videoFileError && isValidMediaUri(normalizedUri),
  );

  const errorMessage = cameraError ?? videoFileError;

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleOpenCamera = useCallback(() => {
    setCameraError(null);
    setIsCameraOpen(true);
  }, []);

  const handleRecordingSuccess = useCallback(
    (uri: string, ts?: string) => {
      setIsCameraOpen(false);
      setVideoFileError(null);
      onCapture(uri, ts);
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

  const handleOpenPreview = useCallback(() => {
    setIsWebViewReady(false);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setIsWebViewReady(false);
  }, []);

  const handleDelete = useCallback(() => {
    setIsPreviewOpen(false);
    setIsWebViewReady(false);
    setVideoFileError(null);
    onCapture('');
  }, [onCapture]);

  const handleEdit = useCallback(() => {
    onCapture('');
    setVideoFileError(null);
  }, [onCapture]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}

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
          {canShowThumbnail ? (
            <View style={styles.videoThumbnail}>
              {/*
                Real first-frame thumbnail rendered inside an isolated WebView.
                pointer-events on the WebView is `none` so the parent
                TouchableOpacity still receives the tap. If the thumbnail
                fails to load for any reason (network, decoder, etc.) the
                WebView quietly shows a black background — never crashes.
              */}
              <WebView
                style={styles.thumbnailWebView}
                originWhitelist={['*']}
                source={{ html: buildThumbnailHtml(playbackUri) }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                androidLayerType="hardware"
                pointerEvents="none"
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // Keep the WebView background dark so the thumbnail load is invisible
                opaque={false}
              />
              {/* Play button overlay sits on top of the thumbnail */}
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

      {/* Preview modal — WebView playback (no native ExoPlayer crash risk) */}
      {isPreviewOpen && playbackUri ? (
        <Modal
          visible={isPreviewOpen}
          transparent
          animationType="none"
          onRequestClose={handleClosePreview}
          statusBarTranslucent={false}>
          <SafeAreaView style={styles.previewModalContainer} edges={['top', 'bottom']}>
            <View style={styles.previewModalContent}>
              <View style={styles.videoPlayerContainer}>
                <WebView
                  style={styles.fullSizeVideo}
                  originWhitelist={['*']}
                  source={{ html: buildVideoHtml(playbackUri) }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  allowFileAccess
                  allowFileAccessFromFileURLs
                  allowUniversalAccessFromFileURLs
                  mixedContentMode="always"
                  onLoadEnd={() => setIsWebViewReady(true)}
                  onError={(event) => {
                    console.warn('[VideoCapture] WebView error', event.nativeEvent);
                  }}
                  onHttpError={(event) => {
                    console.warn('[VideoCapture] WebView HTTP error', event.nativeEvent);
                  }}
                  // Ensures the back button on Android does not nav away
                  onShouldStartLoadWithRequest={() => true}
                  // Use hardware accelerated rendering layer to keep playback smooth
                  androidLayerType="hardware"
                />

                {!isWebViewReady && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.overlayText}>Loading video…</Text>
                  </View>
                )}
              </View>

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
  thumbnailWebView: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    position: 'relative',
  },
  fullSizeVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
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
});

export default memo(VideoCapture);
