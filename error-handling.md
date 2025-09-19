# Error Handling Documentation

## Overview

The Hocus Focus application implements a comprehensive error handling strategy designed to provide graceful degradation, user-friendly error messages, and robust debugging capabilities. The system uses custom error classes, centralized error processing, and environment-aware error reporting.

## Goals

The error handling system aims to:

1. **Graceful Degradation** - Keep the application functional even when errors occur
2. **User-Friendly Experience** - Show meaningful messages to users instead of technical errors
3. **Developer Support** - Provide detailed error information in development environments
4. **Error Classification** - Categorize errors for appropriate handling and logging
5. **Context Preservation** - Maintain information about where and why errors occurred

## Architecture

### Custom Error Classes

The application defines specialized error classes that extend the base [`AppError`](scripts/errors.js:8) class:

#### Base Error Class ([`AppError`](scripts/errors.js:8))

Provides common functionality for all application errors:

- **Error Code**: Standardized [`code`](scripts/errors.js:12) property for error categorization
- **Timestamp**: Automatic [`timestamp`](scripts/errors.js:13) for when the error occurred
- **Proper Naming**: Sets [`name`](scripts/errors.js:11) to the constructor name for debugging

#### Specialized Error Types

**1. Challenge Not Found Error** ([`ChallengeNotFoundError`](scripts/errors.js:20))
- **Purpose**: When requested challenges cannot be located
- **Code**: `CHALLENGE_NOT_FOUND`
- **Additional Data**: [`challengeId`](scripts/errors.js:23) for tracking which challenge failed
- **Usage**: Challenge loading, URL parameter validation

**2. Network Error** ([`NetworkError`](scripts/errors.js:30))
- **Purpose**: HTTP request failures, connectivity issues
- **Code**: `NETWORK_ERROR`
- **Additional Data**: 
  - [`url`](scripts/errors.js:33) - The failed request URL
  - [`status`](scripts/errors.js:34) - HTTP status code if available
- **Usage**: API calls, file loading

**3. Database Error** ([`DatabaseError`](scripts/errors.js:41))
- **Purpose**: IndexedDB operations, local storage failures
- **Code**: `DATABASE_ERROR`
- **Additional Data**: [`operation`](scripts/errors.js:44) - Which database operation failed
- **Usage**: Game result saving, data retrieval

**4. Validation Error** ([`ValidationError`](scripts/errors.js:51))
- **Purpose**: Input validation failures, data format issues
- **Code**: `VALIDATION_ERROR`
- **Additional Data**:
  - [`field`](scripts/errors.js:54) - Which field failed validation
  - [`value`](scripts/errors.js:55) - The invalid value
- **Usage**: URL parameters, game result validation

## Error Processing Strategy

### User-Friendly Error Creation

The [`createUserFriendlyError`](scripts/errors.js:65) function transforms technical errors into user-appropriate messages:

#### Environment-Aware Messaging

**Development Mode** ([`isDevelopment`](scripts/errors.js:66)):
- Shows detailed technical error messages
- Includes context information: `[${context}] ${error.message}`
- Preserves original error object for debugging

**Production Mode**:
- Shows simplified, user-friendly messages
- Maps error codes to friendly descriptions via [`friendlyMessages`](scripts/errors.js:68)
- Hides technical details from end users

#### Message Mapping

The system maps error codes to user-friendly messages:

```javascript
const friendlyMessages = {
  'CHALLENGE_NOT_FOUND': 'Puzzle not available',
  'NETWORK_ERROR': 'Connection problem - please try again', 
  'DATABASE_ERROR': 'Storage error - your progress may not be saved',
  'VALIDATION_ERROR': 'Invalid data provided'
}
```

#### Error Object Structure

User-friendly errors are formatted as challenge-like objects:

- **`_id`**: Set to `'error'` for identification
- **`clue`**: Contains the user-friendly message in brackets
- **`context`**: Preserves where the error occurred
- **`originalError`**: Full error details (development only)

## Error Handling Patterns

### Try-Catch with Graceful Fallbacks

**Challenge Loading** ([`getNextChallenge`](scripts/data.js:308)):
```javascript
try {
  // Attempt to load challenge
  challenge = await handleSpecifiedLocalChallenge();
  if (!challenge) challenge = await handleSpecifiedDatabaseChallenge();
  // ... more fallback attempts
} catch (error) {
  return createUserFriendlyError(error, 'Challenge Loading');
}
```

**Database Operations** ([`saveGameResult`](scripts/data.js:345)):
```javascript
try {
  validateGameResult(newResult);
  await (await dbPromise).put(CONFIG.DB_STORE_NAME, newResult);
} catch (error) {
  throw new DatabaseError(`Failed to save game result: ${error.message}`, 'saveGameResult');
}
```

### Silent Failure for Non-Critical Operations

**Analytics** ([`logPageView`](scripts/data.js:454)):
```javascript
try {
  sendAnalytics("pageview", analyticsData);
} catch (error) {
  // Silently fail for analytics - don't break the app
}
```

**Data Retrieval with Fallbacks** ([`getGameResults`](scripts/data.js:433)):
```javascript
try {
  let results = await db.getAll(CONFIG.DB_STORE_NAME);
  if (!results || results.length === 0) {
    results = cachedResults; // Fallback to cache
  }
  return results;
} catch (error) {
  return cachedResults; // Final fallback
}
```

## Error Context and Debugging

### Context Preservation

Errors maintain context about where they occurred:

- **Function Names**: Passed as context to [`createUserFriendlyError`](scripts/errors.js:65)
- **Operation Types**: Stored in error objects (e.g., database operations)
- **Request Details**: URLs, parameters, and status codes for network errors

### Development vs Production Behavior

**Development Environment**:
- Full error messages with technical details
- Stack traces and original error objects preserved
- Context information prominently displayed
- Console logging for debugging

**Production Environment**:
- User-friendly messages only
- Technical details hidden from users
- Graceful fallbacks to prevent app crashes
- Error tracking without exposing internals

## Error Recovery Strategies

### Automatic Fallbacks

**Challenge Loading Hierarchy**:
1. Specified local challenge
2. Specified database challenge  
3. Tutorial progression
4. Daily challenge
5. Archive challenge
6. Error challenge (final fallback)

**Data Storage Fallbacks**:
1. IndexedDB storage
2. In-memory cache
3. Empty array (prevents crashes)

### User-Initiated Recovery

**Data Reset** ([`resetData`](scripts/data.js:476)):
- Provides user confirmation before clearing data
- Clears both database and cache
- Handles errors during reset process

**Retry Mechanisms**:
- Network requests can be retried based on [`CONFIG.NETWORK.MAX_RETRIES`](scripts/config.js:43)
- Exponential backoff using [`CONFIG.NETWORK.RETRY_DELAY_BASE`](scripts/config.js:44)

## Integration with Application Flow

### Challenge System Integration

When challenge loading fails, the system:
1. Attempts multiple fallback strategies
2. Returns an error challenge object if all fail
3. Maintains consistent object structure for UI compatibility
4. Preserves user experience with meaningful error messages

### Game Flow Preservation

Errors don't break the game flow:
- Invalid challenges show error messages but keep UI functional
- Database failures don't prevent gameplay, just affect persistence
- Network issues fall back to cached or local data

### UI Error Display

Error challenges are displayed like regular challenges:
- Use the same UI components and styling
- Show error messages in the clue area
- Maintain consistent user interaction patterns

## Best Practices

### Error Throwing Guidelines

✅ **Throw Errors For:**
- Critical failures that prevent core functionality
- Data validation failures
- Database operation failures
- Network request failures

❌ **Don't Throw Errors For:**
- Analytics failures
- Non-critical feature failures
- Optional data that's missing
- Performance monitoring issues

### Error Message Guidelines

**Development Messages:**
- Include technical details and context
- Preserve stack traces and error objects
- Use descriptive function and operation names

**Production Messages:**
- Use simple, actionable language
- Avoid technical jargon
- Provide guidance when possible ("please try again")
- Don't expose internal system details

### Error Handling Patterns

**Layered Error Handling:**
1. **Low Level**: Throw specific error types with detailed information
2. **Mid Level**: Catch and transform errors, add context
3. **High Level**: Convert to user-friendly format, implement fallbacks

**Graceful Degradation:**
- Always provide fallback behavior
- Maintain core functionality even when features fail
- Use cached data when live data is unavailable
- Show meaningful messages instead of broken interfaces

## Configuration

Error handling behavior is influenced by:

- **Environment Detection**: [`CONFIG.IS_DEVELOPMENT`](scripts/config.js:55)
- **Network Settings**: Retry counts and timeouts in [`CONFIG.NETWORK`](scripts/config.js:42)
- **Database Configuration**: Store names and versions in [`CONFIG.DB_*`](scripts/config.js:24)

This centralized configuration ensures consistent error handling behavior across the entire application.