/**
 * CameraPreview - Wraps react-native-vision-camera v4 Camera component
 * Provides loading state and error handling for camera initialization
 */

import React, { memo, useCallback, useState, forwardRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { CameraError, CameraErrorCode } from '../types';
import { Camera, type CameraDevice } from '../utils/visionCamera';

// ============================================================================
// Props
// ============================================================================

interface CameraPreviewProps {
  device: CameraDevice;
  isActive: boolean;
  mode?: 'photo' | 'video';  // Add mode prop
  onInitialized?: () => void;
  onError?: (error: CameraError) => void;
  children?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

const CameraPreview = forwardRef<any, CameraPreviewProps>(
  ({ device, isActive, mode = 'photo', onInitialized, onError, children }, ref) => {
  const [isStarted, setIsStarted] = useState(false);

  const handleInitialized = useCallback(() => {
    setIsStarted(true);
    onInitialized?.();
    console.log('[CameraPreview] Camera initialized');
  }, [onInitialized]);

  const handleError = useCallback(
    (err: Error) => {
      setIsStarted(false);
      const cameraError = new CameraError(
        CameraErrorCode.INITIALIZATION_FAILED,
        err.message,
        'Failed to initialize camera. Please try again.',
        err,
      );
      console.error('[CameraPreview] Camera error:', cameraError);
      onError?.(cameraError);
    },
    [onError],
  );

  return (
    <View style={styles.container}>
      <Camera
        ref={ref}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={mode === 'photo' || mode === 'video'}
        video={mode === 'video'}
        audio={mode === 'video'}
        onInitialized={handleInitialized}
        onError={handleError}
      />

      {/* Loading overlay until camera starts */}
      {!isStarted && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.surface} />
        </View>
      )}

      {/* Controls overlay */}
      {isStarted && children}
    </View>
  );
});

CameraPreview.displayName = 'CameraPreview';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(CameraPreview);
