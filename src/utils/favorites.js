/**
 * Favorites Manager
 * AsyncStorage-based local favorites for explore quotes
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@younxt_favorites';
const LIKES_KEY = '@younxt_likes';

/**
 * Get all favorite quote IDs
 * @returns {Promise<string[]>}
 */
export const getFavorites = async () => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

/**
 * Toggle a quote as favorite
 * @param {string} quoteId
 * @returns {Promise<boolean>} new state (true = favorited)
 */
export const toggleFavorite = async (quoteId) => {
  try {
    const favorites = await getFavorites();
    const index = favorites.indexOf(quoteId);
    
    if (index > -1) {
      favorites.splice(index, 1);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(quoteId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

/**
 * Check if a quote is favorited
 * @param {string} quoteId
 * @returns {Promise<boolean>}
 */
export const isFavorite = async (quoteId) => {
  const favorites = await getFavorites();
  return favorites.includes(quoteId);
};

/**
 * Get all like counts (stored locally)
 * @returns {Promise<Object>} Map of quoteId -> like count
 */
export const getLikeCounts = async () => {
  try {
    const data = await AsyncStorage.getItem(LIKES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading likes:', error);
    return {};
  }
};

/**
 * Toggle like on a quote
 * @param {string} quoteId
 * @returns {Promise<boolean>} new state (true = liked)
 */
export const toggleLike = async (quoteId) => {
  try {
    const likes = await getLikeCounts();
    if (likes[quoteId]) {
      delete likes[quoteId];
      await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likes));
      return false;
    } else {
      likes[quoteId] = true;
      await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likes));
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};
