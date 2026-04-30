import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import { createUserProfile } from '../src/services/firestore';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { ChipSelector } from '../src/components/ChipSelector';
import { Colors, Spacing, Typography, BorderRadius } from '../src/theme';
import { PRESET_GOALS, PRESET_HOBBIES } from '../src/utils/helpers';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goals, setGoals] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (step === 2 && goals.length === 0) {
      Alert.alert('Required', 'Please select at least one goal.');
      return;
    }
    if (step === 3 && hobbies.length === 0) {
      Alert.alert('Required', 'Please select at least one hobby.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    const profileData = {
      name: name.trim(),
      email: user.email,
      goals,
      hobbies,
      level: level.toLowerCase(),
    };

    const { error } = await createUserProfile(user.uid, profileData);
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      await refreshProfile();
      router.replace('/(tabs)');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4].map((s) => (
        <View 
          key={s} 
          style={[
            styles.stepDot, 
            s === step ? styles.stepDotActive : s < step ? styles.stepDotCompleted : null
          ]} 
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={Colors.gradientDark} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.brandText}>YouNxt</Text>
            {renderStepIndicator()}
          </View>

          <View style={styles.content}>
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={styles.subtitle}>Your future self wants to know.</Text>
                <Input
                  placeholder="Your Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={styles.inputSpacing}
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <ChipSelector
                  title="What are your main goals right now?"
                  options={PRESET_GOALS}
                  selected={goals}
                  onSelectionChange={setGoals}
                  maxSelections={5}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <ChipSelector
                  title="What do you enjoy doing?"
                  options={PRESET_HOBBIES}
                  selected={hobbies}
                  onSelectionChange={setHobbies}
                  maxSelections={5}
                />
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Where are you in your journey?</Text>
                <Text style={styles.subtitle}>Select your current experience level in personal development.</Text>
                <View style={styles.levelOptions}>
                  {LEVELS.map((lvl) => (
                    <Button
                      key={lvl}
                      title={lvl}
                      variant={level === lvl ? 'primary' : 'secondary'}
                      onPress={() => setLevel(lvl)}
                      style={styles.levelButton}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {step > 1 ? (
              <Button 
                title="Back" 
                variant="ghost" 
                onPress={handleBack} 
                style={styles.flexButton} 
              />
            ) : (
              <View style={styles.flexSpacer} />
            )}
            
            {step < 4 ? (
              <Button 
                title="Next" 
                onPress={handleNext} 
                style={styles.flexButton} 
              />
            ) : (
              <Button 
                title="Complete Setup" 
                onPress={handleComplete} 
                loading={loading}
                style={styles.flexButton} 
              />
            )}
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
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.surfaceHighlight,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    ...Typography.styles.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputSpacing: {
    marginTop: Spacing.md,
  },
  levelOptions: {
    gap: Spacing.md,
  },
  levelButton: {
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  flexButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  flexSpacer: {
    flex: 1,
  },
});
