/**
 * SuggestionCard Component — Premium Edition
 * Displays AI suggestion with routing metadata, confidence score,
 * immersive future simulation timeline, and deep dive capabilities.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

export const SuggestionCard = ({ suggestion, onSave, onDismiss, onRefine, onTryAlternative, saving = false, refining = false }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showRefine, setShowRefine] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeSimTab, setActiveSimTab] = useState('follow');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [suggestion]);

  if (!suggestion) return null;

  const handleRefineSubmit = () => {
    if (feedback.trim() && onRefine) {
      onRefine(feedback.trim());
      setShowRefine(false);
      setFeedback('');
    }
  };

  const routing = suggestion._routing;
  const hasSim = suggestion.simulation && suggestion.simulation.optionA && suggestion.simulation.optionB;

  // Timeline node component for the simulation
  const TimelineNode = ({ label, text, color, delay = 0, isLast = false }) => {
    const nodeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(nodeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
    }, []);

    return (
      <Animated.View style={[styles.timelineNode, { opacity: nodeAnim }]}>
        <View style={styles.timelineNodeLeft}>
          <View style={[styles.timelineDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }]} />
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '40' }]} />}
        </View>
        <View style={styles.timelineNodeContent}>
          <Text style={[styles.timelineLabel, { color }]}>{label}</Text>
          <Text style={styles.timelineText}>{text}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>

      {/* Header: Routing Info + Confidence */}
      <View style={styles.headerRow}>
        {routing ? (
          <View style={styles.routingBadge}>
            <Ionicons name="git-branch-outline" size={13} color={Colors.accent} />
            <Text style={styles.routingText}>{routing.model}</Text>
            <View style={styles.latencyDot} />
            <Text style={styles.latencyText}>{routing.latencyMs}ms</Text>
          </View>
        ) : (
          <View style={styles.sourceBadge}>
            <Ionicons name="sparkles" size={14} color={Colors.accent} />
            <Text style={styles.sourceText}>AI Powered</Text>
          </View>
        )}

        {suggestion.confidenceScore && (
          <View style={styles.confidenceBadge}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.success} />
            <Text style={styles.confidenceText}>{suggestion.confidenceScore}%</Text>
          </View>
        )}

        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Motivational line */}
      <View style={styles.motivationContainer}>
        <LinearGradient colors={['rgba(108, 99, 255, 0.12)', 'rgba(0, 217, 255, 0.05)']} style={styles.motivationGradient}>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.motivationalLine}>{suggestion.motivationalLine}</Text>
          <Text style={styles.futureLabel}>— Your Future Self</Text>
        </LinearGradient>
      </View>

      {/* Explanation Toggle */}
      {showExplanation && suggestion.confidenceReason && (
        <View style={styles.explanationBox}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
            <Text style={styles.explanationTitle}>Why This Advice?</Text>
          </View>
          <Text style={styles.explanationText}>{suggestion.confidenceReason}</Text>
        </View>
      )}

      {/* Action Steps */}
      <Text style={styles.stepsTitle}>Recommended Path</Text>
      {suggestion.actionSteps.map((step, index) => (
        <View key={index} style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      {/* ═══════════════════════════════════════════════ */}
      {/* FUTURE SIMULATION TIMELINE — The "Wow" Feature */}
      {/* ═══════════════════════════════════════════════ */}
      {hasSim && (
        <View style={styles.simContainer}>
          {/* Section Header */}
          <View style={styles.simHeaderRow}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={styles.simSectionTitle}>Future Simulation</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.simTabRow}>
            <TouchableOpacity
              style={[styles.simTab, activeSimTab === 'follow' && styles.simTabActiveGreen]}
              onPress={() => setActiveSimTab('follow')}
            >
              <Ionicons name="trending-up" size={16}
                color={activeSimTab === 'follow' ? '#fff' : Colors.success} />
              <Text style={[styles.simTabText, activeSimTab === 'follow' && styles.simTabTextActive]}>
                Follow This Path
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simTab, activeSimTab === 'skip' && styles.simTabActiveRed]}
              onPress={() => setActiveSimTab('skip')}
            >
              <Ionicons name="trending-down" size={16}
                color={activeSimTab === 'skip' ? '#fff' : Colors.error} />
              <Text style={[styles.simTabText, activeSimTab === 'skip' && styles.simTabTextActive]}>
                Skip This Path
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timeline Display */}
          {activeSimTab === 'follow' ? (
            <View style={styles.timelineContainer}>
              <TimelineNode label="7 Days" text={suggestion.simulation.optionA.days7} color={Colors.success} delay={0} />
              <TimelineNode label="30 Days" text={suggestion.simulation.optionA.days30} color={Colors.success} delay={150} />
              <TimelineNode label="90 Days" text={suggestion.simulation.optionA.days90} color={Colors.success} delay={300} isLast />
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              <TimelineNode label="7 Days" text={suggestion.simulation.optionB.days7} color={Colors.error} delay={0} />
              <TimelineNode label="30 Days" text={suggestion.simulation.optionB.days30} color={Colors.error} delay={150} />
              <TimelineNode label="90 Days" text={suggestion.simulation.optionB.days90} color={Colors.error} delay={300} isLast />
            </View>
          )}
        </View>
      )}

      {/* Deep Dive / Refinement Section */}
      {showRefine ? (
        <View style={styles.refineContainer}>
          <Text style={styles.refineTitle}>What would you like to go deeper on?</Text>
          <TextInput
            style={styles.refineInput}
            placeholder="Describe your situation in more detail..."
            placeholderTextColor={Colors.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            maxLength={300}
            autoFocus
          />
          <View style={styles.refineActions}>
            <TouchableOpacity onPress={() => setShowRefine(false)} style={styles.cancelRefineBtn}>
              <Text style={styles.cancelRefineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRefineSubmit}
              style={[styles.submitRefineBtn, !feedback.trim() && { opacity: 0.5 }]}
              disabled={!feedback.trim() || refining}
            >
              {refining ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitRefineText}>Go Deeper</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actionButtonGroup}>
          {suggestion.confidenceReason && (
            <TouchableOpacity onPress={() => setShowExplanation(!showExplanation)} style={styles.actionIconButton}>
              <Ionicons name="search-outline" size={18} color={showExplanation ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.actionIconText, showExplanation && { color: Colors.primary }]}>Explain</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setShowRefine(true)} style={styles.actionIconButton}>
            <Ionicons name="options-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionIconText}>Refine</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTryAlternative} style={styles.actionIconButton}>
            <Ionicons name="refresh-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionIconText}>Alternative</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSave} disabled={saving} style={[styles.actionIconButton, styles.actionPrimaryBtn]}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="thumbs-up" size={18} color="#fff" />}
            <Text style={styles.actionPrimaryText}>{saving ? '...' : 'Helpful'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.lg, marginTop: Spacing.lg, ...Shadows.medium },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, gap: 8 },
  routingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceHighlight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, gap: 4, flex: 1 },
  routingText: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  latencyDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.success },
  latencyText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceHighlight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 6 },
  sourceText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  confidenceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: BorderRadius.full, gap: 3 },
  confidenceText: { fontSize: 12, fontWeight: '800', color: Colors.success },
  closeButton: { padding: 4 },

  // Motivational
  motivationContainer: { marginBottom: Spacing.lg },
  motivationGradient: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  quoteIcon: { fontSize: 36, color: Colors.primaryLight, fontWeight: '700', lineHeight: 36, marginBottom: -4 },
  motivationalLine: { fontSize: 17, fontWeight: '500', color: Colors.textPrimary, lineHeight: 26, fontStyle: 'italic' },
  futureLabel: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600', marginTop: Spacing.sm, textAlign: 'right' },

  // Steps
  stepsTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22, color: Colors.textPrimary },

  // Explanation
  explanationBox: { backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.warning, marginBottom: Spacing.lg },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  explanationTitle: { fontSize: 14, fontWeight: '700', color: Colors.warning },
  explanationText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  // ═══════════════════════════════════════════
  // FUTURE SIMULATION — The "Wow" Section
  // ═══════════════════════════════════════════
  simContainer: { marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  simHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  simSectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },

  // Tab switcher
  simTabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  simTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceHighlight, borderWidth: 1, borderColor: Colors.border },
  simTabActiveGreen: { backgroundColor: Colors.success, borderColor: Colors.success },
  simTabActiveRed: { backgroundColor: Colors.error, borderColor: Colors.error },
  simTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  simTabTextActive: { color: '#fff' },

  // Vertical timeline
  timelineContainer: { paddingLeft: 4 },
  timelineNode: { flexDirection: 'row', minHeight: 72 },
  timelineNodeLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: 4, borderRadius: 1 },
  timelineNodeContent: { flex: 1, paddingLeft: 12, paddingBottom: 12 },
  timelineLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  timelineText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },

  // Actions
  actionButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg, gap: Spacing.sm },
  actionIconButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12, backgroundColor: Colors.surfaceHighlight, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  actionIconText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  actionPrimaryBtn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionPrimaryText: { fontSize: 13, color: '#fff', fontWeight: '700' },

  // Refine
  refineContainer: { marginTop: Spacing.lg, padding: Spacing.md, backgroundColor: 'rgba(108,99,255,0.05)', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.primaryMuted },
  refineTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  refineInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: Spacing.sm, color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.md },
  refineActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  cancelRefineBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelRefineText: { color: Colors.textMuted, fontWeight: '600' },
  submitRefineBtn: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: BorderRadius.sm, minWidth: 100, alignItems: 'center' },
  submitRefineText: { color: '#fff', fontWeight: '600' },
});
