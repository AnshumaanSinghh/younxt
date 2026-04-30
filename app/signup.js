import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signUpWithEmail } from '../src/services/auth';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { Colors, Spacing, Typography } from '../src/theme';
import { isValidEmail } from '../src/utils/helpers';
import { Header } from '../src/components/Header';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUpWithEmail(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      // User is created, root layout redirect logic will take them to onboarding
      router.replace('/');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your journey with YouNxt</Text>
            
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
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="checkmark-circle-outline"
            />

            <Button 
              title="Sign Up" 
              onPress={handleSignup} 
              loading={loading}
              style={styles.signupButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: Spacing.md,
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
  signupButton: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
