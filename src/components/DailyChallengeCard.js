/**
 * DailyChallengeCard Component
 * Shows a daily personalized challenge based on user goals
 */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

const CHALLENGES = [
  { icon: 'book-outline', text: 'Read for 20 minutes today', category: 'Mind' },
  { icon: 'walk-outline', text: 'Take a 15-minute walk without your phone', category: 'Body' },
  { icon: 'water-outline', text: 'Drink 8 glasses of water today', category: 'Health' },
  { icon: 'pencil-outline', text: 'Write down 3 things you are grateful for', category: 'Soul' },
  { icon: 'barbell-outline', text: 'Do a 10-minute workout or stretch', category: 'Body' },
  { icon: 'chatbubble-outline', text: 'Reach out to someone you haven\'t spoken to', category: 'Social' },
  { icon: 'bulb-outline', text: 'Learn one new thing about your goal today', category: 'Mind' },
  { icon: 'moon-outline', text: 'Go to bed 30 minutes earlier tonight', category: 'Health' },
  { icon: 'musical-notes-outline', text: 'Listen to music that inspires you for 15 min', category: 'Soul' },
  { icon: 'code-slash-outline', text: 'Spend 30 focused minutes on a skill', category: 'Growth' },
  { icon: 'heart-outline', text: 'Do one kind thing for someone today', category: 'Social' },
  { icon: 'leaf-outline', text: 'Spend 10 minutes in nature or fresh air', category: 'Health' },
  { icon: 'trophy-outline', text: 'Set one micro-goal and achieve it today', category: 'Growth' },
  { icon: 'eye-outline', text: 'Practice 5 minutes of mindful breathing', category: 'Soul' },
];

const getDailyChallenge = () => {
  const now = new Date();
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return CHALLENGES[day % CHALLENGES.length];
};

export const DailyChallengeCard = () => {
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const challenge = getDailyChallenge();

  const handleAccept = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    setAccepted(true);
  };

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    setCompleted(true);
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={completed 
          ? ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.04)']
          : ['rgba(255, 165, 0, 0.1)', 'rgba(255, 107, 107, 0.06)']
        }
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color={completed ? Colors.success : '#FFA500'} />
            <Text style={[styles.badgeText, completed && { color: Colors.success }]}>
              Daily Challenge
            </Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{challenge.category}</Text>
          </View>
        </View>

        <View style={styles.challengeRow}>
          <View style={[styles.iconCircle, completed && styles.iconCompleted]}>
            <Ionicons name={completed ? 'checkmark' : challenge.icon} size={24}
              color={completed ? Colors.success : '#FFA500'} />
          </View>
          <Text style={[styles.challengeText, completed && styles.completedText]}>
            {challenge.text}
          </Text>
        </View>

        {!accepted && !completed && (
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.8}>
            <Text style={styles.acceptText}>Accept Challenge</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFA500" />
          </TouchableOpacity>
        )}

        {accepted && !completed && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.completeText}>Mark as Done</Text>
          </TouchableOpacity>
        )}

        {completed && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.completedBannerText}>Challenge Completed! 🎉</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,165,0,0.2)', overflow: 'hidden', ...Shadows.small },
  gradient: { padding: Spacing.lg, borderRadius: BorderRadius.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,165,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(255,165,0,0.2)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFA500', textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryTag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  categoryText: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase' },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,165,0,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,165,0,0.3)' },
  iconCompleted: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  challengeText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary, lineHeight: 22 },
  completedText: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(255,165,0,0.3)', backgroundColor: 'rgba(255,165,0,0.05)' },
  acceptText: { fontSize: 14, fontWeight: '600', color: '#FFA500' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.success },
  completeText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  completedBannerText: { fontSize: 14, fontWeight: '600', color: Colors.success },
});
