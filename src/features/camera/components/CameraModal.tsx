/**
 * CameraModal - Full-screen camera interface (v5 API)
 * Orchestrates Camera component for photo and video capture
 * Completely isolated from inspection flow — communicates only via callbacks
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
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
import {
  doesMediaFileExist,
  getMediaFilePath,
  getMediaFileSize,
  isValidMediaUri,
  normalizeMediaUri,
} from '../utils/mediaUtils';
import { presignedUrlService } from '../../../services/api/presignedUrlService';
import { uploadToS3, deleteLocalFile } from '../../../utils/s3Upload';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildVideoPreviewHtml = (videoUri: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
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
    <video controls playsinline webkit-playsinline src="${escapeHtml(encodeURI(videoUri))}"></video>
  </body>
</html>`;

// ============================================================================
// Component
// ============================================================================

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  mode,
  onClose,
  onCapture,
  onError,
  uploadPath,
  sectionKey,
  appointmentId,
}) => {
  const logPreview = useCallback((message: string, ...details: unknown[]) => {
    console.log(`[CameraModal] ${message}`, ...details);
  }, []);

  const cameraRef = useRef<any>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedVideoUri, setCapturedVideoUri] = useState<string | null>(null);
  const [videoPreviewError, setVideoPreviewError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);
  const [isVideoFileReady, setIsVideoFileReady] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check if upload is enabled
  const shouldUpload = Boolean(uploadPath && sectionKey && appointmentId);

  // Debug upload configuration
  useEffect(() => {
    if (visible) {
      console.log('[CameraModal] 🔧 Upload config:', {
        uploadPath,
        sectionKey,
        appointmentId,
        shouldUpload,
      });
    }
  }, [visible, uploadPath, sectionKey, appointmentId, shouldUpload]);

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
      logPreview(`Visible modal state: ${info}`);
    }
  }, [visible, device, logPreview]);

  useEffect(() => {
    if (capturedVideoUri) {
      logPreview('capturedVideoUri set', capturedVideoUri);
      setVideoPreviewError(null);
      setIsPreviewPlaying(false);
    } else {
      logPreview('capturedVideoUri cleared');
      setVideoPreviewError(null);
      setIsPreviewPlaying(false);
    }
  }, [capturedVideoUri, logPreview]);

  useEffect(() => {
    let isCancelled = false;

    const checkVideoFile = async () => {
      if (!capturedVideoUri) {
        logPreview('Skipping video file check because capturedVideoUri is empty');
        if (!isCancelled) {
          setVideoFileError(null);
          setIsVideoFileReady(false);
        }
        return;
      }

      const normalized = normalizeMediaUri(capturedVideoUri);
      logPreview('Checking captured video file', {
        capturedVideoUri,
        normalized,
      });
      if (!isValidMediaUri(normalized)) {
        logPreview('Captured video URI is invalid', normalized);
        if (!isCancelled) {
          setVideoFileError('Invalid video URI');
          setIsVideoFileReady(false);
        }
        return;
      }

      try {
        const exists = await doesMediaFileExist(normalized);
        logPreview('Video file exists check result', { normalized, exists });
        if (!exists) {
          if (!isCancelled) {
            setVideoFileError('Video file not found');
            setIsVideoFileReady(false);
          }
          return;
        }

        const size = await getMediaFileSize(normalized);
        logPreview('Video file size result', { normalized, size });
        if (size <= 0) {
          if (!isCancelled) {
            setVideoFileError('Video file is empty');
            setIsVideoFileReady(false);
          }
          return;
        }

        if (!isCancelled) {
          setVideoFileError(null);
          setIsVideoFileReady(true);
        }
      } catch (error) {
        console.error('[CameraModal] Video file check failed:', error);
        if (!isCancelled) {
          setVideoFileError('Unable to read video file');
          setIsVideoFileReady(false);
        }
      }
    };

    checkVideoFile();

    return () => {
      isCancelled = true;
    };
  }, [capturedVideoUri]);

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
      // Vision Camera v5: createRecorder with fileType option
      const filePath = getMediaFilePath('video');
      const recorder = await videoOutput.createRecorder({
        fileType: 'mp4',
        filePath,
      });
      recorderRef.current = recorder;
      setIsRecording(true);
      setVideoPreviewError(null);
      setIsPreviewPlaying(false);

      await CameraService.startRecording(
        recorder,
        (uri: string) => {
          // Recording finished - show preview
          console.log('[CameraModal] Video recorded:', uri);
          setIsRecording(false);
          setCapturedVideoUri(uri);
          setVideoPreviewError(null);
          setIsPreviewPlaying(false);
          setVideoFileError(null);
          setIsVideoFileReady(false);
        },
        (err: CameraError) => {
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
  }, [isInitialized, onError, videoOutput]);

  const handleStopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    try {
      console.log('[CameraModal] Stopping video recording...');
      await CameraService.stopRecording(recorder);
      recorderRef.current = null;
      // Video URI will be set via onRecordingFinished callback
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
      setPermissionsGranted(false);
      return;
    }

    console.log('[CameraModal] Requesting permissions for mode:', mode);
    
    // For photo mode, only request camera permission
    // For video mode, request both camera and microphone permissions sequentially
    const requestPermissions = async () => {
      try {
        if (mode === 'photo') {
          const cameraStatus = await PermissionService.requestCameraPermission();
          console.log('[CameraModal] Camera permission:', cameraStatus);
          if (cameraStatus !== 'granted') {
            throw new Error('Camera permission not granted');
          }
          setPermissionsGranted(true);
        } else {
          // For video mode: request camera first
          const cameraStatus = await PermissionService.requestCameraPermission();
          console.log('[CameraModal] Camera permission:', cameraStatus);
          if (cameraStatus !== 'granted') {
            throw new Error('Camera permission not granted');
          }
          
          // Then request microphone
          const micStatus = await PermissionService.requestMicrophonePermission();
          console.log('[CameraModal] Microphone permission:', micStatus);
          if (micStatus !== 'granted') {
            throw new Error('Microphone permission not granted');
          }
          setPermissionsGranted(true);
        }
      } catch (err) {
        const cameraError = CameraError.fromUnknown(err);
        setErrorMessage(cameraError.userMessage);
        console.error('[Camera Error] Permission request failed', cameraError);
        setPermissionsGranted(false);
        onError(cameraError);
      }
    };

    requestPermissions();
  }, [visible, mode, onError]);

  // --------------------------------------------------------------------------
  // Cancel
  // --------------------------------------------------------------------------

  const handleCancel = useCallback(async () => {
    logPreview('Cancel pressed', {
      isRecording,
      hasRecorder: !!recorderRef.current,
      capturedVideoUri,
    });
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
    setCapturedVideoUri(null);
    setIsPreviewPlaying(false);
    setVideoPreviewError(null);
    setVideoFileError(null);
    setIsVideoFileReady(false);
    // Don't reset flash mode - keep user's preference
    onClose();
  }, [capturedVideoUri, isRecording, logPreview, onClose]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!capturedPhotoUri) return;

    console.log('[CameraModal] 📸 Confirm photo pressed');
    console.log('[CameraModal] 📋 Upload params:', {
      uploadPath,
      sectionKey,
      appointmentId,
      shouldUpload,
    });

    // If upload is not configured, return local URI directly
    if (!shouldUpload) {
      console.log('[CameraModal] ⚠️ No upload config, returning local URI');
      onCapture(capturedPhotoUri);
      setCapturedPhotoUri(null);
      onClose();
      return;
    }

    // Upload to S3
    console.log('[CameraModal] 🚀 Starting S3 upload for photo');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      logPreview('Starting S3 upload', { uploadPath, sectionKey, appointmentId });

      // Get presigned URL
      const { uploadUrl, fileUrl } = await presignedUrlService.getUrlForPath(
        sectionKey!,
        uploadPath!,
        appointmentId!,
      );

      logPreview('Got presigned URL, uploading to S3');

      // Upload to S3
      await uploadToS3(capturedPhotoUri, uploadUrl, (progress) => {
        setUploadProgress(progress.percentage);
        logPreview('Upload progress:', progress.percentage + '%');
      });

      logPreview('Upload successful, deleting local file');

      // Delete local file
      await deleteLocalFile(capturedPhotoUri);

      logPreview('Returning S3 URL:', fileUrl);

      // Return S3 URL
      onCapture(fileUrl);
      setCapturedPhotoUri(null);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error('[CameraModal] Upload failed:', error);
      setIsUploading(false);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [capturedPhotoUri, shouldUpload, uploadPath, sectionKey, appointmentId, onCapture, onClose, logPreview]);

  const handleRetakePhoto = useCallback(() => {
    setCapturedPhotoUri(null);
    setErrorMessage(null);
  }, []);

  const handleConfirmVideo = useCallback(async () => {
    if (!capturedVideoUri) return;

    // If upload is not configured, return local URI directly
    if (!shouldUpload) {
      logPreview('No upload config, returning local URI');
      setIsPreviewPlaying(false);
      onCapture(capturedVideoUri);
      setCapturedVideoUri(null);
      setVideoFileError(null);
      setIsVideoFileReady(false);
      onClose();
      return;
    }

    // Upload to S3
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      logPreview('Starting S3 upload', { uploadPath, sectionKey, appointmentId });

      // Get presigned URL
      const { uploadUrl, fileUrl } = await presignedUrlService.getUrlForPath(
        sectionKey!,
        uploadPath!,
        appointmentId!,
      );

      logPreview('Got presigned URL, uploading to S3');

      // Upload to S3
      await uploadToS3(capturedVideoUri, uploadUrl, (progress) => {
        setUploadProgress(progress.percentage);
        logPreview('Upload progress:', progress.percentage + '%');
      });

      logPreview('Upload successful, deleting local file');

      // Delete local file
      await deleteLocalFile(capturedVideoUri);

      logPreview('Returning S3 URL:', fileUrl);

      // Return S3 URL
      setIsPreviewPlaying(false);
      onCapture(fileUrl);
      setCapturedVideoUri(null);
      setVideoFileError(null);
      setIsVideoFileReady(false);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error('[CameraModal] Upload failed:', error);
      setIsUploading(false);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [capturedVideoUri, shouldUpload, uploadPath, sectionKey, appointmentId, logPreview, onCapture, onClose]);

  const handleRetakeVideo = useCallback(() => {
    logPreview('Retake video pressed', { capturedVideoUri });
    setCapturedVideoUri(null);
    setErrorMessage(null);
    setVideoPreviewError(null);
    setIsPreviewPlaying(false);
    setVideoFileError(null);
    setIsVideoFileReady(false);
  }, [capturedVideoUri, logPreview]);

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
                disabled={isUploading}
                accessibilityLabel="Retake photo"
                accessibilityRole="button">
                <Text style={styles.previewButtonIcon}>↻</Text>
                <Text style={styles.previewButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.previewButton, styles.confirmButton]}
                onPress={handleConfirmPhoto}
                disabled={isUploading}
                accessibilityLabel="Use this photo"
                accessibilityRole="button">
                {isUploading ? (
                  <>
                    <ActivityIndicator color={colors.surface} size="small" />
                    <Text style={styles.confirmButtonText}>Uploading... {uploadProgress}%</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.confirmButtonIcon}>✓</Text>
                    <Text style={styles.confirmButtonText}>Use Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Upload Error */}
            {uploadError && (
              <View style={styles.uploadErrorContainer}>
                <Text style={styles.uploadErrorText}>Upload failed: {uploadError}</Text>
                <TouchableOpacity onPress={handleConfirmPhoto} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        ) : capturedVideoUri ? (
          <SafeAreaView style={styles.previewContainer} edges={['top', 'bottom']}>
            {(() => {
              const normalizedPreviewUri = normalizeMediaUri(capturedVideoUri);
              const canRenderPreview =
                isValidMediaUri(normalizedPreviewUri) &&
                isVideoFileReady &&
                !videoFileError &&
                !videoPreviewError;

              logPreview('Rendering preview branch', {
                capturedVideoUri,
                normalizedPreviewUri,
                isVideoFileReady,
                videoFileError,
                videoPreviewError,
                isPreviewPlaying,
                canRenderPreview,
              });

              if (!canRenderPreview) {
                logPreview('Showing video placeholder instead of player');
                return (
                  <View style={styles.videoPreviewPlaceholder}>
                    <Text style={styles.videoPreviewIcon}>🎥</Text>
                    <Text style={styles.videoPreviewText}>
                      {videoFileError ?? videoPreviewError ?? 'Video recorded'}
                    </Text>
                    <Text style={styles.videoPreviewSubtext}>Ready to use</Text>
                  </View>
                );
              }

              return (
                <View style={styles.previewVideoContainer}>
                  <WebView
                    style={styles.previewVideo}
                    originWhitelist={['*']}
                    source={{ html: buildVideoPreviewHtml(normalizedPreviewUri) }}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    allowFileAccess
                    allowFileAccessFromFileURLs
                    allowUniversalAccessFromFileURLs
                    onError={(event: any) => console.log('[CameraModal] preview WebView error', event.nativeEvent)}
                  />
                </View>
              );
            })()}
            
            {/* Preview Controls */}
            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={handleRetakeVideo}
                disabled={isUploading}
                accessibilityLabel="Retake video"
                accessibilityRole="button">
                <Text style={styles.previewButtonIcon}>↻</Text>
                <Text style={styles.previewButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.previewButton, styles.confirmButton]}
                onPress={handleConfirmVideo}
                disabled={isUploading}
                accessibilityLabel="Use this video"
                accessibilityRole="button">
                {isUploading ? (
                  <>
                    <ActivityIndicator color={colors.surface} size="small" />
                    <Text style={styles.confirmButtonText}>Uploading... {uploadProgress}%</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.confirmButtonIcon}>✓</Text>
                    <Text style={styles.confirmButtonText}>Use Video</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Upload Error */}
            {uploadError && (
              <View style={styles.uploadErrorContainer}>
                <Text style={styles.uploadErrorText}>Upload failed: {uploadError}</Text>
                <TouchableOpacity onPress={handleConfirmVideo} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        ) : (
          <>
            {device && permissionsGranted && (
              <CameraPreview
                ref={cameraRef}
                device={device}
                isActive={visible && permissionsGranted}
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

            {!permissionsGranted && (
              <View style={styles.permissionWaiting}>
                <Text style={styles.permissionWaitingText}>loading...</Text>
              </View>
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
  permissionWaiting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  permissionWaitingText: {
    color: colors.surface,
    fontSize: typography.fontSize.base,
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
  videoPreviewPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewVideoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  previewPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  previewPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlayIcon: {
    fontSize: 28,
    color: colors.surface,
  },
  videoPreviewIcon: {
    fontSize: 80,
    marginBottom: vs(16),
  },
  videoPreviewText: {
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
    marginBottom: vs(8),
  },
  videoPreviewSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.surfaceSecondary,
  },
  uploadErrorContainer: {
    position: 'absolute',
    bottom: vs(120),
    left: 24,
    right: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadErrorText: {
    flex: 1,
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    marginRight: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#DC2626',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default memo(CameraModal);
