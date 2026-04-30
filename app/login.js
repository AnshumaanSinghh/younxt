import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmail } from '../src/services/auth';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { Colors, Spacing, Typography } from '../src/theme';
import { isValidEmail } from '../src/utils/helpers';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signInWithEmail(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    } else {
      // Root layout redirection handles the navigation after successful login
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={Colors.gradientDark} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.brandContainer}>
            <Text style={styles.brandYou}>You</Text>
            <Text style={styles.brandNxt}>Nxt</Text>
            <Text style={styles.tagline}>Decide your next move, powered by your future self</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.footerLink}>Sign up</Text>
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
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  brandYou: {
    ...Typography.styles.heroTitle,
    color: Colors.textPrimary,
  },
  brandNxt: {
    ...Typography.styles.heroTitle,
    color: Colors.primary,
    marginTop: -10,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(20, 25, 41, 0.6)',
    padding: Spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  welcomeText: {
    ...Typography.styles.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: Spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
