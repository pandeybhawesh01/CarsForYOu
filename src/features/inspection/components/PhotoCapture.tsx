/**
 * PhotoCapture - Photo capture UI with real camera integration
 * Uses CameraModal for actual capture; maintains existing props interface
 */

import React, { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  label,
  imageUri,
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
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    setIsPreviewOpen(false);
    onCapture('');
  }, [onCapture]);

  const handleImageLoadStart = useCallback(() => {
    setIsImageLoading(true);
  }, []);

  const handleImageLoadEnd = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    console.error('[PhotoCapture] Image load error:', imageUri);
  }, [imageUri]);

  // Add cache busting for S3 URLs to prevent stale image caching
  const getCacheBustedUri = useCallback((uri: string | undefined) => {
    if (!uri) return uri;
    
    // Only add cache buster for S3 URLs (remote images)
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      // Use capturedAt timestamp if available, otherwise use current time
      const timestamp = capturedAt ? new Date(capturedAt).getTime() : Date.now();
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}_t=${timestamp}`;
    }
    
    // Local file URIs don't need cache busting
    return uri;
  }, [capturedAt]);

  const displayUri = getCacheBustedUri(imageUri);

  // Show actual image for any non-empty URI
  // Be more permissive to handle various URI formats from camera
  const showImage = Boolean(imageUri && typeof imageUri === 'string' && imageUri.length > 0);

  console.log('[PhotoCapture] Render - imageUri:', imageUri);
  console.log('[PhotoCapture] Render - displayUri:', displayUri);
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
        <TouchableOpacity 
          style={styles.previewContainer}
          onPress={handleOpenPreview}
          activeOpacity={0.8}>
          {showImage ? (
            <>
              <Image
                source={{ uri: displayUri }}
                style={styles.imagePreview}
                resizeMode="cover"
                onLoadStart={handleImageLoadStart}
                onLoadEnd={handleImageLoadEnd}
                onError={handleImageError}
              />
              {isImageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              )}
            </>
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
        </TouchableOpacity>
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

      {/* Full-size preview modal */}
      <Modal
        visible={isPreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClosePreview}>
        <SafeAreaView style={styles.previewModalContainer} edges={['top', 'bottom']}>
          <View style={styles.previewModalContent}>
            {/* Full-size image with zoom */}
            <ImageViewer
              imageUrls={[{ url: displayUri || '' }]}
              enableSwipeDown
              onSwipeDown={handleClosePreview}
              backgroundColor="rgba(0, 0, 0, 0.95)"
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              style={styles.imageViewer}
            />
            
            {/* Action buttons */}
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewActionButton, styles.deleteActionButton]}
                onPress={handleDelete}
                accessibilityLabel="Delete photo"
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
  },
  imageViewer: {
    flex: 1,
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

export default memo(PhotoCapture);
