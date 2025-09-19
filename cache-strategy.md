# Caching Strategy Documentation

## Overview

The Hocus Focus application implements a sophisticated caching system designed to improve performance, reduce network requests, and provide a better user experience. The caching strategy is built around two main components: an in-memory cache system and application-level data caching.

## Goals

The caching system aims to:

1. **Reduce Network Latency** - Minimize repeated API calls and file requests
2. **Improve Performance** - Provide instant access to frequently used data
3. **Enhance User Experience** - Reduce loading times and provide offline-like functionality
4. **Optimize Resource Usage** - Prevent unnecessary data fetching and processing
5. **Maintain Data Freshness** - Ensure cached data doesn't become stale through TTL (Time To Live) mechanisms

## Architecture

### Core Cache Classes

#### 1. Base Cache Class ([`Cache`](scripts/cache.js:10))

The foundation cache implementation provides:

- **In-Memory Storage**: Uses JavaScript [`Map`](scripts/cache.js:12) objects for fast key-value storage
- **TTL Support**: Automatic expiration using timestamps stored in a separate [`Map`](scripts/cache.js:13)
- **Default TTL**: 5 minutes (300,000ms) as configured in [`CONFIG.CACHE.DURATION`](scripts/config.js:38)

**Key Methods:**
- [`set(key, value, ttl)`](scripts/cache.js:22) - Store data with optional custom TTL
- [`get(key)`](scripts/cache.js:32) - Retrieve data, automatically cleaning expired entries
- [`has(key)`](scripts/cache.js:49) - Check if valid (non-expired) data exists
- [`delete(key)`](scripts/cache.js:57) - Remove specific cache entry
- [`clear()`](scripts/cache.js:65) - Clear all cached data
- [`getStats()`](scripts/cache.js:74) - Get cache performance statistics

#### 2. Challenge Cache Class ([`ChallengeCache`](scripts/cache.js:99))

Extends the base cache with game-specific functionality:

- **Hit Rate Tracking**: Monitors cache effectiveness with [`_hitCount`](scripts/cache.js:102) and [`_missCount`](scripts/cache.js:103)
- **Performance Metrics**: Calculates hit rate percentage via [`hitRate`](scripts/cache.js:110) getter
- **Statistics Reset**: [`resetStats()`](scripts/cache.js:118) method for clearing performance counters

### Global Cache Instance

The application uses a single global cache instance ([`globalCache`](scripts/cache.js:125)) that's imported throughout the application for consistent caching behavior.

## Caching Strategies by Data Type

### 1. Challenge Data Caching

**Local Challenges** ([`loadLocalChallenges`](scripts/data.js:86)):
- **What**: Challenge data from [`./data/challenges.json`](scripts/config.js:64)
- **When**: First request and cached indefinitely via [`cachedChallenges`](scripts/data.js:44)
- **Why**: Challenge data is static and doesn't change frequently

**Tutorial Challenges** ([`loadTutorialChallenges`](scripts/data.js:104)):
- **What**: Tutorial data from [`./data/tutorials.json`](scripts/config.js:65)
- **When**: First request and cached indefinitely via [`cachedTutorialChallenges`](scripts/data.js:45)
- **Why**: Tutorial content is static

**Database Challenges** ([`handleSpecifiedDatabaseChallenge`](scripts/data.js:157)):
- **What**: Individual challenges fetched from API
- **When**: Uses [`hasLoadedSpecifiedChallenge`](scripts/data.js:156) flag to prevent duplicate requests
- **Why**: Prevents multiple API calls for the same challenge during a session

### 2. Game Results Caching

**Local Results Cache** ([`cachedResults`](scripts/data.js:43)):
- **What**: User's game results and progress
- **When**: Loaded once and maintained in memory, updated on new results
- **Why**: Frequently accessed for streak calculations, progress tracking, and challenge selection

### 3. Network Response Caching

The application leverages the global cache for network responses, though specific implementation details are handled by the network layer.

## Cache Expiration Strategy

### Time-Based Expiration

- **Default TTL**: 5 minutes for most cached data
- **Automatic Cleanup**: Expired entries are automatically removed when accessed via [`get()`](scripts/cache.js:32)
- **Lazy Deletion**: Expired entries are only removed when accessed, not proactively

### Manual Cache Management

- **Application Reset**: [`resetData()`](scripts/data.js:476) clears both database and cache via [`globalCache.clear()`](scripts/data.js:482)
- **Selective Deletion**: Individual cache entries can be removed as needed

## Performance Monitoring

### Cache Statistics

The [`getStats()`](scripts/cache.js:74) method provides:
- **Total Entries**: Current number of cached items
- **Valid Entries**: Non-expired cache entries
- **Expired Entries**: Entries that have exceeded their TTL
- **Hit Rate**: Percentage of successful cache retrievals (ChallengeCache only)

### Usage Patterns

Cache effectiveness can be monitored through:
- Hit rate percentages for challenge-specific caching
- Entry counts for memory usage tracking
- Expired entry counts for TTL effectiveness

## Implementation Details

### Cache Key Strategy

- **Simple String Keys**: Uses descriptive string identifiers
- **Consistent Naming**: Follows predictable patterns for easy debugging
- **Collision Avoidance**: Keys are designed to be unique across different data types

### Memory Management

- **Bounded Growth**: TTL-based expiration prevents unlimited memory growth
- **Efficient Storage**: Uses native JavaScript Map objects for optimal performance
- **Cleanup Strategy**: Lazy deletion reduces overhead while maintaining memory efficiency

### Error Handling Integration

The cache system integrates with the application's error handling:
- **Graceful Degradation**: Cache misses don't break functionality
- **Fallback Mechanisms**: Application continues to work even if cache fails
- **Error Isolation**: Cache errors don't propagate to the main application flow

## Best Practices

### When to Cache

✅ **Cache These:**
- Static configuration data
- Frequently accessed user data
- Network responses that don't change often
- Computed results that are expensive to generate

❌ **Don't Cache These:**
- Real-time data that changes frequently
- User-specific sensitive information
- Large binary data that exceeds memory constraints
- Data with complex invalidation requirements

### Cache Invalidation

- **TTL-Based**: Most data uses time-based expiration
- **Manual Clearing**: Critical operations clear relevant cache entries
- **Application Reset**: Full cache clear on user data reset

### Performance Considerations

- **Memory Usage**: Monitor cache size to prevent memory issues
- **Hit Rate**: Aim for high hit rates to justify caching overhead
- **TTL Tuning**: Adjust TTL values based on data change frequency
- **Cleanup Frequency**: Balance between memory usage and cleanup overhead

## Configuration

Cache behavior is controlled through [`CONFIG.CACHE`](scripts/config.js:37):

```javascript
CACHE: {
  DURATION: 5 * 60 * 1000, // 5 minutes default TTL
}
```

This centralized configuration allows easy adjustment of cache behavior across the entire application.