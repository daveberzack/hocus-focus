/**
 * Application configuration and constants
 */

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * @typedef {Object} AppConfig
 * @property {string} API_BASE_URL - Base URL for API requests
 * @property {number} DB_VERSION - IndexedDB version
 * @property {string} DB_NAME - IndexedDB database name
 * @property {Object} TUTORIALS - Tutorial challenge IDs
 * @property {Object} CACHE - Cache configuration
 * @property {Object} NETWORK - Network request configuration
 */
export const CONFIG = {
  // API Configuration
  API_BASE_URL: isDevelopment
    ? 'http://localhost:5000'
    : 'https://hocus-focus-api.onrender.com',
  
  // Database Configuration
  DB_VERSION: 1,
  DB_NAME: 'data',
  DB_STORE_NAME: 'results',
  
  // Tutorial Challenge IDs
  TUTORIALS: {
    TUTORIAL_0: '63962b126b3ee2ea3c813c88',
    TUTORIAL_0_MOBILE: '63963563978afa2b41fc67e5',
    TUTORIAL_1: '639635b56b3ee2ea3c813c9b',
    TUTORIAL_2: '639636146b3ee2ea3c813caa'
  },
  
  // Cache Configuration
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
  
  // Network Configuration
  NETWORK: {
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
    TIMEOUT: 10000 // 10 seconds
  },
  
  // Game Configuration
  GAME: {
    MAX_STARS: 5,
    PENALTY_TIME: 10 // seconds
  },
  
  // Development flags
  IS_DEVELOPMENT: isDevelopment
};

/**
 * API endpoints
 */
export const ENDPOINTS = {
  
  // Local file endpoints
  LOCAL_CHALLENGES: './data/challenges.json',
  TUTORIAL_CHALLENGES: './data/tutorials.json'
};