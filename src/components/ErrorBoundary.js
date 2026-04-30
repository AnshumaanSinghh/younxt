/**
 * ErrorBoundary Component
 * Catches React rendering errors and shows a graceful recovery screen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service in production
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color="#6C63FF" />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Don't worry — your data is safe. This is just a temporary glitch.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Ionicons name="refresh-outline" size={20} color="#F1F5F9" />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
});
