/**
 * Utility / Helper Functions
 */

/**
 * Calculate progress percentage from logs
 * @param {Object[]} logs - Array of log entries
 * @returns {number} Percentage 0-100
 */
export const calculateProgress = (logs) => {
  if (!logs || logs.length === 0) return 0;
  const completed = logs.filter((log) => log.completed).length;
  return Math.round((completed / logs.length) * 100);
};

/**
 * Format a timestamp into a human-readable string
 * @param {Date|Object} timestamp 
 * @returns {string}
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Get emoji for a mood string
 * @param {string} mood 
 * @returns {string}
 */
export const getMoodEmoji = (mood) => {
  const emojiMap = {
    stressed: '😰',
    tired: '😴',
    happy: '😊',
    overwhelmed: '🤯',
    neutral: '😐',
  };
  return emojiMap[mood] || '😐';
};

/**
 * Get display label for a mood
 * @param {string} mood 
 * @returns {string}
 */
export const getMoodLabel = (mood) => {
  const labelMap = {
    stressed: 'Stressed',
    tired: 'Tired',
    happy: 'Happy',
    overwhelmed: 'Overwhelmed',
    neutral: 'Neutral',
  };
  return labelMap[mood] || 'Neutral';
};

/**
 * Get display label for a mode
 * @param {string} mode 
 * @returns {string}
 */
export const getModeLabel = (mode) => {
  const labelMap = {
    survival: 'Survival',
    growth: 'Growth',
    balanced: 'Balanced',
  };
  return labelMap[mode] || 'Balanced';
};

/**
 * Get icon name (Ionicons) for a mode
 * @param {string} mode 
 * @returns {string}
 */
export const getModeIcon = (mode) => {
  const iconMap = {
    survival: 'shield-outline',
    growth: 'trending-up-outline',
    balanced: 'scale-outline',
  };
  return iconMap[mode] || 'scale-outline';
};

/**
 * Truncate text to a max length
 * @param {string} text 
 * @param {number} maxLen 
 * @returns {string}
 */
export const truncateText = (text, maxLen = 80) => {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '…';
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get a greeting based on time of day
 * @param {string} name 
 * @returns {string}
 */
export const getGreeting = (name) => {
  const hour = new Date().getHours();
  let timeGreeting;
  if (hour < 4) timeGreeting = 'Good evening'; // Late night
  else if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';

  return name ? `${timeGreeting}, ${name}` : timeGreeting;
};

/**
 * Predefined goals for onboarding chips
 */
export const PRESET_GOALS = [
  'Get fit',
  'Learn coding',
  'Read more',
  'Save money',
  'Start a business',
  'Improve mental health',
  'Learn a language',
  'Build better habits',
  'Get promoted',
  'Improve relationships',
  'Travel more',
  'Be more creative',
];

/**
 * Predefined hobbies for onboarding chips
 */
export const PRESET_HOBBIES = [
  'Reading',
  'Gaming',
  'Music',
  'Cooking',
  'Photography',
  'Fitness',
  'Art & Drawing',
  'Writing',
  'Hiking',
  'Meditation',
  'Podcasts',
  'Dancing',
];
