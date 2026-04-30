/**
 * ChipSelector Component
 * Multi-select chips for onboarding (goals, hobbies)
 * Supports preset options + custom input
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

export const ChipSelector = ({
  title,
  options,
  selected = [],
  onSelectionChange,
  allowCustom = true,
  maxSelections = 5,
}) => {
  const [customValue, setCustomValue] = useState('');

  const toggleChip = (value) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((item) => item !== value));
    } else if (selected.length < maxSelections) {
      onSelectionChange([...selected, value]);
    }
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (trimmed && !selected.includes(trimmed) && selected.length < maxSelections) {
      onSelectionChange([...selected, trimmed]);
      setCustomValue('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.counter}>
          {selected.length}/{maxSelections}
        </Text>
      </View>

      <View style={styles.chipGrid}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              onPress={() => toggleChip(option)}
              activeOpacity={0.7}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {allowCustom && (
        <View style={styles.customRow}>
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            placeholder="Add your own..."
            placeholderTextColor={Colors.textMuted}
            style={styles.customInput}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={addCustom}
            disabled={!customValue.trim()}
            style={[styles.addButton, !customValue.trim() && { opacity: 0.3 }]}
          >
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Show custom selections */}
      {selected.filter((s) => !options.includes(s)).length > 0 && (
        <View style={styles.customChips}>
          {selected
            .filter((s) => !options.includes(s))
            .map((custom) => (
              <TouchableOpacity
                key={custom}
                onPress={() => toggleChip(custom)}
                style={[styles.chip, styles.chipSelected, styles.customChip]}
              >
                <Text style={styles.chipTextSelected}>{custom}</Text>
                <Ionicons name="close-circle" size={16} color={Colors.primary} />
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  customChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  customChip: {
    borderStyle: 'dashed',
  },
});
