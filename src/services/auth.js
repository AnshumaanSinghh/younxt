/**
 * Authentication Service
 * Handles email/password auth with Firebase
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Create a new account with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Subscribe to auth state changes
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Send a password reset email
 * @param {string} email 
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Maps Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'Invalid email. No account found.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};
