/**
 * MoodSelector Component
 * Animated emoji buttons for mood selection
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { getMoodEmoji, getMoodLabel } from '../utils/helpers';

const MOODS = ['stressed', 'tired', 'happy', 'overwhelmed', 'neutral'];

const MoodButton = ({ mood, isSelected, onSelect }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect(mood);
  };

  const moodColors = {
    stressed: Colors.moodStressed,
    tired: Colors.moodTired,
    happy: Colors.moodHappy,
    overwhelmed: Colors.moodOverwhelmed,
    neutral: Colors.moodNeutral,
  };

  const color = moodColors[mood];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.moodButton,
          isSelected && {
            backgroundColor: color + '20',
            borderColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        <Text style={styles.emoji}>{getMoodEmoji(mood)}</Text>
        <Text
          style={[
            styles.moodLabel,
            isSelected && { color: color, fontWeight: '600' },
          ]}
        >
          {getMoodLabel(mood)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MoodSelector = ({ selectedMood, onMoodSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.grid}>
        {MOODS.map((mood) => (
          <MoodButton
            key={mood}
            mood={mood}
            isSelected={selectedMood === mood}
            onSelect={onMoodSelect}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 90,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});
