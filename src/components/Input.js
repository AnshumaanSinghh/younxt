/**
 * Input Component
 * Styled text input with floating label, error state, and icons
 */
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  multiline = false,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.primary
    : Colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor }, multiline && styles.multiline]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? Colors.primary : Colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftIcon && styles.inputWithIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  multiline: {
    alignItems: 'flex-start',
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  eyeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
});
