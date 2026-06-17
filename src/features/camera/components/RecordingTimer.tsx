/**
 * RecordingTimer - Displays elapsed recording time with a pulsing red dot
 * Used inside CameraControls when video recording is active
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { hs, vs } from '../../../utils/scaling';

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ============================================================================
// Component
// ============================================================================

export const RecordingTimer: React.FC = memo(() => {
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pulsing dot animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Recording in progress. Duration: ${formatDuration(elapsed)}`}
      accessibilityLiveRegion="polite">
      <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
      <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
    </View>
  );
});

RecordingTimer.displayName = 'RecordingTimer';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: 20,
    gap: hs(6),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  timer: {
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    fontVariant: ['tabular-nums'],
  },
});
