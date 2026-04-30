import React, { useEffect } from 'react';
import { Stack, } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/context/AuthContext';
import { AppProvider } from '../src/context/AppContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { Colors } from '../src/theme';
import { scheduleDailyReminder } from '../src/services/notifications';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Schedule daily reminder with error handling
      scheduleDailyReminder().catch((err) => {
        console.warn('Daily reminder scheduling failed (non-critical):', err?.message);
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
