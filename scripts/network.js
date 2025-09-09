/**
 * Network utility functions with retry logic and error handling
 */

import { CONFIG } from './config.js';
import { NetworkError } from './errors.js';

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and exponential backoff
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Response>} Fetch response
 * @throws {NetworkError} When all retries are exhausted
 */
const _fetchWithRetry = async (url, options = {}, maxRetries = CONFIG.NETWORK.MAX_RETRIES) => {
  let lastError;
  
  // Add timeout to options
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.NETWORK.TIMEOUT);
  
  const fetchOptions = {
    ...options,
    signal: controller.signal
  };
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          url,
          response.status
        );
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      clearTimeout(timeoutId);
      
      // Don't retry on certain errors
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout', url);
      }
      
      if (error instanceof NetworkError && error.status >= 400 && error.status < 500) {
        // Client errors (4xx) shouldn't be retried
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error instanceof NetworkError 
          ? error 
          : new NetworkError(`Network request failed: ${error.message}`, url);
      }
      
      // Wait before retrying with exponential backoff
      const delay = CONFIG.NETWORK.RETRY_DELAY_BASE * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Fetch JSON with retry logic
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 * @throws {NetworkError} When request fails or JSON parsing fails
 */
const _fetchJSON = async (url, options = {}) => {
  try {
    const response = await _fetchWithRetry(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(`Failed to parse JSON response: ${error.message}`, url);
  }
};

/**
 * GET JSON data with retry logic
 * @param {string} url - URL to get from
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export const getJSON = async (url, options = {}) => {
  return _fetchJSON(url, {
    method: 'GET',
    mode: 'cors',
    ...options
  });
};