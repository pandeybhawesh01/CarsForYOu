/**
 * VideoCapture - Video recording UI with real camera integration and video preview
 * Uses CameraModal for actual recording; shows video preview with playback controls
 */

import React, { memo, useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs } from '../../../utils/scaling';
import CameraModal from '../../camera/components/CameraModal';
import type { CameraError } from '../../camera/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Props (unchanged — backward compatible)
// ============================================================================

interface VideoCaptureProps {
  label: string;
  videoUri?: string;
  onCapture: (uri: string) => void;
  isRequired?: boolean;
  hint?: string;
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
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleOpenCamera = useCallback(() => {
    setCameraError(null);
    setIsCameraOpen(true);
  }, []);

  const handleRecordingSuccess = useCallback(
    (uri: string) => {
      setIsCameraOpen(false);
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

  const handleEdit = useCallback(() => {
    onCapture('');
  }, [onCapture]);

  const handlePreview = useCallback(() => {
    setIsPreviewOpen(true);
    setIsPlaying(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setIsPlaying(false);
  }, []);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoading(false);
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    setIsVideoLoading(true);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

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
      {cameraError && (
        <View
          style={styles.errorContainer}
          accessible
          accessibilityRole="alert">
          <Text style={styles.errorText}>{cameraError}</Text>
        </View>
      )}

      {/* Preview or record button */}
      {videoUri ? (
        <View style={styles.previewContainer}>
          <TouchableOpacity
            onPress={handlePreview}
            style={styles.videoThumbnail}
            activeOpacity={0.8}
            accessibilityLabel="Preview recorded video"
            accessibilityRole="button">
            <Video
              source={{ uri: videoUri }}
              style={styles.thumbnailVideo}
              resizeMode="cover"
              paused={true}
              muted={true}
            />
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handlePreview}
              style={styles.actionButton}
              accessibilityLabel="Preview video"
              accessibilityRole="button">
              <Text style={styles.actionText}>👁 Preview</Text>
            </TouchableOpacity>
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
      />

      {/* Video preview modal */}
      <Modal
        visible={isPreviewOpen}
        animationType="fade"
        transparent={false}
        onRequestClose={handleClosePreview}
        statusBarTranslucent>
        <View style={styles.previewModal}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePreview}
            accessibilityLabel="Close video preview"
            accessibilityRole="button">
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Video player */}
          <View style={styles.videoContainer}>
            {isVideoLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.surface} />
              </View>
            )}
            {videoUri && (
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.fullVideo}
                resizeMode="contain"
                paused={!isPlaying}
                repeat={true}
                onLoad={handleVideoLoad}
                onLoadStart={handleVideoLoadStart}
                controls={false}
              />
            )}
          </View>

          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={handlePlayPause}
            accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
            accessibilityRole="button">
            <Text style={styles.playPauseText}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewActionButton}
              onPress={handleClosePreview}
              accessibilityLabel="Keep this video"
              accessibilityRole="button">
              <Text style={styles.previewActionText}>✓ Keep Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewActionButton, styles.rerecordButton]}
              onPress={() => {
                handleClosePreview();
                handleEdit();
                setTimeout(() => handleOpenCamera(), 300);
              }}
              accessibilityLabel="Re-record video"
              accessibilityRole="button">
              <Text style={[styles.previewActionText, styles.rerecordText]}>
                ↻ Re-record
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  videoThumbnail: {
    height: vs(160),
    backgroundColor: '#000',
    position: 'relative',
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: colors.surface,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    justifyContent: 'space-around',
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
  // Preview modal styles
  previewModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseText: {
    fontSize: 28,
    color: colors.surface,
  },
  previewActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  rerecordButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  previewActionText: {
    fontSize: typography.fontSize.base,
    color: colors.surface,
    fontWeight: typography.fontWeight.semiBold,
  },
  rerecordText: {
    color: colors.surface,
  },
});

export default memo(VideoCapture);
