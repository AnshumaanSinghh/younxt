/**
 * LogCard Component
 * Displays a past session/suggestion in the history screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { getMoodEmoji, getModeLabel, getModeIcon, formatTimestamp } from '../utils/helpers';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const LogCard = ({ log, onMarkComplete }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const modeColor = 
    log.mode === 'survival' ? Colors.modeSurvival : 
    log.mode === 'growth' ? Colors.modeGrowth : Colors.modeBalanced;

  return (
    <View style={[styles.card, log.completed && styles.cardCompleted]}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={toggleExpand}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{getMoodEmoji(log.mood)}</Text>
          <View>
            <View style={styles.modeBadge}>
              <Ionicons name={getModeIcon(log.mode)} size={12} color={modeColor} />
              <Text style={[styles.modeText, { color: modeColor }]}>{getModeLabel(log.mode)}</Text>
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(log.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {log.completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          ) : (
            <Ionicons 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={Colors.textMuted} 
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Motivational Preview (always visible unless expanded) */}
      {!expanded && (
        <Text style={styles.previewText} numberOfLines={2}>
          "{log.motivationalLine}"
        </Text>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{log.motivationalLine}"</Text>
          </View>
          
          <Text style={styles.stepsTitle}>Steps given:</Text>
          {log.actionSteps?.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <Text style={styles.stepDot}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {!log.completed && onMarkComplete && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => {
                onMarkComplete(log.id);
                // Keep expanded to show the success state briefly if needed, 
                // or let the parent re-render handle it
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.small,
  },
  cardCompleted: {
    borderColor: Colors.successMuted,
    backgroundColor: Colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 32,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  headerRight: {
    justifyContent: 'center',
  },
  completedBadge: {
    backgroundColor: Colors.successMuted,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  previewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  expandedContent: {
    marginTop: Spacing.sm,
  },
  quoteBox: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primaryMuted,
    marginBottom: Spacing.md,
  },
  quoteText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
    paddingRight: Spacing.md,
  },
  stepDot: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: -2,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 8,
  },
  completeButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
