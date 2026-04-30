/**
 * ModeToggle Component
 * Pill-style toggle for Survival / Growth / Balanced modes
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const MODES = [
  { key: 'survival', label: 'Survival', icon: 'shield-outline', color: Colors.modeSurvival },
  { key: 'growth', label: 'Growth', icon: 'trending-up-outline', color: Colors.modeGrowth },
  { key: 'balanced', label: 'Balanced', icon: 'scale-outline', color: Colors.modeBalanced },
];

export const ModeToggle = ({ selectedMode, onModeSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your mode</Text>
      <View style={styles.toggleRow}>
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.key;
          return (
            <TouchableOpacity
              key={mode.key}
              onPress={() => onModeSelect(mode.key)}
              activeOpacity={0.7}
              style={[
                styles.pill,
                isSelected && {
                  backgroundColor: mode.color + '20',
                  borderColor: mode.color,
                },
              ]}
            >
              <Ionicons
                name={mode.icon}
                size={18}
                color={isSelected ? mode.color : Colors.textMuted}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected && { color: mode.color, fontWeight: '700' },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
