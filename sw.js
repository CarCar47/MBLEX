/**
 * Enhanced Quiz System - Service Worker
 * PWA offline capabilities with intelligent caching for educational content
 * Implements cache-first strategy for questions, network-first for updates
 */

const CACHE_NAME = 'enhanced-quiz-v1.0.0';
const CACHE_VERSION = '1.0.0';
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_QUESTIONS_CACHE = 1000; // Maximum questions to cache

// Critical resources for offline functionality
const CORE_CACHE_RESOURCES = [
    '/',
    '/index.html',
    '/css/enhanced-quiz-styles.css',
    '/css/styles.css',
    '/js/enhanced-quiz-engine.js',
    '/js/question-bank-manager.js',
    '/js/enhanced-quiz-ui-controller.js',
    '/js/duplicate-detector.js',
    '/js/secure-storage.js',
    // Add any other critical CSS/JS files
];

// Dynamic cache names
const CACHES = {
    CORE: `${CACHE_NAME}-core`,
    QUESTIONS: `${CACHE_NAME}-questions`,
    TOPICS: `${CACHE_NAME}-topics`,
    ASSETS: `${CACHE_NAME}-assets`,
    RUNTIME: `${CACHE_NAME}-runtime`
};

class EnhancedServiceWorker {
    constructor() {
        this.installPromise = null;
        this.cacheMetadata = new Map();
        this.syncTasks = new Set();
    }

    /**
     * Service Worker Installation
     */
    async handleInstall(event) {
        console.log('📦 Enhanced Quiz SW: Installing');

        this.installPromise = this.performInstall();
        event.waitUntil(this.installPromise);

        // Take control immediately
        await self.skipWaiting();
    }

    async performInstall() {
        try {
            // Open core cache
            const coreCache = await caches.open(CACHES.CORE);

            // Cache core resources with retry logic
            const cachePromises = CORE_CACHE_RESOURCES.map(async (resource) => {
                try {
                    await coreCache.add(resource);
                    console.log(`✅ Cached: ${resource}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to cache ${resource}:`, error.message);
                    // Don't fail installation for individual resources
                }
            });

            await Promise.allSettled(cachePromises);

            // Initialize metadata store
            await this.initializeCacheMetadata();

            console.log('✅ Enhanced Quiz SW: Installation complete');

        } catch (error) {
            console.error('❌ Enhanced Quiz SW: Installation failed:', error);
            throw error;
        }
    }

    /**
     * Service Worker Activation
     */
    async handleActivate(event) {
        console.log('🚀 Enhanced Quiz SW: Activating');

        event.waitUntil(this.performActivation());

        // Take control of all clients immediately
        await self.clients.claim();
    }

    async performActivation() {
        try {
            // Clean up old caches
            await this.cleanupOldCaches();

            // Initialize quiz data caches
            await this.initializeQuizCaches();

            // Set up background sync
            this.setupBackgroundSync();

            console.log('✅ Enhanced Quiz SW: Activation complete');

        } catch (error) {
            console.error('❌ Enhanced Quiz SW: Activation failed:', error);
            throw error;
        }
    }

    /**
     * Fetch Event Handler with Intelligent Caching
     */
    async handleFetch(event) {
        const request = event.request;
        const url = new URL(request.url);

        // Skip non-GET requests
        if (request.method !== 'GET') {
            return fetch(request);
        }

        // Route requests to appropriate handlers
        if (this.isQuestionRequest(url)) {
            return this.handleQuestionRequest(request);
        }

        if (this.isTopicRequest(url)) {
            return this.handleTopicRequest(request);
        }

        if (this.isCoreAsset(url)) {
            return this.handleCoreAssetRequest(request);
        }

        if (this.isAPIRequest(url)) {
            return this.handleAPIRequest(request);
        }

        // Default: network first with cache fallback
        return this.networkFirstStrategy(request);
    }

    /**
     * Question Request Handler - Cache First Strategy
     */
    async handleQuestionRequest(request) {
        const cache = await caches.open(CACHES.QUESTIONS);
        const cacheKey = this.generateQuestionCacheKey(request);

        try {
            // Try cache first
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse && this.isCacheValid(cachedResponse)) {
                console.log(`📚 Questions served from cache: ${cacheKey}`);
                return cachedResponse;
            }

            // Fetch from network
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                // Cache successful responses
                const responseClone = networkResponse.clone();
                await this.cacheQuestionResponse(cache, cacheKey, responseClone);
            }

            return networkResponse;

        } catch (error) {
            console.warn('⚠️ Network failed for questions, checking cache');

            // Return cached version even if expired during offline
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                return cachedResponse;
            }

            // Return offline fallback
            return this.createOfflineFallback('Questions temporarily unavailable');
        }
    }

    /**
     * Topic Request Handler
     */
    async handleTopicRequest(request) {
        const cache = await caches.open(CACHES.TOPICS);

        try {
            // Try network first for topics (they change less frequently)
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            }

            return networkResponse;

        } catch (error) {
            // Fallback to cache
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            return this.createOfflineFallback('Topics temporarily unavailable');
        }
    }

    /**
     * Core Asset Handler - Cache First
     */
    async handleCoreAssetRequest(request) {
        const cache = await caches.open(CACHES.CORE);

        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, fetch and cache
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            }
            return networkResponse;
        } catch (error) {
            return this.createOfflineFallback('Asset temporarily unavailable');
        }
    }

    /**
     * API Request Handler
     */
    async handleAPIRequest(request) {
        try {
            const networkResponse = await fetch(request);

            // Cache successful GET responses
            if (networkResponse.ok && request.method === 'GET') {
                const cache = await caches.open(CACHES.RUNTIME);
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            }

            return networkResponse;

        } catch (error) {
            // Try cache for GET requests
            if (request.method === 'GET') {
                const cache = await caches.open(CACHES.RUNTIME);
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }

            return this.createOfflineFallback('API temporarily unavailable');
        }
    }

    /**
     * Network First Strategy with Cache Fallback
     */
    async networkFirstStrategy(request) {
        try {
            const networkResponse = await fetch(request);

            // Cache successful responses
            if (networkResponse.ok) {
                const cache = await caches.open(CACHES.RUNTIME);
                const responseClone = networkResponse.clone();
                await cache.put(request, responseClone);
            }

            return networkResponse;

        } catch (error) {
            // Try cache
            const cache = await caches.open(CACHES.RUNTIME);
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            // Return basic offline fallback
            if (request.destination === 'document') {
                return this.createOfflinePageResponse();
            }

            return this.createOfflineFallback();
        }
    }

    /**
     * Cache Question Response with Metadata
     */
    async cacheQuestionResponse(cache, cacheKey, response) {
        try {
            // Add cache metadata
            const headers = new Headers(response.headers);
            headers.set('sw-cached-at', new Date().toISOString());
            headers.set('sw-cache-key', cacheKey);

            const modifiedResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers
            });

            await cache.put(cacheKey, modifiedResponse);

            // Update metadata
            this.cacheMetadata.set(cacheKey, {
                cachedAt: Date.now(),
                url: response.url,
                size: parseInt(response.headers.get('content-length') || '0')
            });

            // Clean up old entries if cache is full
            await this.maintainCacheSize(cache);

        } catch (error) {
            console.warn('⚠️ Failed to cache question response:', error);
        }
    }

    /**
     * Request Type Checkers
     */
    isQuestionRequest(url) {
        return url.pathname.includes('/data/questions/') ||
               url.pathname.includes('/questions') ||
               url.searchParams.has('questions');
    }

    isTopicRequest(url) {
        return url.pathname.includes('/data/topics') ||
               url.pathname.includes('topics-config.json');
    }

    isCoreAsset(url) {
        return CORE_CACHE_RESOURCES.some(resource =>
            url.pathname.endsWith(resource) || url.pathname === resource
        );
    }

    isAPIRequest(url) {
        return url.pathname.startsWith('/api/') ||
               url.hostname !== location.hostname;
    }

    /**
     * Cache Validation
     */
    isCacheValid(response) {
        const cachedAt = response.headers.get('sw-cached-at');
        if (!cachedAt) return true; // No timestamp means it's fresh

        const age = Date.now() - new Date(cachedAt).getTime();
        return age < MAX_CACHE_AGE;
    }

    /**
     * Generate Question Cache Key
     */
    generateQuestionCacheKey(request) {
        const url = new URL(request.url);
        // Include relevant query parameters in cache key
        const params = new URLSearchParams(url.search);
        const relevantParams = ['topic', 'count', 'difficulty', 'language'];

        const keyParams = new URLSearchParams();
        relevantParams.forEach(param => {
            if (params.has(param)) {
                keyParams.set(param, params.get(param));
            }
        });

        return `${url.pathname}?${keyParams.toString()}`;
    }

    /**
     * Cache Maintenance
     */
    async maintainCacheSize(cache) {
        const keys = await cache.keys();

        if (keys.length > MAX_QUESTIONS_CACHE) {
            // Remove oldest entries
            const sortedEntries = Array.from(this.cacheMetadata.entries())
                .sort(([,a], [,b]) => a.cachedAt - b.cachedAt);

            const toRemove = sortedEntries.slice(0, keys.length - MAX_QUESTIONS_CACHE);

            for (const [cacheKey] of toRemove) {
                await cache.delete(cacheKey);
                this.cacheMetadata.delete(cacheKey);
            }
        }
    }

    /**
     * Cleanup Old Caches
     */
    async cleanupOldCaches() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name =>
            name.startsWith('enhanced-quiz-') &&
            !Object.values(CACHES).includes(name)
        );

        const deletePromises = oldCaches.map(name => caches.delete(name));
        await Promise.all(deletePromises);

        if (oldCaches.length > 0) {
            console.log(`🗑️ Deleted ${oldCaches.length} old caches`);
        }
    }

    /**
     * Initialize Quiz Data Caches
     */
    async initializeQuizCaches() {
        await Promise.all([
            caches.open(CACHES.QUESTIONS),
            caches.open(CACHES.TOPICS),
            caches.open(CACHES.ASSETS),
            caches.open(CACHES.RUNTIME)
        ]);
    }

    /**
     * Initialize Cache Metadata
     */
    async initializeCacheMetadata() {
        // Load any existing metadata from IndexedDB if needed
        // For now, start fresh
        this.cacheMetadata.clear();
    }

    /**
     * Background Sync Setup
     */
    setupBackgroundSync() {
        if ('sync' in self.registration) {
            // Register sync events for when network returns
            self.addEventListener('sync', (event) => {
                if (event.tag === 'quiz-sync') {
                    event.waitUntil(this.handleBackgroundSync());
                }
            });
        }
    }

    /**
     * Background Sync Handler
     */
    async handleBackgroundSync() {
        try {
            console.log('🔄 Background sync: Updating quiz data');

            // Update critical quiz data when network returns
            const cache = await caches.open(CACHES.QUESTIONS);
            const requests = await cache.keys();

            // Refresh expired cache entries
            const refreshPromises = requests.map(async (request) => {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        await cache.put(request, response);
                    }
                } catch (error) {
                    console.warn('Failed to refresh cache entry:', error);
                }
            });

            await Promise.allSettled(refreshPromises);
            console.log('✅ Background sync complete');

        } catch (error) {
            console.error('❌ Background sync failed:', error);
        }
    }

    /**
     * Offline Fallback Responses
     */
    createOfflineFallback(message = 'Content temporarily unavailable') {
        return new Response(JSON.stringify({
            error: 'offline',
            message: message,
            timestamp: new Date().toISOString()
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    }

    createOfflinePageResponse() {
        const offlineHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quiz - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: system-ui; text-align: center; padding: 2rem; }
                    .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
                </style>
            </head>
            <body>
                <div class="offline-icon">📱</div>
                <h1>You're Offline</h1>
                <p>Quiz content is temporarily unavailable. Please check your connection.</p>
            </body>
            </html>
        `;

        return new Response(offlineHTML, {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });
    }
}

// Initialize Service Worker
const serviceWorker = new EnhancedServiceWorker();

// Event Listeners
self.addEventListener('install', (event) => {
    serviceWorker.handleInstall(event);
});

self.addEventListener('activate', (event) => {
    serviceWorker.handleActivate(event);
});

self.addEventListener('fetch', (event) => {
    event.respondWith(serviceWorker.handleFetch(event));
});

// Message Handler for client communication
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};

    switch (type) {
        case 'CACHE_QUESTIONS':
            event.waitUntil(serviceWorker.preloadQuestions(payload));
            break;
        case 'CLEAR_CACHE':
            event.waitUntil(serviceWorker.clearSpecificCache(payload.cacheName));
            break;
        case 'GET_CACHE_STATUS':
            event.waitUntil(serviceWorker.getCacheStatus().then(status => {
                event.ports[0]?.postMessage(status);
            }));
            break;
    }
});

console.log('🚀 Enhanced Quiz Service Worker loaded');