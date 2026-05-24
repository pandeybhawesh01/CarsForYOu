/**
 * PhotoCapture - Photo capture UI with real camera integration
 * Uses CameraModal for actual capture; maintains existing props interface
 */

import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { vs } from '../../../utils/scaling';
import CameraModal from '../../camera/components/CameraModal';
import type { CameraError } from '../../camera/types';
import { isValidMediaUri } from '../../camera/utils/mediaUtils';

// ============================================================================
// Props (unchanged — backward compatible)
// ============================================================================

interface PhotoCaptureProps {
  label: string;
  imageUri?: string;
  onCapture: (uri: string) => void;
  isRequired?: boolean;
  hint?: string;
}

// ============================================================================
// Component
// ============================================================================

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  label,
  imageUri,
  onCapture,
  isRequired = false,
  hint,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleOpenCamera = useCallback(() => {
    setCameraError(null);
    setIsCameraOpen(true);
  }, []);

  const handleCaptureSuccess = useCallback(
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

  // Show actual image only for valid http/file/content URIs
  const showImage = Boolean(imageUri && isValidMediaUri(imageUri));

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

      {/* Preview or capture button */}
      {imageUri ? (
        <View style={styles.previewContainer}>
          {showImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderSubtext}>Photo Captured</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editRow}
            accessibilityLabel="Retake photo"
            accessibilityRole="button">
            <Text style={styles.editText}>↻ Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleOpenCamera}
          activeOpacity={0.7}
          accessibilityLabel={`Capture photo: ${label}`}
          accessibilityHint="Double tap to open camera"
          accessibilityRole="button">
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.captureText}>Tap to capture</Text>
        </TouchableOpacity>
      )}

      {/* Camera modal — fully isolated camera logic */}
      <CameraModal
        visible={isCameraOpen}
        mode="photo"
        onClose={handleCameraClose}
        onCapture={handleCaptureSuccess}
        onError={handleCameraError}
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
