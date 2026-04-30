/**
 * DailyQuoteWidget Component
 * Auto-rotating motivational quote card on the home screen
 * Shows a new quote each day, tappable for the next one
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { motivations } from '../utils/motivations';

// Get a deterministic quote index based on the date
const getDailyQuoteIndex = () => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return dayOfYear % motivations.length;
};

export const DailyQuoteWidget = () => {
  const [quoteIndex, setQuoteIndex] = useState(getDailyQuoteIndex());
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const quote = motivations[quoteIndex];

  const handleNextQuote = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change quote
      setQuoteIndex((prev) => (prev + 1) % motivations.length);

      // Animate in
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  if (!quote) return null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handleNextQuote}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(0, 217, 255, 0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="sunny-outline" size={14} color={Colors.accent} />
              <Text style={styles.badgeText}>Daily Wisdom</Text>
            </View>
            <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
          </View>

          <Text style={styles.quoteText}>"{quote.text}"</Text>

          <View style={styles.footer}>
            <Text style={styles.authorText}>— {quote.author || 'Unknown'}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{quote.category}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  categoryBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
