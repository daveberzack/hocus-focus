/**
 * Cache Version Management Utility
 * 
 * To update the cache version and force all users to get fresh assets:
 * 1. Update the VERSION constant below
 * 2. The service worker will automatically handle cache invalidation
 * 
 * Version format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes or major feature releases
 * - MINOR: New features, significant updates
 * - PATCH: Bug fixes, small tweaks
 */

export const CACHE_VERSION = 'v1.6.0';

// Optional: Add build timestamp for development
export const BUILD_TIMESTAMP = new Date().toISOString();

// Helper function to get version info
export function getCacheInfo() {
    return {
        version: CACHE_VERSION,
        buildTime: BUILD_TIMESTAMP,
        cacheKey: `hocus-focus-${CACHE_VERSION}`
    };
}

// Helper function to check if service worker needs update
export async function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            // Check for updates
            await registration.update();
            
            // Get current version from service worker
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve({
                        currentVersion: CACHE_VERSION,
                        serviceWorkerVersion: event.data.version,
                        needsUpdate: event.data.version !== CACHE_VERSION
                    });
                };
                
                if (registration.active) {
                    registration.active.postMessage(
                        { type: 'GET_VERSION' }, 
                        [messageChannel.port2]
                    );
                } else {
                    resolve({
                        currentVersion: CACHE_VERSION,
                        serviceWorkerVersion: 'unknown',
                        needsUpdate: false
                    });
                }
            });
        }
    }
    
    return {
        currentVersion: CACHE_VERSION,
        serviceWorkerVersion: 'not-supported',
        needsUpdate: false
    };
}

console.log(`Cache Version: ${CACHE_VERSION} (Built: ${BUILD_TIMESTAMP})`);