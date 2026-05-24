/**
 * CameraModal - Full-screen camera interface (v4 API)
 * Orchestrates Camera component for photo and video capture
 * Completely isolated from inspection flow — communicates only via callbacks
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { vs } from '../../../utils/scaling';
import CameraPreview from './CameraPreview';
import CameraControls from './CameraControls';
import { CameraService } from '../services/CameraService';
import { PermissionService } from '../services/PermissionService';
import { useCameraDevice } from '../utils/visionCamera';
import {
  CameraError,
  type CameraModalProps,
  type FlashMode,
} from '../types';
import { getNextFlashMode } from '../utils/cameraConfig';

// ============================================================================
// Component
// ============================================================================

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  mode,
  onClose,
  onCapture,
  onError,
}) => {
  const cameraRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('auto');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Always use back camera for vehicle inspection
  const device = useCameraDevice('back');

  // Debug logging
  useEffect(() => {
    if (visible) {
      const info = `Device: ${device ? 'OK' : 'NULL'} | Camera Ref: ${cameraRef.current ? 'OK' : 'NULL'}`;
      setDebugInfo(info);
      console.log('[CameraModal]', info);
    }
  }, [visible, device]);

  // --------------------------------------------------------------------------
  // Camera lifecycle
  // --------------------------------------------------------------------------

  const handleInitialized = useCallback(() => {
    setIsInitialized(true);
    setErrorMessage(null);
    console.log('[CameraModal] Camera initialized');
  }, []);

  const handleCameraError = useCallback(
    (err: CameraError) => {
      setErrorMessage(err.userMessage);
      console.error('[CameraModal] Camera error:', err);
      onError(err);
    },
    [onError],
  );

  // --------------------------------------------------------------------------
  // Photo capture
  // --------------------------------------------------------------------------

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !isInitialized) {
      console.warn('[CameraModal] Cannot capture: cameraRef=', !!cameraRef.current, 'isInitialized=', isInitialized);
      return;
    }

    try {
      console.log('[CameraModal] Starting photo capture...');
      const uri = await CameraService.capturePhoto(cameraRef.current, {
        flashMode,
      });
      console.log('[CameraModal] Photo captured:', uri);
      onCapture(uri);
      onClose();
    } catch (err) {
      const cameraError = CameraError.fromUnknown(err);
      setErrorMessage(cameraError.userMessage);
      console.error('[CameraModal] Capture error:', cameraError);
      onError(cameraError);
    }
  }, [isInitialized, flashMode, onCapture, onClose, onError]);

  // --------------------------------------------------------------------------
  // Video recording
  // --------------------------------------------------------------------------

  const handleStartRecording = useCallback(() => {
    if (!cameraRef.current || !isInitialized) {
      console.warn('[CameraModal] Cannot record: cameraRef=', !!cameraRef.current, 'isInitialized=', isInitialized);
      return;
    }

    setIsRecording(true);
    console.log('[CameraModal] Starting video recording...');

    CameraService.startRecording(
      cameraRef.current,
      (uri) => {
        // Recording finished successfully
        console.log('[CameraModal] Video recorded:', uri);
        setIsRecording(false);
        onCapture(uri);
        onClose();
      },
      (err) => {
        // Recording error
        console.error('[CameraModal] Recording error:', err);
        setIsRecording(false);
        setErrorMessage(err.userMessage);
        onError(err);
      },
    );
  }, [isInitialized, onCapture, onClose, onError]);

  const handleStopRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      console.log('[CameraModal] Stopping video recording...');
      await CameraService.stopRecording(cameraRef.current);
      // onCapture will be called via the onRecordingFinished callback above
    } catch (err) {
      const cameraError = CameraError.fromUnknown(err);
      setIsRecording(false);
      setErrorMessage(cameraError.userMessage);
      console.error('[CameraModal] Stop recording error:', cameraError);
      onError(cameraError);
    }
  }, [onError]);

  // --------------------------------------------------------------------------
  // Flash toggle
  // --------------------------------------------------------------------------

  const handleToggleFlash = useCallback(() => {
    setFlashMode(prev => getNextFlashMode(prev));
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    console.log('[CameraModal] Requesting camera permission...');
    PermissionService.requestCameraPermission().catch(err => {
      const cameraError = CameraError.fromUnknown(err);
      setErrorMessage(cameraError.userMessage);
      console.error('[CameraModal] Permission error:', cameraError);
      onError(cameraError);
    });
  }, [visible, onError]);

  // --------------------------------------------------------------------------
  // Cancel
  // --------------------------------------------------------------------------

  const handleCancel = useCallback(async () => {
    if (isRecording && cameraRef.current) {
      try {
        await CameraService.stopRecording(cameraRef.current);
      } catch {
        // Ignore stop errors on cancel
      }
      setIsRecording(false);
    }
    onClose();
  }, [isRecording, onClose]);

  // --------------------------------------------------------------------------
  // No camera device fallback
  // --------------------------------------------------------------------------

  if (visible && !device) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No camera detected on this device.
          </Text>
          <Text style={styles.errorSubText}>
            Make sure camera permissions are granted and the device has a camera.
          </Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Tap to close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleCancel}
      testID="camera-modal">
      <View style={styles.container}>
        {device && (
          <CameraPreview
            ref={cameraRef}
            device={device}
            isActive={visible}
            mode={mode}
            onInitialized={handleInitialized}
            onError={handleCameraError}>
            <CameraControls
              mode={mode}
              isRecording={isRecording}
              hasFlash={device.hasFlash ?? false}
              flashMode={flashMode}
              onCapture={handleCapture}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onCancel={handleCancel}
              onToggleFlash={handleToggleFlash}
            />
          </CameraPreview>
        )}

        {/* Error overlay */}
        {errorMessage && (
          <View
            style={styles.errorOverlay}
            accessible
            accessibilityRole="alert"
            accessibilityLabel={`Error: ${errorMessage}`}>
            <Text style={styles.errorOverlayText}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'center',
    marginBottom: vs(12),
    fontWeight: typography.fontWeight.semiBold,
  },
  errorSubText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(16),
  },
  debugText: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: vs(16),
    fontFamily: 'monospace',
  },
  closeButton: {
    marginTop: vs(20),
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: vs(120),
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    padding: 12,
  },
  errorOverlayText: {
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});

export default memo(CameraModal);
