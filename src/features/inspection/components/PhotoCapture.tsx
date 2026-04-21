import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs } from '../../../utils/scaling';

interface PhotoCaptureProps {
  label: string;
  imageUri?: string;
  onCapture: (uri: string) => void;
  isRequired?: boolean;
  hint?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  label,
  imageUri,
  onCapture,
  isRequired = false,
  hint,
}) => {
  const handleCapture = useCallback(() => {
    // In production, integrate react-native-image-picker here
    // For demo: simulate capture with a placeholder
    Alert.alert(
      'Capture Photo',
      'In production, this opens the camera via react-native-image-picker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Capture',
          onPress: () => {
            onCapture('captured_' + Date.now());
          },
        },
      ],
    );
  }, [onCapture]);

  const handleEdit = useCallback(() => {
    onCapture('');
  }, [onCapture]);

  const showImage = Boolean(imageUri && /^(https?:|file:|content:)/i.test(imageUri));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}

      {imageUri ? (
        <View style={styles.previewContainer}>
          {showImage ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>Photo Captured</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleEdit} style={styles.editRow}>
            <Text style={styles.editText}>↻ Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.7}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.captureText}>Tap to capture</Text>
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
  cameraIcon: {
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
    position: 'relative',
  },
  imagePlaceholder: {
    height: vs(160),
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    height: vs(160),
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: vs(8),
  },
  imagePlaceholderSubtext: {
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

export default memo(PhotoCapture);
