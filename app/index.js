import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/theme';

export default function EntryRedirect() {
  const { isAuthenticated, isOnboarded, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!isAuthenticated) {
        // Not logged in -> Login screen
        router.replace('/login');
      } else if (!isOnboarded) {
        // Logged in but not onboarded -> Onboarding
        router.replace('/onboarding');
      } else {
        // Logged in and onboarded -> Home tabs
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isOnboarded, loading, profileLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
