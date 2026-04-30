import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordReset } from '../src/services/auth';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { Colors, Spacing, Typography } from '../src/theme';
import { isValidEmail } from '../src/utils/helpers';
import { Header } from '../src/components/Header';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleReset = async () => {
    setError(null);
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error: resetError } = await sendPasswordReset(email);
    setLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      if (Platform.OS === 'web') {
        window.alert("If an account with that email exists, we've sent you instructions to reset your password.");
        router.back();
      } else {
        Alert.alert(
          "Email Sent",
          "If an account with that email exists, we've sent you instructions to reset your password.",
          [{ text: "Back to Login", onPress: () => router.back() }]
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={Colors.gradientDark} style={styles.container}>
        <Header showBack={true} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
            
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon="mail-outline"
            />

            <Button 
              title="Send Reset Link" 
              onPress={handleReset} 
              loading={loading}
              style={styles.resetButton}
            />
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  formContainer: {
    backgroundColor: 'rgba(20, 25, 41, 0.6)',
    padding: Spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {
    ...Typography.styles.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  resetButton: {
    marginTop: Spacing.lg,
  },
  errorBox: {
    backgroundColor: Colors.errorMuted,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
