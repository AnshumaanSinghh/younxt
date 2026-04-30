/**
 * Profile Screen — Enhanced with Real Charts, Achievements, Edit Profile
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useApp } from '../../src/context/AppContext';
import { signOutUser } from '../../src/services/auth';
import { updateUserProfile } from '../../src/services/firestore';
import { Button } from '../../src/components/Button';
import { AchievementGrid } from '../../src/components/AchievementBadge';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/theme';

export default function ProfileScreen() {
  const { user, userProfile, refreshProfile } = useAuth();
  const { logs, progress } = useApp();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to sign out?")) {
        setSigningOut(true);
        await signOutUser();
        setSigningOut(false);
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out", style: "destructive",
          onPress: async () => {
            setSigningOut(true);
            await signOutUser();
            setSigningOut(false);
          },
        },
      ]);
    }
  };

  const handleEditProfile = () => {
    setEditName(userProfile?.name || '');
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.uid || !editName.trim()) return;
    try {
      await updateUserProfile(user.uid, { name: editName.trim() });
      await refreshProfile();
    } catch (e) {
      console.error('Profile update failed:', e);
    }
    setEditing(false);
  };

  const completedCount = logs.filter((l) => l.completed).length;
  const initials = userProfile?.name
    ? userProfile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  // Real chart data from logs (last 7 days)
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekData = days.map((_, idx) => {
      const targetDate = new Date(now);
      const currentDay = now.getDay(); // 0=Sun
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      targetDate.setDate(now.getDate() + mondayOffset + idx);
      const dateStr = targetDate.toDateString();
      const count = logs.filter((log) => {
        const d = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
        return d.toDateString() === dateStr;
      }).length;
      return count;
    });
    const maxVal = Math.max(...weekData, 1);
    return weekData.map((v) => v / maxVal);
  }, [logs]);

  // Mood distribution
  const moodDist = useMemo(() => {
    const dist = {};
    logs.forEach((l) => { dist[l.mood] = (dist[l.mood] || 0) + 1; });
    const total = logs.length || 1;
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([mood, count]) => ({ mood, count, pct: Math.round((count / total) * 100) }));
  }, [logs]);

  const moodColors = {
    stressed: Colors.moodStressed, tired: Colors.moodTired,
    happy: Colors.moodHappy, overwhelmed: Colors.moodOverwhelmed,
    neutral: Colors.moodNeutral,
  };

  const uniqueDays = new Set(logs.map((log) => {
    const d = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
    return d.toDateString();
  })).size;

  const getPersona = () => {
    if (uniqueDays > 5) return { title: "The Relentless Achiever", desc: "Your future self sees a leader who never backs down from a challenge." };
    if (completedCount > 3) return { title: "The Strategic Executor", desc: "You turn every AI suggestion into a concrete win for your legacy." };
    return { title: "The Emerging Visionary", desc: "You are just beginning to align your daily actions with your grandest goals." };
  };
  const persona = getPersona();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} disabled={signingOut} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput style={styles.editInput} value={editName}
                onChangeText={setEditName} autoFocus placeholder="Your name"
                placeholderTextColor={Colors.textMuted} />
              <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={20} color={Colors.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                <Ionicons name="close" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleEditProfile} style={styles.nameRow}>
              <Text style={styles.name}>{userProfile?.name || 'User'}</Text>
              <Ionicons name="pencil-outline" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.levelText}>{userProfile?.level || 'Beginner'}</Text>
          </View>
        </View>

        {/* AI Persona Card */}
        <LinearGradient colors={['rgba(108,99,255,0.15)', 'rgba(20,25,41,0.8)']} style={styles.personaCard}>
          <View style={styles.personaHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
            <Text style={styles.personaTitle}>AI Persona</Text>
          </View>
          <Text style={styles.personaName}>{persona.title}</Text>
          <Text style={styles.personaDesc}>{persona.desc}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{progress}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Achievements */}
        <AchievementGrid logs={logs} />

        {/* Activity Chart (Real Data) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Activity Insights</Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={Colors.accent} />
              <Text style={styles.streakText}>{uniqueDays} Day Streak</Text>
            </View>
          </View>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>This Week</Text>
            <View style={styles.chartContainer}>
              {chartData.map((val, idx) => (
                <View key={idx} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${Math.max(val * 100, 4)}%` }]} />
                  <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Mood Distribution */}
        {moodDist.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood Distribution</Text>
            <View style={styles.moodDistCard}>
              {moodDist.map(({ mood, pct }) => (
                <View key={mood} style={styles.moodDistRow}>
                  <Text style={styles.moodDistLabel}>{mood}</Text>
                  <View style={styles.moodDistBar}>
                    <View style={[styles.moodDistFill, {
                      width: `${pct}%`,
                      backgroundColor: moodColors[mood] || Colors.primary,
                    }]} />
                  </View>
                  <Text style={styles.moodDistPct}>{pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goals & Hobbies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <View style={styles.chipContainer}>
            {userProfile?.goals?.map((goal, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{goal}</Text>
              </View>
            ))}
            {(!userProfile?.goals || userProfile.goals.length === 0) && (
              <Text style={styles.emptyHint}>No goals set yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Hobbies</Text>
          <View style={styles.chipContainer}>
            {userProfile?.hobbies?.map((hobby, idx) => (
              <View key={idx} style={[styles.chip, styles.hobbyChip]}>
                <Text style={styles.chipText}>{hobby}</Text>
              </View>
            ))}
            {(!userProfile?.hobbies || userProfile.hobbies.length === 0) && (
              <Text style={styles.emptyHint}>No hobbies set yet</Text>
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>YouNxt v1.0.0</Text>
          <Text style={styles.appInfoText}>Future Self Decision Engine</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  logoutBtn: { padding: Spacing.xs },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryMuted, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary, marginBottom: Spacing.md,
    ...Shadows.glow(Colors.primary),
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.primaryLight },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...Typography.styles.title, color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.md },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  editInput: {
    fontSize: 20, fontWeight: '700', color: Colors.textPrimary,
    borderBottomWidth: 2, borderBottomColor: Colors.primary,
    paddingVertical: 4, paddingHorizontal: 8, minWidth: 150, textAlign: 'center',
  },
  saveBtn: { padding: 6 },
  cancelBtn: { padding: 6 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.warningMuted, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full, gap: 6,
  },
  levelText: { fontSize: 13, fontWeight: '700', color: Colors.warning, textTransform: 'capitalize' },
  personaCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', backgroundColor: 'rgba(108,99,255,0.05)',
  },
  personaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.xs },
  personaTitle: { fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  personaName: { ...Typography.styles.subtitle, color: Colors.textPrimary, marginBottom: 4 },
  personaDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  statsContainer: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.small,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: Spacing.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.15)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, gap: 4,
  },
  streakText: { color: Colors.accent, fontWeight: '700', fontSize: 12 },
  chartCard: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight,
  },
  chartTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: Spacing.lg },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingHorizontal: Spacing.xs },
  barWrapper: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: 24 },
  bar: { width: 8, backgroundColor: Colors.primary, borderRadius: 4, marginBottom: 8, minHeight: 4 },
  barLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  moodDistCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  moodDistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  moodDistLabel: { fontSize: 13, color: Colors.textSecondary, width: 85, textTransform: 'capitalize', fontWeight: '500' },
  moodDistBar: { flex: 1, height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  moodDistFill: { height: '100%', borderRadius: 4 },
  moodDistPct: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, width: 36, textAlign: 'right' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.surfaceLight, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.borderLight,
  },
  hobbyChip: { backgroundColor: Colors.accentMuted, borderColor: 'transparent' },
  chipText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  emptyHint: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  appInfo: { alignItems: 'center', paddingVertical: Spacing.xl, opacity: 0.4 },
  appInfoText: { fontSize: 12, color: Colors.textMuted },
});
