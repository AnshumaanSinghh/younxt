/**
 * App Context
 * Manages app-wide state: logs, progress, suggestions, pagination, auto-cleanup
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  getLogs,
  getLogsPaginated,
  addLog as addLogToFirestore,
  markLogCompleted as markLogInFirestore,
  cleanupOldLogs,
} from '../services/firestore';
import { calculateProgress } from '../utils/helpers';
import { 
  generateSuggestion as apiGenerateSuggestion,
  refineSuggestion as apiRefineSuggestion,
  generateNewDirection as apiGenerateNewDirection
} from '../services/api';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ──────────────────────────────────────────────
// State & Reducer
// ──────────────────────────────────────────────
const initialState = {
  logs: [],
  logsLoading: false,
  progress: 0,
  currentSuggestion: null,
  suggestionLoading: false,
  // Pagination state
  lastDoc: null,
  hasMoreLogs: true,
  loadingMore: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOGS_LOADING':
      return { ...state, logsLoading: true };
    case 'SET_LOGS':
      return {
        ...state,
        logs: action.payload.logs,
        logsLoading: false,
        progress: calculateProgress(action.payload.logs),
        lastDoc: action.payload.lastDoc || null,
        hasMoreLogs: action.payload.hasMore !== undefined ? action.payload.hasMore : true,
      };
    case 'APPEND_LOGS':
      const allLogs = [...state.logs, ...action.payload.logs];
      return {
        ...state,
        logs: allLogs,
        loadingMore: false,
        progress: calculateProgress(allLogs),
        lastDoc: action.payload.lastDoc || state.lastDoc,
        hasMoreLogs: action.payload.hasMore !== undefined ? action.payload.hasMore : false,
      };
    case 'SET_LOADING_MORE':
      return { ...state, loadingMore: true };
    case 'ADD_LOG':
      const newLogs = [action.payload, ...state.logs];
      return {
        ...state,
        logs: newLogs,
        progress: calculateProgress(newLogs),
      };
    case 'MARK_COMPLETED':
      const updatedLogs = state.logs.map((log) =>
        log.id === action.payload ? { ...log, completed: true } : log
      );
      return {
        ...state,
        logs: updatedLogs,
        progress: calculateProgress(updatedLogs),
      };
    case 'SET_CURRENT_SUGGESTION':
      return { ...state, currentSuggestion: action.payload };
    case 'SET_SUGGESTION_LOADING':
      return { ...state, suggestionLoading: action.payload };
    case 'CLEAR_SUGGESTION':
      return { ...state, currentSuggestion: null };
    default:
      return state;
  }
};

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Load initial logs for a user from Firestore
   * Trigger 21-day auto-cleanup in the background
   */
  const loadLogs = useCallback(async (uid) => {
    dispatch({ type: 'SET_LOGS_LOADING' });
    
    // Fire and forget auto-cleanup (don't await it so we don't block loading)
    cleanupOldLogs(uid).catch((err) => console.warn('Cleanup failed:', err));

    try {
      const { data, lastDoc, hasMore } = await getLogsPaginated(uid, 20);
      dispatch({ type: 'SET_LOGS', payload: { logs: data, lastDoc, hasMore } });
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Fallback to legacy method
      const { data } = await getLogs(uid);
      dispatch({ type: 'SET_LOGS', payload: { logs: data, hasMore: false } });
    }
  }, []);

  /**
   * Load more logs (pagination)
   */
  const loadMoreLogs = useCallback(async (uid) => {
    if (!state.hasMoreLogs || state.loadingMore) return;

    dispatch({ type: 'SET_LOADING_MORE' });
    try {
      const { data, lastDoc, hasMore } = await getLogsPaginated(uid, 20, state.lastDoc);
      dispatch({ type: 'APPEND_LOGS', payload: { logs: data, lastDoc, hasMore } });
    } catch (error) {
      console.error('Failed to load more logs:', error);
      dispatch({ type: 'APPEND_LOGS', payload: { logs: [], hasMore: false } });
    }
  }, [state.hasMoreLogs, state.loadingMore, state.lastDoc]);

  /**
   * Save a new suggestion log to Firestore and local state (optimistic)
   */
  const saveSuggestionLog = useCallback(async (uid, logData) => {
    // Optimistic update — add to local state immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticLog = {
      id: tempId,
      ...logData,
      completed: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_LOG', payload: optimisticLog });

    // Persist to Firestore
    const { id, error } = await addLogToFirestore(uid, logData);
    if (!error && id) {
      // Replace temp ID with real ID
      dispatch({
        type: 'SET_LOGS',
        payload: {
          logs: [
            { ...optimisticLog, id },
            ...state.logs.filter((l) => l.id !== tempId),
          ],
          hasMore: state.hasMoreLogs,
          lastDoc: state.lastDoc,
        },
      });
      return { id, error: null };
    }
    return { id: null, error };
  }, [state.logs, state.hasMoreLogs, state.lastDoc]);

  /**
   * Mark a log as completed (optimistic update)
   */
  const markCompleted = useCallback(async (uid, logId) => {
    // Optimistic update
    dispatch({ type: 'MARK_COMPLETED', payload: logId });

    const { error } = await markLogInFirestore(uid, logId);
    if (error) {
      // Revert on failure — reload logs
      console.error('Failed to mark completed, reverting:', error);
      await loadLogs(uid);
    }
    return { error };
  }, [loadLogs]);

  /**
   * Set the current suggestion (from AI or fallback)
   */
  const setCurrentSuggestion = useCallback((suggestion) => {
    dispatch({ type: 'SET_CURRENT_SUGGESTION', payload: suggestion });
  }, []);

  /**
   * Refine the current suggestion (Deep Dive)
   */
  const refineCurrentSuggestion = useCallback(async (mood, mode, strategy, simulationMode, goals, hobbies, level, recentLogs, userFeedback) => {
    if (!state.currentSuggestion) return;
    
    dispatch({ type: 'SET_SUGGESTION_LOADING', payload: true });
    try {
      const refinedData = await apiRefineSuggestion({
        mood, mode, strategy, simulationMode, goals, hobbies, level, recentLogs,
        previousContext: state.currentSuggestion.motivationalLine,
        userFeedback
      });
      dispatch({ type: 'SET_CURRENT_SUGGESTION', payload: refinedData });
    } catch (error) {
      console.error('Refinement failed:', error);
      throw error; // Let the component handle showing an error toast/alert
    } finally {
      dispatch({ type: 'SET_SUGGESTION_LOADING', payload: false });
    }
  }, [state.currentSuggestion]);

  /**
   * Try Something New
   */
  const trySomethingNew = useCallback(async (goals, hobbies, level, simulationMode, recentLogs) => {
    dispatch({ type: 'SET_SUGGESTION_LOADING', payload: true });
    try {
      const result = await apiGenerateNewDirection({ goals, hobbies, level, simulationMode, recentLogs });
      dispatch({ type: 'SET_CURRENT_SUGGESTION', payload: result });
    } catch (error) {
      console.error('Try Something New failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUGGESTION_LOADING', payload: false });
    }
  }, []);

  /**
   * Generate Suggestion
   */
  const generateSuggestion = useCallback(async (mood, mode, strategy, simulationMode, goals, hobbies, level, recentLogs) => {
    dispatch({ type: 'SET_SUGGESTION_LOADING', payload: true });
    try {
      const suggestion = await apiGenerateSuggestion({
        mood, mode, strategy, simulationMode, goals, hobbies, level, recentLogs
      });
      dispatch({ type: 'SET_CURRENT_SUGGESTION', payload: suggestion });
    } catch (error) {
      console.error('Generate Suggestion failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUGGESTION_LOADING', payload: false });
    }
  }, []);

  /**
   * Set suggestion loading state
   */
  const setSuggestionLoading = useCallback((loading) => {
    dispatch({ type: 'SET_SUGGESTION_LOADING', payload: loading });
  }, []);

  /**
   * Clear the current suggestion
   */
  const clearSuggestion = useCallback(() => {
    dispatch({ type: 'CLEAR_SUGGESTION' });
  }, []);

  const value = {
    ...state,
    loadLogs,
    loadMoreLogs,
    saveSuggestionLog,
    markCompleted,
    setCurrentSuggestion,
    refineCurrentSuggestion,
    generateSuggestion,
    trySomethingNew,
    setSuggestionLoading,
    clearSuggestion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
