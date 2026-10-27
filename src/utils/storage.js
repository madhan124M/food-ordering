/**
 * Safe LocalStorage Utilities for GoodBite Food App
 * Handles serialization, parsing, error resilience, and key namespaces.
 */

export const STORAGE_KEYS = {
  TOKEN: 'token',
  AUTH_TOKEN: 'authToken',
  CART: 'goodbite_cart',
  FOODS: 'goodbite_custom_foods',
  USER: 'goodbite_user'
};

/**
 * Generates a realistic mock JWT token for the user session
 * Header.Payload.Signature format
 */
export function generateJwtToken(user = { email: 'user@goodbite.com', name: 'Foodie' }) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: 'usr_' + Math.floor(100000 + Math.random() * 900000),
      email: user.email || 'user@goodbite.com',
      name: user.name || 'Foodie',
      role: 'customer',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days validity
    })
  );
  const signature = 'sig_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${header}.${payload}.${signature}`;
}

/**
 * Saves auth token to localStorage under 'token' and 'authToken'
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('authToken', token);
    console.log('%c[Auth] Token successfully stored in localStorage:', 'color: #16a34a; font-weight: bold;', {
      key: 'token',
      token: token
    });
  } catch (err) {
    console.warn('[LocalStorage] Failed to save token:', err);
  }
}

/**
 * Gets auth token from localStorage
 */
export function getAuthToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return window.localStorage.getItem('token') || window.localStorage.getItem('authToken') || null;
  } catch {
    return null;
  }
}

/**
 * Removes auth token from localStorage
 */
export function removeAuthToken() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('authToken');
    console.log('%c[Auth] Token removed from localStorage', 'color: #dc2626;');
  } catch (err) {
    console.warn('[LocalStorage] Failed to remove token:', err);
  }
}

/**
 * Safely get an item from localStorage
 * @param {string} key - Storage key
 * @param {any} fallback - Fallback value if item doesn't exist or parsing fails
 */
export function getStorageItem(key, fallback = null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallback;
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`[LocalStorage] Error reading key "${key}":`, error);
    return fallback;
  }
}

/**
 * Safely save an item to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to serialize and store
 */
export function setStorageItem(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[LocalStorage] Error setting key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param {string} key - Storage key
 */
export function removeStorageItem(key) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[LocalStorage] Error removing key "${key}":`, error);
    return false;
  }
}
