/**
 * Home Screen — Premium YouNxt Dashboard
 * Features: Greeting, Streak, Daily Quote, Daily Challenge, Mood/Mode, AI Generation
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { MoodSelector } from '../../src/components/MoodSelector';
import { ModeToggle } from '../../src/components/ModeToggle';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Button } from '../../src/components/Button';
import { SuggestionCard } from '../../src/components/SuggestionCard';
import { DailyQuoteWidget } from '../../src/components/DailyQuoteWidget';
import { StreakBadge } from '../../src/components/StreakBadge';
import { DailyChallengeCard } from '../../src/components/DailyChallengeCard';
import { Colors, Spacing, Typography } from '../../src/theme';
import { getGreeting } from '../../src/utils/helpers';
import { isRateLimited } from '../../src/utils/security';

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const {
    logs, progress, loadLogs,
    currentSuggestion, setCurrentSuggestion,
    suggestionLoading, setSuggestionLoading,
    clearSuggestion, saveSuggestionLog, refineCurrentSuggestion, trySomethingNew, generateSuggestion,
  } = useApp();

  const [mood, setMood] = useState('neutral');
  const [mode, setMode] = useState('balanced');
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [strategy, setStrategy] = useState('Improve Current Path');
  const [simulationMode, setSimulationMode] = useState(false);

  // Animations
  const greetFade = useRef(new Animated.Value(0)).current;
  const greetSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (user?.uid) {
      loadLogs(user.uid);
    }
    // Animate greeting entrance
    Animated.parallel([
      Animated.timing(greetFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(greetSlide, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) await loadLogs(user.uid);
    setRefreshing(false);
  };

  const handleGenerate = async () => {
    if (isRateLimited('generate_suggestion', 10, 60000)) {
      return; // Silently prevent spam
    }

    setSuggestionLoading(true);
    clearSuggestion();

    try {
      await generateSuggestion(
        mood, mode, strategy, simulationMode,
        userProfile?.goals || [],
        userProfile?.hobbies || [],
        userProfile?.level || 'beginner',
        logs.slice(0, 3)
      );
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleTryNew = async () => {
    if (isRateLimited('generate_new_direction', 10, 60000)) return;

    setSuggestionLoading(true);
    clearSuggestion();

    try {
      await trySomethingNew(
        userProfile?.goals || [],
        userProfile?.hobbies || [],
        userProfile?.level || 'beginner',
        simulationMode,
        logs.slice(0, 3)
      );
    } catch (error) {
      console.error('Try New failed:', error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentSuggestion || !user) return;
    setSaving(true);
    try {
      await saveSuggestionLog(user.uid, {
        mood, mode, strategy,
        motivationalLine: currentSuggestion.motivationalLine,
        actionSteps: currentSuggestion.actionSteps,
        confidenceScore: currentSuggestion.confidenceScore || null,
        confidenceReason: currentSuggestion.confidenceReason || null,
        simulation: currentSuggestion.simulation || null,
        simulationMode,
      });
    } catch (error) {
      console.error('Save failed:', error);
    }
    setSaving(false);
    clearSuggestion();
  };

  const handleRefine = async (feedback) => {
    setRefining(true);
    try {
      await refineCurrentSuggestion(
        mood, mode, strategy, simulationMode,
        userProfile?.goals || [], 
        userProfile?.hobbies || [], 
        userProfile?.level || 'beginner', 
        logs.slice(0, 3),
        feedback
      );
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setRefining(false);
    }
  };

  // Calculate streak
  const uniqueDays = new Set(
    logs.map((log) => {
      const d = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
      return d.toDateString();
    })
  );
  const currentStreak = uniqueDays.size;

  const firstName = userProfile?.name?.split(' ')[0] || '';

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Progress */}
        <ProgressBar progress={progress} />

        {/* Animated Greeting */}
        <Animated.View style={[styles.greetingSection, { opacity: greetFade, transform: [{ translateY: greetSlide }] }]}>
          <Text style={styles.greeting}>{getGreeting(firstName)}</Text>
          <Text style={styles.subGreeting}>Let's chart your course for today.</Text>
        </Animated.View>

        {/* Streak Badge */}
        <StreakBadge currentStreak={currentStreak} bestStreak={currentStreak} />

        {/* Daily Quote Widget */}
        <View style={styles.sectionSpacer}>
          <DailyQuoteWidget />
        </View>

        {/* Daily Challenge */}
        <DailyChallengeCard />

        {/* Mood & Mode Selection */}
        <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
        <ModeToggle selectedMode={mode} onModeSelect={setMode} />

        {/* Strategy Selection */}
        <View style={styles.sectionSpacer}>
          <Text style={styles.sectionTitle}>Strategy</Text>
          <View style={styles.strategyRow}>
            {['Improve Current Path', 'Experiment Mode'].map(strat => (
              <TouchableOpacity
                key={strat}
                style={[styles.strategyBtn, strategy === strat && styles.strategyBtnActive]}
                onPress={() => setStrategy(strat)}
              >
                <Text style={[styles.strategyBtnText, strategy === strat && styles.strategyBtnTextActive]}>{strat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Simulation Toggle */}
        <View style={styles.simulationRow}>
          <View>
            <Text style={styles.simulationTitle}>Future Simulation Engine</Text>
            <Text style={styles.simulationDesc}>Predict 7/30/90 day outcomes</Text>
          </View>
          <TouchableOpacity 
            style={[styles.simToggle, simulationMode && styles.simToggleActive]}
            onPress={() => setSimulationMode(!simulationMode)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.simToggleKnob, simulationMode && styles.simToggleKnobActive]} />
          </TouchableOpacity>
        </View>

        {/* Generate Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Ask Your Future Self"
            icon={<Ionicons name="sparkles" size={20} color={Colors.textPrimary} />}
            onPress={handleGenerate}
            loading={suggestionLoading}
            size="lg"
            style={styles.generateButton}
          />
          <Button
            title="Try Something New"
            icon={<Ionicons name="rocket-outline" size={20} color={Colors.textPrimary} />}
            onPress={handleTryNew}
            disabled={suggestionLoading}
            variant="outline"
            style={styles.tryNewButton}
          />
        </View>

        {/* Suggestion Card */}
        {currentSuggestion && (
          <SuggestionCard
            suggestion={currentSuggestion}
            onSave={handleSave}
            onDismiss={clearSuggestion}
            onRefine={handleRefine}
            onTryAlternative={handleTryNew}
            saving={saving}
            refining={refining}
          />
        )}

        {/* Recent Activity */}
        {logs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Activity</Text>
            {logs.slice(0, 3).map((log, idx) => (
              <View key={log.id || idx} style={styles.recentItem}>
                <View style={[styles.recentDot, log.completed && styles.recentDotDone]} />
                <Text style={styles.recentText} numberOfLines={1}>
                  {log.motivationalLine || 'Session logged'}
                </Text>
                <Ionicons
                  name={log.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={log.completed ? Colors.success : Colors.textMuted}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  greetingSection: { marginBottom: Spacing.lg, marginTop: Spacing.sm },
  greeting: { ...Typography.styles.title, color: Colors.textPrimary },
  subGreeting: { ...Typography.styles.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  sectionSpacer: { marginTop: Spacing.lg },
  actionSection: { marginTop: Spacing.lg, gap: Spacing.sm },
  generateButton: { width: '100%' },
  tryNewButton: { width: '100%' },
  recentSection: {
    marginTop: Spacing.xl, backgroundColor: Colors.surface,
    borderRadius: 16, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  recentTitle: {
    fontSize: 14, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  recentDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted,
  },
  recentDotDone: { backgroundColor: Colors.success },
  recentText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  strategyRow: { flexDirection: 'row', gap: Spacing.sm },
  strategyBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  strategyBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  strategyBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  strategyBtnTextActive: { color: '#fff' },
  simulationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceHighlight, padding: Spacing.md, borderRadius: 12, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  simulationTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  simulationDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  simToggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: Colors.border, padding: 2, justifyContent: 'center' },
  simToggleActive: { backgroundColor: Colors.primary },
  simToggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  simToggleKnobActive: { transform: [{ translateX: 22 }] },
});
