/**
 * AchievementBadge Component
 * Gamification badges with locked/unlocked states
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

export const ACHIEVEMENTS = [
  { id: 'first_log', title: 'First Step', description: 'Created your first log', icon: 'footsteps-outline', color: '#10B981', req: (s) => s.totalLogs >= 1 },
  { id: 'streak_7', title: 'On Fire', description: '7-day active streak', icon: 'flame-outline', color: '#FF6B6B', req: (s) => s.streak >= 7 },
  { id: 'completed_10', title: 'Achiever', description: 'Completed 10 plans', icon: 'checkmark-done-outline', color: '#6C63FF', req: (s) => s.completed >= 10 },
  { id: 'completed_25', title: 'Unstoppable', description: 'Completed 25 plans', icon: 'rocket-outline', color: '#00D9FF', req: (s) => s.completed >= 25 },
  { id: 'ai_master', title: 'AI Master', description: 'Used AI 10 times', icon: 'sparkles-outline', color: '#A78BFA', req: (s) => s.totalLogs >= 10 },
  { id: 'warrior', title: 'Warrior', description: '5 survival sessions', icon: 'shield-outline', color: '#F59E0B', req: (s) => s.survivalCount >= 5 },
  { id: 'growth_guru', title: 'Growth Guru', description: '10 growth sessions', icon: 'trending-up-outline', color: '#10B981', req: (s) => s.growthCount >= 10 },
  { id: 'centurion', title: 'Centurion', description: '50 total logs', icon: 'star-outline', color: '#FFD700', req: (s) => s.totalLogs >= 50 },
];

export const calcStats = (logs = []) => {
  const totalLogs = logs.length;
  const completed = logs.filter(l => l.completed).length;
  const survivalCount = logs.filter(l => l.mode === 'survival').length;
  const growthCount = logs.filter(l => l.mode === 'growth').length;
  const uniqueDays = new Set(logs.map(log => {
    const d = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
    return d.toDateString();
  }));
  return { totalLogs, completed, survivalCount, growthCount, streak: uniqueDays.size };
};

const Badge = ({ badge, unlocked }) => (
  <View style={[styles.badge, unlocked ? styles.unlocked : styles.locked]}>
    <View style={[styles.iconCircle, { backgroundColor: unlocked ? badge.color + '20' : 'rgba(100,116,139,0.1)' }, unlocked && { borderColor: badge.color, borderWidth: 1.5 }]}>
      <Ionicons name={badge.icon} size={22} color={unlocked ? badge.color : Colors.textMuted} />
    </View>
    <Text style={[styles.title, !unlocked && styles.mutedText]} numberOfLines={1}>{badge.title}</Text>
    <Text style={[styles.desc, !unlocked && styles.mutedText]} numberOfLines={2}>{badge.description}</Text>
    {!unlocked && <View style={styles.lockIcon}><Ionicons name="lock-closed" size={12} color={Colors.textMuted} /></View>}
  </View>
);

export const AchievementGrid = ({ logs = [] }) => {
  const stats = calcStats(logs);
  const count = ACHIEVEMENTS.filter(b => b.req(stats)).length;
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.countBadge}>
          <Ionicons name="trophy" size={12} color={Colors.warning} />
          <Text style={styles.countText}>{count}/{ACHIEVEMENTS.length}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map(b => <Badge key={b.id} badge={b} unlocked={b.req(stats)} />)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  countBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, gap: 4 },
  countText: { color: Colors.warning, fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: { width: '48%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, alignItems: 'center', ...Shadows.small },
  unlocked: { borderColor: Colors.borderLight, backgroundColor: Colors.surfaceLight },
  locked: { borderColor: Colors.border, opacity: 0.6 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  title: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2, textAlign: 'center' },
  desc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },
  mutedText: { color: Colors.textMuted },
  lockIcon: { position: 'absolute', top: 8, right: 8 },
});
