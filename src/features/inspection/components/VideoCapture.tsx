/**
 * VideoCapture — same visual layout as PhotoCapture but for video recording.
 * Used when a subOptions1 item has inputType: "file-upload" and label: "Video"
 * (e.g. musicSystem.isPresent → Video upload when isPresent = true).
 */
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs } from '../../../utils/scaling';

interface VideoCaptureProps {
  label: string;
  videoUri?: string;
  onCapture: (uri: string) => void;
  isRequired?: boolean;
  hint?: string;
}

const VideoCapture: React.FC<VideoCaptureProps> = ({
  label,
  videoUri,
  onCapture,
  isRequired = false,
  hint,
}) => {
  const handleCapture = useCallback(() => {
    // In production, integrate react-native-image-picker with mediaType: 'video'
    Alert.alert(
      'Record Video',
      'In production, this opens the camera for video recording.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Record',
          onPress: () => {
            onCapture('video_' + Date.now());
          },
        },
      ],
    );
  }, [onCapture]);

  const handleEdit = useCallback(() => {
    onCapture('');
  }, [onCapture]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}

      {videoUri ? (
        <View style={styles.previewContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderIcon}>🎥</Text>
            <Text style={styles.videoPlaceholderText}>Video Recorded</Text>
          </View>
          <TouchableOpacity onPress={handleEdit} style={styles.editRow}>
            <Text style={styles.editText}>↻ Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.7}>
          <Text style={styles.videoIcon}>🎥</Text>
          <Text style={styles.captureText}>Tap to record</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  },
  videoPlaceholder: {
    height: vs(160),
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderIcon: {
    fontSize: 40,
    marginBottom: vs(8),
  },
  videoPlaceholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  editRow: {
    padding: spacing.sm,
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
  },
  editText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default memo(VideoCapture);
