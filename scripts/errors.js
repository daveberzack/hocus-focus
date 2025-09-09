/**
 * Custom error classes for the application
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error thrown when a challenge cannot be found
 */
export class ChallengeNotFoundError extends AppError {
  constructor(message = 'Challenge not found', challengeId = null) {
    super(message, 'CHALLENGE_NOT_FOUND');
    this.challengeId = challengeId;
  }
}

/**
 * Error thrown when network requests fail
 */
export class NetworkError extends AppError {
  constructor(message = 'Network request failed', url = null, status = null) {
    super(message, 'NETWORK_ERROR');
    this.url = url;
    this.status = status;
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', operation = null) {
    super(message, 'DATABASE_ERROR');
    this.operation = operation;
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', field = null, value = null) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

/**
 * Creates a user-friendly error object for display
 * @param {Error} error - The original error
 * @param {string} context - Context where the error occurred
 * @returns {Object} User-friendly error object
 */
export const createUserFriendlyError = (error, context = 'Unknown') => {
  const isDevelopment = window.location.hostname === 'localhost';
  
  const friendlyMessages = {
    'CHALLENGE_NOT_FOUND': 'Puzzle not available',
    'NETWORK_ERROR': 'Connection problem - please try again',
    'DATABASE_ERROR': 'Storage error - your progress may not be saved',
    'VALIDATION_ERROR': 'Invalid data provided'
  };
  
  const message = isDevelopment 
    ? `[${context}] ${error.message}` 
    : friendlyMessages[error.code] || 'Something went wrong - please try again';
    
  return {
    _id: 'error',
    clue: `[${message}]`,
    context,
    originalError: isDevelopment ? error : null
  };
};