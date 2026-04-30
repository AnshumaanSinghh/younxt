/**
 * Firestore Database Service
 * CRUD operations for user profiles and logs
 * Includes cursor-based pagination for scalability and Auto-Cleanup
 */
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs,
  query, orderBy, limit, startAfter, where,
  serverTimestamp, writeBatch, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ──────────────────────────────────────────────
// User Profile Operations
// ──────────────────────────────────────────────

export const createUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...data,
      onboarded: true,
      createdAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { data: { id: userSnap.id, ...userSnap.data() }, error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    return { error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error: error.message };
  }
};

// ──────────────────────────────────────────────
// Log / Session Operations
// ──────────────────────────────────────────────

export const addLog = async (uid, logData) => {
  try {
    const logsRef = collection(db, 'users', uid, 'logs');
    const docRef = await addDoc(logsRef, {
      ...logData,
      completed: false,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error adding log:', error);
    return { id: null, error: error.message };
  }
};

export const getLogsPaginated = async (uid, pageSize = 20, lastDoc = null) => {
  try {
    const logsRef = collection(db, 'users', uid, 'logs');
    let q;

    if (lastDoc) {
      q = query(logsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(logsRef, orderBy('createdAt', 'desc'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));

    const newLastDoc = snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

    return {
      data: logs,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === pageSize,
      error: null,
    };
  } catch (error) {
    console.error('Error getting paginated logs:', error);
    return { data: [], lastDoc: null, hasMore: false, error: error.message };
  }
};

export const getLogs = async (uid, maxCount = 50) => {
  try {
    const logsRef = collection(db, 'users', uid, 'logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
    return { data: logs, error: null };
  } catch (error) {
    console.error('Error getting logs:', error);
    return { data: [], error: error.message };
  }
};

export const markLogCompleted = async (uid, logId) => {
  try {
    const logRef = doc(db, 'users', uid, 'logs', logId);
    await updateDoc(logRef, { completed: true });
    return { error: null };
  } catch (error) {
    console.error('Error marking log completed:', error);
    return { error: error.message };
  }
};

// ──────────────────────────────────────────────
// Auto-Cleanup Operations
// ──────────────────────────────────────────────

/**
 * Smart Cleanup — preserves prediction data, purges stale raw logs
 * 
 * Rules:
 * - Logs with simulation data are NEVER deleted (needed for predicted-vs-actual reconciliation)
 * - Logs without simulation data older than 90 days are purged
 * - This ensures the database stays lean while preserving your USP data
 * 
 * @param {string} uid User ID
 */
export const cleanupOldLogs = async (uid) => {
  try {
    const logsRef = collection(db, 'users', uid, 'logs');
    
    // 90 days instead of 21 — gives time for 7/30/90 day reconciliation
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const cutoffTimestamp = Timestamp.fromDate(ninetyDaysAgo);

    // Query for old logs
    const q = query(logsRef, where('createdAt', '<', cutoffTimestamp));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { count: 0, error: null };
    }

    // Only delete logs that do NOT have simulation/prediction data
    const batch = writeBatch(db);
    let deleteCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Preserve logs that contain simulation predictions
      const hasSimulation = data.simulation || data.confidenceScore;
      if (!hasSimulation) {
        batch.delete(docSnap.ref);
        deleteCount++;
      }
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deleteCount} stale logs (preserved ${snapshot.size - deleteCount} prediction logs).`);
    }
    
    return { count: deleteCount, error: null };
  } catch (error) {
    console.error('Error during auto-cleanup:', error);
    return { count: 0, error: error.message };
  }
};
