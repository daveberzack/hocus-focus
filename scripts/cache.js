/**
 * Caching strategy for application data
 */

import { CONFIG } from './config.js';

/**
 * Simple in-memory cache with expiration
 */
export class Cache {
  constructor() {
    this.data = new Map();
    this.timestamps = new Map();
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = CONFIG.CACHE.DURATION) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const expiry = this.timestamps.get(key);
    
    if (!expiry || Date.now() > expiry) {
      // Expired or not found
      this.delete(key);
      return null;
    }
    
    return this.data.get(key);
  }
  
  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }
  
  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  }
  
  /**
   * Clear all cached data
   */
  clear() {
    this.data.clear();
    this.timestamps.clear();
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, expiry] of this.timestamps) {
      if (now > expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }
    
    return {
      totalEntries: this.data.size,
      validEntries,
      expiredEntries,
      hitRate: this._hitRate || 0
    };
  }
}

/**
 * Challenge-specific cache with specialized methods
 */
export class ChallengeCache extends Cache {
  constructor() {
    super();
    this._hitCount = 0;
    this._missCount = 0;
  }
  
  /**
   * Calculate cache hit rate
   * @returns {number} Hit rate as percentage
   */
  get hitRate() {
    const total = this._hitCount + this._missCount;
    return total > 0 ? (this._hitCount / total) * 100 : 0;
  }
  
  /**
   * Reset hit/miss counters
   */
  resetStats() {
    this._hitCount = 0;
    this._missCount = 0;
  }
}

// Global cache instance
export const globalCache = new ChallengeCache();