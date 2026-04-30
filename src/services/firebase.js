/**
 * Firebase Configuration & Initialization
 * 
 * Uses environment variables via Expo's built-in env system.
 * All EXPO_PUBLIC_* env vars are accessible via process.env.
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Fill in your Firebase project credentials
 * 3. Restart the dev server
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate required config (warn in dev, don't crash)
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);
if (missingFields.length > 0) {
  console.warn(
    `[YouNxt] Missing Firebase config: ${missingFields.join(', ')}. ` +
    'Copy .env.example to .env and fill in your Firebase credentials.'
  );
}

// Initialize Firebase (prevent re-initialization on hot reload)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Auth already initialized (hot reload scenario)
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Cloud Functions
const functions = getFunctions(app);

export { app, auth, db, functions };
