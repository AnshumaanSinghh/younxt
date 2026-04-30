/**
 * Security Utilities
 * Input sanitization, rate limiting, and data validation
 */

// ──────────────────────────────────────────────
// Input Sanitization
// ──────────────────────────────────────────────

/**
 * Strip dangerous HTML/script tags from user input
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, '')    // Remove angle brackets
    .trim();
};

/**
 * Sanitize and limit string length
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export const sanitizeAndLimit = (input, maxLength = 500) => {
  const sanitized = sanitizeInput(input);
  return sanitized.substring(0, maxLength);
};

/**
 * Validate and sanitize an array of strings (e.g., goals, hobbies)
 * @param {string[]} items
 * @param {number} maxItems
 * @param {number} maxItemLength
 * @returns {string[]}
 */
export const sanitizeStringArray = (items, maxItems = 10, maxItemLength = 100) => {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, maxItems)
    .map((item) => sanitizeAndLimit(item, maxItemLength))
    .filter((item) => item.length > 0);
};

// ──────────────────────────────────────────────
// Rate Limiting (Client-side)
// ──────────────────────────────────────────────

const rateLimitMap = new Map();

/**
 * Simple client-side rate limiter
 * @param {string} key - Unique key for the action
 * @param {number} maxCalls - Max calls allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} true if the action is allowed
 */
export const isRateLimited = (key, maxCalls = 5, windowMs = 60000) => {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { calls: [], windowMs };

  // Remove expired entries
  record.calls = record.calls.filter((timestamp) => now - timestamp < windowMs);

  if (record.calls.length >= maxCalls) {
    return true; // Rate limited
  }

  record.calls.push(now);
  rateLimitMap.set(key, record);
  return false; // Allowed
};

/**
 * Reset rate limit for a specific key
 * @param {string} key
 */
export const resetRateLimit = (key) => {
  rateLimitMap.delete(key);
};

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

/**
 * Enhanced email validation
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long.' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate user profile data before saving
 * @param {Object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateProfileData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 1) {
    errors.push('Name is required.');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Name is too long.');
  }
  if (data.goals && data.goals.length > 10) {
    errors.push('Too many goals selected.');
  }
  if (data.hobbies && data.hobbies.length > 10) {
    errors.push('Too many hobbies selected.');
  }

  return { valid: errors.length === 0, errors };
};
