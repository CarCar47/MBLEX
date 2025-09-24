/**
 * Offline Manager - PWA Connectivity and Cache Management
 * Coordinates between main application and service worker for seamless offline experience
 * Implements intelligent caching strategies and user feedback for connectivity changes
 */

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.serviceWorkerReady = false;
        this.registration = null;
        this.cacheUpdateCallbacks = new Set();
        this.connectivityCallbacks = new Set();
        this.offlineQueue = [];
        this.syncInProgress = false;

        // Configuration
        this.config = {
            maxOfflineActions: 50,
            syncRetryDelay: 30000, // 30 seconds
            cacheValidityDuration: 24 * 60 * 60 * 1000, // 24 hours
            preloadTopicsOnInstall: true,
            showOfflineNotifications: true,
            enableBackgroundSync: true
        };

        // Initialize
        this.initialize();
    }

    /**
     * Initialize Offline Manager
     */
    async initialize() {
        try {
            console.log('📱 Initializing Offline Manager');

            // Set up connectivity monitoring
            this.setupConnectivityMonitoring();

            // Register service worker
            await this.registerServiceWorker();

            // Set up PWA install prompt
            this.setupInstallPrompt();

            // Preload critical data if online
            if (this.isOnline) {
                await this.preloadCriticalData();
            }

            // Set up periodic cache maintenance
            this.setupCacheMaintenance();

            console.log('✅ Offline Manager initialized successfully');

        } catch (error) {
            console.error('❌ Offline Manager initialization failed:', error);
        }
    }

    /**
     * Service Worker Registration
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('📦 Service Worker registered:', this.registration.scope);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            this.serviceWorkerReady = true;

            // Set up service worker message handling
            this.setupServiceWorkerMessaging();

            // Handle service worker updates
            this.handleServiceWorkerUpdates();

        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }

    /**
     * Connectivity Monitoring Setup
     */
    setupConnectivityMonitoring() {
        // Online/offline event listeners
        window.addEventListener('online', () => {
            this.handleConnectivityChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectivityChange(false);
        });

        // Enhanced connectivity detection
        this.setupEnhancedConnectivityDetection();
    }

    /**
     * Enhanced Connectivity Detection
     */
    setupEnhancedConnectivityDetection() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.evaluateConnectionQuality();
            });
        }

        // Periodic connectivity check
        setInterval(() => {
            this.checkRealConnectivity();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Handle Connectivity Changes
     */
    async handleConnectivityChange(isOnline) {
        const wasOnline = this.isOnline;
        this.isOnline = isOnline;

        console.log(`🌐 Connectivity changed: ${isOnline ? 'online' : 'offline'}`);

        if (isOnline && !wasOnline) {
            // Just came back online
            this.handleBackOnline();
        } else if (!isOnline && wasOnline) {
            // Just went offline
            this.handleWentOffline();
        }

        // Notify callbacks
        this.connectivityCallbacks.forEach(callback => {
            try {
                callback(isOnline, wasOnline);
            } catch (error) {
                console.warn('Connectivity callback error:', error);
            }
        });

        // Update UI
        this.updateConnectivityUI();
    }

    /**
     * Handle Back Online
     */
    async handleBackOnline() {
        try {
            // Process offline queue
            await this.processOfflineQueue();

            // Trigger background sync if supported
            if (this.config.enableBackgroundSync && this.registration?.sync) {
                await this.registration.sync.register('quiz-sync');
            }

            // Update caches
            await this.refreshCriticalCaches();

            // Show online notification
            if (this.config.showOfflineNotifications) {
                this.showConnectivityNotification('Back online! Syncing data...', 'success');
            }

        } catch (error) {
            console.error('Error handling back online:', error);
        }
    }

    /**
     * Handle Went Offline
     */
    handleWentOffline() {
        if (this.config.showOfflineNotifications) {
            this.showConnectivityNotification(
                'You\'re offline. Using cached content.',
                'info',
                { persistent: true }
            );
        }
    }

    /**
     * Check Real Connectivity
     */
    async checkRealConnectivity() {
        if (!navigator.onLine) {
            return false;
        }

        try {
            // Try to fetch a small resource to verify real connectivity
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);

            await fetch('/?ping=' + Date.now(), {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache'
            });

            clearTimeout(timeout);
            return true;

        } catch (error) {
            // Real connectivity is down
            if (this.isOnline) {
                this.handleConnectivityChange(false);
            }
            return false;
        }
    }

    /**
     * Evaluate Connection Quality
     */
    evaluateConnectionQuality() {
        if (!('connection' in navigator)) return 'unknown';

        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        let quality = 'good';

        if (effectiveType === 'slow-2g' || downlink < 0.5) {
            quality = 'poor';
        } else if (effectiveType === '2g' || downlink < 1.5) {
            quality = 'fair';
        }

        // Adjust caching strategy based on connection quality
        this.adjustCachingStrategy(quality);

        return quality;
    }

    /**
     * Adjust Caching Strategy Based on Connection
     */
    adjustCachingStrategy(quality) {
        if (!this.serviceWorkerReady) return;

        let strategy = {
            preloadQuestions: true,
            cacheImages: true,
            backgroundSync: true
        };

        if (quality === 'poor') {
            strategy = {
                preloadQuestions: false,
                cacheImages: false,
                backgroundSync: false
            };
        } else if (quality === 'fair') {
            strategy.cacheImages = false;
        }

        // Send strategy to service worker
        this.sendMessageToServiceWorker({
            type: 'UPDATE_STRATEGY',
            payload: strategy
        });
    }

    /**
     * Preload Critical Data
     */
    async preloadCriticalData() {
        if (!this.isOnline || !this.serviceWorkerReady) {
            return;
        }

        try {
            console.log('📚 Preloading critical quiz data');

            // Get active topics
            const activeTopics = await this.getActiveTopics();

            // Preload questions for active topics
            for (const topic of activeTopics) {
                await this.preloadTopicQuestions(topic.id);
            }

            console.log('✅ Critical data preloading complete');

        } catch (error) {
            console.warn('⚠️ Critical data preloading failed:', error);
        }
    }

    /**
     * Preload Topic Questions
     */
    async preloadTopicQuestions(topicId) {
        try {
            // Request service worker to cache questions
            const response = await this.sendMessageToServiceWorker({
                type: 'CACHE_QUESTIONS',
                payload: { topicId, count: 50 }
            });

            console.log(`📚 Preloaded questions for topic: ${topicId}`);
            return response;

        } catch (error) {
            console.warn(`⚠️ Failed to preload questions for ${topicId}:`, error);
        }
    }

    /**
     * Get Active Topics
     */
    async getActiveTopics() {
        try {
            // This would typically fetch from your quiz system
            // For now, return mock data
            return [
                { id: 'topic-1', title: 'Valoración para diagnóstico de la Terapia del Masaje' }
            ];
        } catch (error) {
            console.warn('Failed to get active topics:', error);
            return [];
        }
    }

    /**
     * Add Action to Offline Queue
     */
    addToOfflineQueue(action) {
        if (this.offlineQueue.length >= this.config.maxOfflineActions) {
            // Remove oldest action
            this.offlineQueue.shift();
        }

        this.offlineQueue.push({
            ...action,
            timestamp: Date.now(),
            id: this.generateActionId()
        });

        console.log('📝 Added action to offline queue:', action.type);
    }

    /**
     * Process Offline Queue
     */
    async processOfflineQueue() {
        if (this.syncInProgress || this.offlineQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        console.log(`🔄 Processing ${this.offlineQueue.length} offline actions`);

        const processedActions = [];

        try {
            for (const action of this.offlineQueue) {
                try {
                    await this.executeAction(action);
                    processedActions.push(action);
                } catch (error) {
                    console.warn('Failed to process offline action:', error);
                    // Keep failed actions in queue for retry
                }
            }

            // Remove successfully processed actions
            this.offlineQueue = this.offlineQueue.filter(
                action => !processedActions.includes(action)
            );

            if (processedActions.length > 0) {
                console.log(`✅ Processed ${processedActions.length} offline actions`);
            }

        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Execute Offline Action
     */
    async executeAction(action) {
        switch (action.type) {
            case 'SAVE_PROGRESS':
                return await this.syncProgress(action.payload);
            case 'SUBMIT_QUIZ':
                return await this.syncQuizSubmission(action.payload);
            case 'UPDATE_PREFERENCES':
                return await this.syncPreferences(action.payload);
            default:
                console.warn('Unknown offline action type:', action.type);
        }
    }

    /**
     * Service Worker Messaging
     */
    setupServiceWorkerMessaging() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, payload, error } = event.data || {};

            switch (type) {
                case 'CACHE_UPDATE':
                    this.handleCacheUpdate(payload);
                    break;
                case 'OFFLINE_FALLBACK':
                    this.handleOfflineFallback(payload);
                    break;
                case 'SYNC_COMPLETE':
                    this.handleSyncComplete(payload);
                    break;
            }
        });
    }

    /**
     * Send Message to Service Worker
     */
    async sendMessageToServiceWorker(message) {
        if (!this.serviceWorkerReady) {
            throw new Error('Service Worker not ready');
        }

        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                const { error, data } = event.data || {};
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(data);
                }
            };

            navigator.serviceWorker.controller?.postMessage(message, [messageChannel.port2]);

            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Service Worker message timeout')), 10000);
        });
    }

    /**
     * PWA Install Prompt
     */
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 PWA install prompt available');
            event.preventDefault();
            deferredPrompt = event;

            // Show custom install UI
            this.showInstallPrompt(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('📱 PWA installed successfully');
            deferredPrompt = null;
        });
    }

    /**
     * Show Install Prompt
     */
    showInstallPrompt(deferredPrompt) {
        // Create install notification
        const notification = this.createNotification({
            message: 'Install MBLEX Quiz for offline access!',
            type: 'info',
            actions: [
                {
                    text: 'Install',
                    action: async () => {
                        try {
                            await deferredPrompt.prompt();
                            const { outcome } = await deferredPrompt.userChoice;
                            console.log('Install prompt outcome:', outcome);
                        } catch (error) {
                            console.warn('Install prompt error:', error);
                        }
                    }
                },
                {
                    text: 'Later',
                    action: () => notification.remove()
                }
            ]
        });
    }

    /**
     * Cache Maintenance
     */
    setupCacheMaintenance() {
        // Run cache maintenance every hour
        setInterval(() => {
            this.performCacheMaintenance();
        }, 60 * 60 * 1000);
    }

    async performCacheMaintenance() {
        try {
            console.log('🧹 Performing cache maintenance');

            // Get cache status from service worker
            const cacheStatus = await this.sendMessageToServiceWorker({
                type: 'GET_CACHE_STATUS'
            });

            // Clean expired entries
            // This is handled by the service worker, just trigger it
            await this.sendMessageToServiceWorker({
                type: 'CLEANUP_EXPIRED_CACHE'
            });

        } catch (error) {
            console.warn('Cache maintenance error:', error);
        }
    }

    /**
     * Connectivity UI Updates
     */
    updateConnectivityUI() {
        const indicator = document.querySelector('.connectivity-indicator');
        if (!indicator) return;

        indicator.className = `connectivity-indicator ${this.isOnline ? 'online' : 'offline'}`;
        indicator.setAttribute('aria-label',
            this.isOnline ? 'Online' : 'Offline - using cached content'
        );
    }

    /**
     * Show Connectivity Notification
     */
    showConnectivityNotification(message, type = 'info', options = {}) {
        return this.createNotification({
            message,
            type,
            duration: options.persistent ? 0 : 3000,
            className: 'connectivity-notification'
        });
    }

    /**
     * Create Notification
     */
    createNotification({ message, type = 'info', duration = 5000, actions = [], className = '' }) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} ${className}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map((action, index) => `
                            <button class="notification-button" data-action="${index}">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Add event listeners
        actions.forEach((action, index) => {
            const button = notification.querySelector(`[data-action="${index}"]`);
            button?.addEventListener('click', () => {
                action.action();
                if (action.autoClose !== false) {
                    notification.remove();
                }
            });
        });

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => notification.remove(), duration);
        }

        // Add to page
        const container = this.getOrCreateNotificationContainer();
        container.appendChild(notification);

        return {
            element: notification,
            remove: () => notification.remove()
        };
    }

    /**
     * Get or Create Notification Container
     */
    getOrCreateNotificationContainer() {
        let container = document.querySelector('.notification-container');

        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        return container;
    }

    /**
     * Utility Methods
     */
    generateActionId() {
        return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Public API Methods
     */

    // Subscribe to connectivity changes
    onConnectivityChange(callback) {
        this.connectivityCallbacks.add(callback);
        return () => this.connectivityCallbacks.delete(callback);
    }

    // Subscribe to cache updates
    onCacheUpdate(callback) {
        this.cacheUpdateCallbacks.add(callback);
        return () => this.cacheUpdateCallbacks.delete(callback);
    }

    // Get current connectivity status
    getConnectivityStatus() {
        return {
            isOnline: this.isOnline,
            serviceWorkerReady: this.serviceWorkerReady,
            offlineQueueLength: this.offlineQueue.length,
            syncInProgress: this.syncInProgress
        };
    }

    // Manually trigger sync
    async triggerSync() {
        if (this.isOnline) {
            await this.processOfflineQueue();
        }
    }

    // Clear offline queue
    clearOfflineQueue() {
        this.offlineQueue = [];
        console.log('🗑️ Offline queue cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineManager;
} else if (typeof window !== 'undefined') {
    window.OfflineManager = OfflineManager;
}

console.log('📱 Offline Manager module loaded');