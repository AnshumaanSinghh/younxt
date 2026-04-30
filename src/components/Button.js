/**
 * Button Component
 * Variants: primary (gradient), secondary, outline, ghost
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 20 },
    md: { paddingVertical: 14, paddingHorizontal: 28 },
    lg: { paddingVertical: 18, paddingHorizontal: 36 },
  };

  const textSizeStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[{ opacity: isDisabled ? 0.5 : 1 }, style]}
      >
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles[size], styles.primaryButton]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <View style={styles.contentRow}>
              {icon}
              <Text style={[styles.buttonText, styles.primaryText, textSizeStyles[size], textStyle]}>
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      button: { backgroundColor: Colors.surfaceLight },
      text: { color: Colors.textPrimary },
    },
    outline: {
      button: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
      text: { color: Colors.primary },
    },
    ghost: {
      button: { backgroundColor: 'transparent' },
      text: { color: Colors.primary },
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        sizeStyles[size],
        currentVariant.button,
        { opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.text.color} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text style={[styles.buttonText, currentVariant.text, textSizeStyles[size], textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: Colors.textPrimary,
  },
});
