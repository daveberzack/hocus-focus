/**
 * Input validation utilities
 */

import { ValidationError } from './errors.js';
import { CONFIG } from './config.js';

/**
 * Validate challenge date
 * @param {any} challengeDate - Challenge date to validate
 * @throws {ValidationError} If validation fails
 */
export const validateChallengeDate = (challengeDate) => {
  if (!challengeDate || typeof challengeDate !== 'string') {
    throw new ValidationError('Challenge date must be a string', 'challengeDate', challengeDate);
  }
  //Date could be a placeholder for tutorials, etc, so not validating format
};

/**
 * Validate time passed
 * @param {any} timePassed - Time passed to validate
 * @throws {ValidationError} If validation fails
 */
export const validateTimePassed = (timePassed) => {
  if (typeof timePassed !== 'number' || timePassed < 0 || !isFinite(timePassed)) {
    throw new ValidationError('Time passed must be a non-negative finite number', 'timePassed', timePassed);
  }
};

/**
 * Validate mistakes count
 * @param {any} mistakes - Mistakes count to validate
 * @throws {ValidationError} If validation fails
 */
export const validateMistakes = (mistakes) => {
  if (typeof mistakes !== 'number' || mistakes < 0 || !Number.isInteger(mistakes)) {
    throw new ValidationError('Mistakes must be a non-negative integer', 'mistakes', mistakes);
  }
};

/**
 * Validate stars count
 * @param {any} stars - Stars count to validate
 * @throws {ValidationError} If validation fails
 */
export const validateStars = (stars) => {
  if (typeof stars !== 'number' || stars < 0 || stars > CONFIG.GAME.MAX_STARS || !Number.isInteger(stars)) {
    throw new ValidationError(
      `Stars must be an integer between 0 and ${CONFIG.GAME.MAX_STARS}`, 
      'stars', 
      stars
    );
  }
};

/**
 * Validate game result object
 * @param {Object} result - Game result to validate
 * @throws {ValidationError} If validation fails
 */
export const validateGameResult = (result) => {
  if (!result || typeof result !== 'object') {
    throw new ValidationError('Game result must be an object', 'result', result);
  }
  
  validateChallengeDate(result.challengeDate || result.date);
  validateTimePassed(result.timePassed);
  validateMistakes(result.mistakes);
  validateStars(result.stars);
};

/**
 * Validate URL parameter
 * @param {any} param - URL parameter to validate
 * @param {string} paramName - Parameter name for error messages
 * @throws {ValidationError} If validation fails
 */
export const validateUrlParameter = (param, paramName) => {
  if (param !== null && param !== undefined && typeof param !== 'string') {
    throw new ValidationError(`${paramName} must be a string or null`, paramName, param);
  }
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
};
