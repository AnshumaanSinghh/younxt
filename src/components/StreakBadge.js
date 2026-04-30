/**
 * StreakBadge Component
 * Animated fire-emoji streak counter with glow effect
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../theme';

export const StreakBadge = ({ currentStreak = 0, bestStreak = 0 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (currentStreak > 0) {
      // Pulsing animation for active streaks
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStreak]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={currentStreak > 0 
          ? ['rgba(255, 107, 107, 0.15)', 'rgba(255, 165, 0, 0.1)']
          : ['rgba(100, 116, 139, 0.1)', 'rgba(100, 116, 139, 0.05)']
        }
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={currentStreak > 0 ? "flame" : "flame-outline"} 
            size={28} 
            color={currentStreak > 0 ? '#FF6B6B' : Colors.textMuted} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.streakNumber, currentStreak === 0 && styles.inactiveText]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakLabel}>
            {currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
          </Text>
        </View>
        {bestStreak > 0 && (
          <View style={styles.bestBadge}>
            <Ionicons name="trophy-outline" size={10} color={Colors.warning} />
            <Text style={styles.bestText}>{bestStreak}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B6B',
    letterSpacing: -0.5,
  },
  inactiveText: {
    color: Colors.textMuted,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  bestText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
  },
});
