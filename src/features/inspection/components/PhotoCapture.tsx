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
  // S3 upload parameters
  uploadPath?: string;
  sectionKey?: string;
  appointmentId?: string;
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
  uploadPath,
  sectionKey,
  appointmentId,
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
      console.log('[PhotoCapture] Capture success, URI:', uri);
      console.log('[PhotoCapture] Is valid URI:', isValidMediaUri(uri));
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

  // Show actual image for any non-empty URI
  // Be more permissive to handle various URI formats from camera
  const showImage = Boolean(imageUri && typeof imageUri === 'string' && imageUri.length > 0);

  console.log('[PhotoCapture] Render - imageUri:', imageUri);
  console.log('[PhotoCapture] Render - showImage:', showImage);

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
          
          {/* Delete button overlay */}
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.deleteButton}
            accessibilityLabel="Delete photo"
            accessibilityRole="button">
            <Text style={styles.deleteIcon}>✕</Text>
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
});

export default memo(PhotoCapture);
