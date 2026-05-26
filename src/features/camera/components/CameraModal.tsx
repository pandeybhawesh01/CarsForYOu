/**
 * CameraModal - Full-screen camera interface (v5 API)
 * Orchestrates Camera component for photo and video capture
 * Completely isolated from inspection flow — communicates only via callbacks
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { vs } from '../../../utils/scaling';
import CameraPreview from './CameraPreview';
import CameraControls from './CameraControls';
import { CameraService } from '../services/CameraService';
import { PermissionService } from '../services/PermissionService';
import { useCameraDevice, usePhotoOutput, useVideoOutput, type Recorder } from '../utils/visionCamera';
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
  const recorderRef = useRef<Recorder | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    if (capturedPhotoUri) {
      console.log('[CameraModal] 📸 capturedPhotoUri state updated:', capturedPhotoUri);
    }
  }, [capturedPhotoUri]);

  // Always use back camera for vehicle inspection
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({ enableAudio: mode === 'video' });

  const outputs = useMemo(() => {
    const list = [] as any[];
    if (photoOutput) list.push(photoOutput);
    if (mode === 'video' && videoOutput) list.push(videoOutput);
    return list;
  }, [photoOutput, videoOutput, mode]);

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
      const uri = await CameraService.capturePhoto(photoOutput, {
        flashMode,
      });
      console.log('[CameraModal] Photo captured:', uri);
      setCapturedPhotoUri(uri);
    } catch (err) {
      const cameraError = CameraError.fromUnknown(err);
      setErrorMessage(cameraError.userMessage);
      console.error('[CameraModal] Capture error:', cameraError);
      onError(cameraError);
    }
  }, [isInitialized, flashMode, onError, photoOutput]);

  // --------------------------------------------------------------------------
  // Video recording
  // --------------------------------------------------------------------------

  const handleStartRecording = useCallback(async () => {
    if (!cameraRef.current || !isInitialized) {
      console.warn('[CameraModal] Cannot record: cameraRef=', !!cameraRef.current, 'isInitialized=', isInitialized);
      return;
    }

    console.log('[CameraModal] Starting video recording...');

    if (!videoOutput) {
      console.warn('[CameraModal] Cannot record: video output not available');
      return;
    }

    try {
      const recorder = await videoOutput.createRecorder({});
      recorderRef.current = recorder;
      setIsRecording(true);

      await CameraService.startRecording(
        recorder,
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
    } catch (err) {
      const cameraError = CameraError.fromUnknown(err);
      setIsRecording(false);
      setErrorMessage(cameraError.userMessage);
      console.error('[CameraModal] Recording error:', cameraError);
      onError(cameraError);
    }
  }, [isInitialized, onCapture, onClose, onError, videoOutput]);

  const handleStopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    try {
      console.log('[CameraModal] Stopping video recording...');
      await CameraService.stopRecording(recorder);
      recorderRef.current = null;
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

    console.log('[CameraModal] Requesting permissions for mode:', mode);
    
    // For photo mode, only request camera permission
    // For video mode, request both camera and microphone permissions sequentially
    const requestPermissions = async () => {
      try {
        if (mode === 'photo') {
          await PermissionService.requestCameraPermission();
        } else {
          // Request camera permission first, then microphone
          // Sequential requests avoid timeout issues on Android
          await PermissionService.requestCameraPermission();
          await PermissionService.requestMicrophonePermission();
        }
      } catch (err) {
        const cameraError = CameraError.fromUnknown(err);
        setErrorMessage(cameraError.userMessage);
        console.error('[Camera Error] requestCameraPermission', cameraError);
        onError(cameraError);
      }
    };

    requestPermissions();
  }, [visible, mode, onError]);

  // --------------------------------------------------------------------------
  // Cancel
  // --------------------------------------------------------------------------

  const handleCancel = useCallback(async () => {
    if (isRecording && recorderRef.current) {
      try {
        await CameraService.stopRecording(recorderRef.current);
      } catch {
        // Ignore stop errors on cancel
      }
      setIsRecording(false);
      recorderRef.current = null;
    }
    setCapturedPhotoUri(null);
    // Don't reset flash mode - keep user's preference
    onClose();
  }, [isRecording, onClose]);

  const handleConfirmPhoto = useCallback(() => {
    if (capturedPhotoUri) {
      onCapture(capturedPhotoUri);
      setCapturedPhotoUri(null);
      onClose();
    }
  }, [capturedPhotoUri, onCapture, onClose]);

  const handleRetakePhoto = useCallback(() => {
    setCapturedPhotoUri(null);
    setErrorMessage(null);
  }, []);

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
        {/* Photo Preview Screen */}
        {capturedPhotoUri ? (
          <SafeAreaView style={styles.previewContainer} edges={['top', 'bottom']}>
            <Image
              source={{ uri: capturedPhotoUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            
            {/* Preview Controls */}
            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={handleRetakePhoto}
                accessibilityLabel="Retake photo"
                accessibilityRole="button">
                <Text style={styles.previewButtonIcon}>↻</Text>
                <Text style={styles.previewButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.previewButton, styles.confirmButton]}
                onPress={handleConfirmPhoto}
                accessibilityLabel="Use this photo"
                accessibilityRole="button">
                <Text style={styles.confirmButtonIcon}>✓</Text>
                <Text style={styles.confirmButtonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        ) : (
          <>
            {device && (
              <CameraPreview
                ref={cameraRef}
                device={device}
                isActive={visible}
                mode={mode}
                outputs={outputs}
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
          </>
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
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: vs(32),
    backgroundColor: 'rgba(0,0,0,0.7)',
    gap: 16,
  },
  previewButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(16),
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  previewButtonIcon: {
    fontSize: 28,
    color: colors.surface,
    marginBottom: vs(4),
  },
  confirmButtonIcon: {
    fontSize: 28,
    color: colors.surface,
    marginBottom: vs(4),
    fontWeight: typography.fontWeight.bold,
  },
  previewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    fontWeight: typography.fontWeight.semiBold,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
});

export default memo(CameraModal);
