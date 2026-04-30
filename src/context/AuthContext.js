/**
 * Authentication Context
 * Manages auth state, user session persistence, and auth actions
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/auth';
import { getUserProfile } from '../services/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user profile from Firestore
        setProfileLoading(true);
        try {
          const { data } = await getUserProfile(firebaseUser.uid);
          setUserProfile(data);
        } catch (error) {
          console.error('Error loading profile:', error);
          setUserProfile(null);
        }
        setProfileLoading(false);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Refresh the user profile from Firestore
   * Call after onboarding or profile updates
   */
  const refreshProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { data } = await getUserProfile(user.uid);
      setUserProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
    setProfileLoading(false);
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    isAuthenticated: !!user,
    isOnboarded: !!userProfile?.onboarded,
    refreshProfile,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
