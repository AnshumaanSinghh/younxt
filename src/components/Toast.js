import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

export const Toast = forwardRef((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const opacity = React.useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success') => {
      setMessage(msg);
      setType(toastType);
      
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
  }));

  if (!message) return null;

  const getIcon = () => {
    switch(type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'success': return Colors.primary;
      case 'error': return Colors.error;
      case 'info': return Colors.accent;
      default: return Colors.primary;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        <Ionicons name={getIcon()} size={20} color={getIconColor()} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 41, 0.95)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
