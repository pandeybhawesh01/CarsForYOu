/**
 * CameraControls - Camera control buttons (capture, record, stop, cancel, flash)
 * Renders appropriate controls based on mode and recording state
 */

import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { hs, vs } from '../../../utils/scaling';
import type { CameraControlsProps } from '../types';
import { RecordingTimer } from './RecordingTimer';

// ============================================================================
// Component
// ============================================================================

const CameraControls: React.FC<CameraControlsProps> = ({
  mode,
  isRecording,
  hasFlash,
  flashMode,
  onCapture,
  onStartRecording,
  onStopRecording,
  onToggleFlash,
  onOpenGallery,
}) => {
  // Flash icon based on current mode
  const flashIcon =
    flashMode === 'on' ? '⚡' : flashMode === 'auto' ? '⚡A' : '⚡✕';

  const handleMainAction = useCallback(() => {
    if (mode === 'photo') {
      onCapture();
    } else if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [mode, isRecording, onCapture, onStartRecording, onStopRecording]);

  return (
    <View style={styles.container}>
      {/* Top row: flash toggle */}
      <View style={styles.topRow}>
        {hasFlash && (
          <TouchableOpacity
            style={styles.flashButton}
            onPress={onToggleFlash}
            accessible
            accessibilityLabel={`Flash mode: ${flashMode}. Tap to toggle.`}
            accessibilityRole="button">
            <Text style={styles.flashIcon}>{flashIcon}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recording timer */}
      {isRecording && (
        <View style={styles.timerRow}>
          <RecordingTimer />
        </View>
      )}

      {/* Bottom row: gallery + main action */}
      <View style={styles.bottomRow}>
        {/* Gallery shortcut (native-camera style) on the left.
            Hidden while recording, and only shown when a handler is provided. */}
        {onOpenGallery && !isRecording ? (
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={onOpenGallery}
            accessible
            accessibilityLabel={
              mode === 'photo'
                ? 'Choose a photo from gallery'
                : 'Choose a video from gallery'
            }
            accessibilityHint="Double tap to open your gallery"
            accessibilityRole="button">
            <Text style={styles.galleryIcon}>🖼️</Text>
          </TouchableOpacity>
        ) : (
          /* Spacer to keep the main button centered */
          <View style={styles.spacer} />
        )}

        {/* Main action button (capture / record / stop) */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            isRecording && styles.mainButtonRecording,
          ]}
          onPress={handleMainAction}
          accessible
          accessibilityLabel={
            mode === 'photo'
              ? 'Capture photo'
              : isRecording
              ? 'Stop recording'
              : 'Start recording'
          }
          accessibilityHint={
            mode === 'photo'
              ? 'Double tap to take a photo'
              : isRecording
              ? 'Double tap to stop video recording'
              : 'Double tap to start video recording'
          }
          accessibilityRole="button">
          {mode === 'photo' ? (
            <View style={styles.captureInner} />
          ) : isRecording ? (
            <View style={styles.stopInner} />
          ) : (
            <View style={styles.recordInner} />
          )}
        </TouchableOpacity>

        {/* Spacer on the right to keep the main button centered */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: vs(24),
    paddingHorizontal: hs(20),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timerRow: {
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Lift the gallery + shutter row up from the bottom edge.
    marginBottom: vs(20),
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashIcon: {
    fontSize: 16,
    color: colors.surface,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonRecording: {
    borderColor: colors.error,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  recordInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
  },
  stopInner: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  spacer: {
    width: 44,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
  galleryIcon: {
    fontSize: 22,
  },
});

export default memo(CameraControls);
