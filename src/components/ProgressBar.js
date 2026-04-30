/**
 * ProgressBar Component
 * Animated progress bar with percentage label
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../theme';

export const ProgressBar = ({ progress = 0, showLabel = true, height = 10, style }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Your Progress</Text>
          <Text style={styles.percentage}>{progress}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolation, height }]}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { height }]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  track: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.full,
  },
});
