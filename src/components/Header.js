/**
 * Header Component
 * Reusable screen header with optional back button and branding
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../theme';

export const Header = ({ title, showBack = false, rightContent = null }) => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <View style={styles.brandContainer}>
              <Text style={styles.brandYou}>You</Text>
              <Text style={styles.brandNxt}>Nxt</Text>
            </View>
          )}
        </View>
        <View style={styles.right}>
          {rightContent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 60,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    paddingRight: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandYou: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandNxt: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
