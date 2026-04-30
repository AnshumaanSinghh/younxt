/**
 * Card Component
 * Glass-morphism style card with optional gradient border
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

export const Card = ({ children, style, variant = 'default', glow = false }) => {
  const variantStyles = {
    default: {
      backgroundColor: Colors.surface,
      borderColor: Colors.border,
    },
    elevated: {
      backgroundColor: Colors.surfaceLight,
      borderColor: Colors.borderLight,
    },
    accent: {
      backgroundColor: Colors.primaryMuted,
      borderColor: Colors.primary,
    },
    success: {
      backgroundColor: Colors.successMuted,
      borderColor: Colors.success,
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <View
      style={[
        styles.card,
        currentStyle,
        glow && Shadows.glow(Colors.primary),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.small,
  },
});
