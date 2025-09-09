// Import cache version from external file for easier management
import { CACHE_VERSION } from './cacheVersion.js';
const CACHE_NAME = `hocus-focus-${CACHE_VERSION}`;

// Assets to cache
const STATIC_ASSETS = [
  // Core HTML files
  './',
  './index.html',
  './notes.html',
  './error.html',
  
  
  // JavaScript files
  './scripts/cache.js',
  './scripts/canvas.js',
  './scripts/config.js',
  './scripts/cursor.js',
  './scripts/data.js',
  './scripts/errors.js',
  './scripts/game.js',
  './scripts/main.js',
  './scripts/network.js',
  './scripts/pixelPainter.js',
  './scripts/stats.js',

  './scripts/utils.js',
  './scripts/validation.js',
  './scripts/winContent.js',
  
  // CSS files
  './styles/styles.css',
  
  // Data files
  './data/challenges.json',
  './data/tutorials.js',
  
  // Manifest and other assets
  './manifest.json',
  './_redirects'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log(`SW: Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation completed');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log(`SW: Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('hocus-focus-') && cacheName !== CACHE_NAME) {
              console.log(`SW: Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation completed');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Bug fix for Chrome
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API requests (let them go to network)
  if (request.url.includes('/api/') || 
      request.url.includes('localhost:5000') || 
      request.url.includes('.onrender.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log(`SW: Serving from cache: ${request.url}`);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        console.log(`SW: Fetching from network: ${request.url}`);
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            // Add to cache for future requests
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error(`SW: Network fetch failed for ${request.url}:`, error);
            
            // For HTML requests, return a fallback page
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match('./error.html');
            }
            
            throw error;
          });
      })
  );
});

// Message event - handle cache refresh requests
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log(`SW: Service Worker ${CACHE_VERSION} loaded`);
