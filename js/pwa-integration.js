/**
 * PWA Integration Module
 * Coordinates between enhanced quiz system and offline manager
 * Provides seamless offline/online experience with intelligent caching
 */

class PWAIntegration {
    constructor() {
        this.offlineManager = null;
        this.quizEngine = null;
        this.uiController = null;
        this.questionBank = null;
        this.initialized = false;

        // Event listeners registry
        this.eventListeners = new Map();

        // Configuration
        this.config = {
            enableOfflineMode: true,
            preloadActiveTopics: true,
            showConnectivityStatus: true,
            enableInstallPrompt: true,
            maxOfflineQuizzes: 10,
            cacheUpdateInterval: 5 * 60 * 1000, // 5 minutes
            connectivityCheckInterval: 30 * 1000 // 30 seconds
        };

        // State management
        this.state = {
            isOnline: navigator.onLine,
            serviceWorkerReady: false,
            cacheStatus: 'initializing',
            installPromptAvailable: false,
            activeQuiz: null,
            offlineQuizzes: new Map(),
            pendingSync: []
        };
    }

    /**
     * Initialize PWA Integration
     */
    async initialize() {
        if (this.initialized) {
            console.warn('PWA Integration already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing PWA Integration');

            // Initialize offline manager first
            await this.initializeOfflineManager();

            // Initialize quiz components
            await this.initializeQuizComponents();

            // Set up PWA features
            await this.setupPWAFeatures();

            // Set up event coordination
            this.setupEventCoordination();

            // Set up UI enhancements
            this.setupUIEnhancements();

            // Initial state sync
            await this.syncInitialState();

            this.initialized = true;
            console.log('✅ PWA Integration initialized successfully');

            // Dispatch ready event
            this.dispatchEvent('pwa-ready', { state: this.state });

        } catch (error) {
            console.error('❌ PWA Integration initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize Offline Manager
     */
    async initializeOfflineManager() {
        if (!window.OfflineManager) {
            console.warn('⚠️ OfflineManager not available, loading...');
            await this.loadScript('/js/offline-manager.js');
        }

        this.offlineManager = new OfflineManager();
        await this.offlineManager.initialize();

        // Subscribe to offline manager events
        this.offlineManager.onConnectivityChange((isOnline) => {
            this.handleConnectivityChange(isOnline);
        });

        this.offlineManager.onCacheUpdate((cacheInfo) => {
            this.handleCacheUpdate(cacheInfo);
        });

        console.log('📱 Offline Manager ready');
    }

    /**
     * Initialize Quiz Components
     */
    async initializeQuizComponents() {
        // Wait for quiz components to be available
        await this.waitForQuizComponents();

        // Initialize quiz engine with offline support
        if (window.EnhancedQuizEngine) {
            this.quizEngine = new EnhancedQuizEngine();
            await this.quizEngine.initialize();

            // Extend quiz engine with offline capabilities
            this.extendQuizEngineForOffline();
        }

        // Initialize UI controller
        if (window.EnhancedQuizUIController) {
            this.uiController = new EnhancedQuizUIController();
            await this.uiController.initialize();

            // Extend UI controller with PWA features
            this.extendUIControllerForPWA();
        }

        // Initialize question bank manager
        if (window.QuestionBankManager) {
            this.questionBank = new QuestionBankManager();
            await this.questionBank.initialize();

            // Extend question bank with offline caching
            this.extendQuestionBankForOffline();
        }

        console.log('🎯 Quiz components initialized with PWA support');
    }

    /**
     * Wait for Quiz Components to Load
     */
    async waitForQuizComponents() {
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let waitTime = 0;

        while (waitTime < maxWaitTime) {
            if (window.EnhancedQuizEngine &&
                window.EnhancedQuizUIController &&
                window.QuestionBankManager) {
                return;
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waitTime += checkInterval;
        }

        console.warn('⚠️ Some quiz components may not be available');
    }

    /**
     * Setup PWA Features
     */
    async setupPWAFeatures() {
        // Add PWA meta tags if not present
        this.ensurePWAMetaTags();

        // Add manifest link if not present
        this.ensureManifestLink();

        // Add offline styles
        await this.loadOfflineStyles();

        // Set up install prompt handling
        this.setupInstallPrompt();

        // Set up app shortcuts
        this.setupAppShortcuts();

        // Set up background sync
        this.setupBackgroundSync();

        console.log('📱 PWA features configured');
    }

    /**
     * Setup Install Prompt
     */
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 PWA install prompt available');
            event.preventDefault();
            deferredPrompt = event;
            this.state.installPromptAvailable = true;

            // Show install banner after a delay
            setTimeout(() => {
                this.showInstallBanner(deferredPrompt);
            }, 5000);
        });

        window.addEventListener('appinstalled', () => {
            console.log('📱 PWA installed successfully');
            deferredPrompt = null;
            this.state.installPromptAvailable = false;
            this.hideInstallBanner();
        });
    }

    /**
     * Show Install Banner
     */
    showInstallBanner(deferredPrompt) {
        // Remove any existing banner
        const existingBanner = document.querySelector('.pwa-install-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-text">
                    <div class="pwa-install-title">Install MBLEX Quiz</div>
                    <div class="pwa-install-description">Get offline access and enhanced performance</div>
                </div>
                <div class="pwa-install-actions">
                    <button class="pwa-install-button" id="installApp">Install</button>
                    <button class="pwa-install-button" id="dismissInstall">Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('installApp').addEventListener('click', async () => {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('Install prompt outcome:', outcome);

                if (outcome === 'accepted') {
                    this.showNotification('App installing...', 'success');
                }
            } catch (error) {
                console.warn('Install prompt error:', error);
            }
            banner.remove();
        });

        document.getElementById('dismissInstall').addEventListener('click', () => {
            banner.remove();
        });

        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('visible');
        }, 100);
    }

    /**
     * Hide Install Banner
     */
    hideInstallBanner() {
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.remove();
        }
    }

    /**
     * Setup App Shortcuts
     */
    setupAppShortcuts() {
        // Handle app shortcuts from manifest
        if ('serviceWorker' in navigator && 'controller' in navigator.serviceWorker) {
            // Listen for messages from service worker about shortcuts
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SHORTCUT_ACTIVATED') {
                    this.handleAppShortcut(event.data.shortcut);
                }
            });
        }
    }

    /**
     * Handle App Shortcuts
     */
    handleAppShortcut(shortcutName) {
        switch (shortcutName) {
            case 'start-quiz':
                // Navigate to quiz interface
                if (window.location.hash !== '#testScreen') {
                    window.location.hash = '#testScreen';
                }
                break;
            case 'topics':
                // Navigate to topics view
                if (window.location.hash !== '#testScreen') {
                    window.location.hash = '#testScreen';
                }
                break;
            case 'progress':
                // Show progress/results
                this.showProgressView();
                break;
        }
    }

    /**
     * Setup Background Sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Background sync is handled by the service worker
            // This method can be extended for additional sync setup
            console.log('🔄 Background sync available');
        } else {
            console.log('⚠️ Background sync not supported');
        }
    }

    /**
     * Setup Event Coordination
     */
    setupEventCoordination() {
        // Coordinate between quiz engine and offline manager
        if (this.quizEngine) {
            this.quizEngine.addEventListener('quiz-start', (event) => {
                this.handleQuizStart(event.detail);
            });

            this.quizEngine.addEventListener('quiz-complete', (event) => {
                this.handleQuizComplete(event.detail);
            });

            this.quizEngine.addEventListener('progress-update', (event) => {
                this.handleProgressUpdate(event.detail);
            });
        }

        // Handle visibility changes for battery optimization
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle page unload for cleanup
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        console.log('🔗 Event coordination set up');
    }

    /**
     * Setup UI Enhancements
     */
    setupUIEnhancements() {
        // Add connectivity indicator
        this.addConnectivityIndicator();

        // Add cache status indicator
        this.addCacheStatusIndicator();

        // Add offline queue status
        this.addOfflineQueueStatus();

        // Set up gesture handling for mobile
        this.setupMobileGestures();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('🎨 UI enhancements added');
    }

    /**
     * Extend Quiz Engine for Offline
     */
    extendQuizEngineForOffline() {
        const originalStartQuiz = this.quizEngine.startQuiz.bind(this.quizEngine);
        const originalSubmitQuiz = this.quizEngine.submitQuiz.bind(this.quizEngine);

        // Override startQuiz to handle offline scenarios
        this.quizEngine.startQuiz = async (topicIds, options = {}) => {
            try {
                if (!this.state.isOnline) {
                    // Try to start quiz with cached questions
                    return await this.startOfflineQuiz(topicIds, options);
                }

                return await originalStartQuiz(topicIds, options);

            } catch (error) {
                if (!this.state.isOnline) {
                    // Fallback to offline mode
                    console.warn('Online quiz failed, falling back to offline');
                    return await this.startOfflineQuiz(topicIds, options);
                }
                throw error;
            }
        };

        // Override submitQuiz to handle offline submissions
        this.quizEngine.submitQuiz = async (quizData) => {
            try {
                if (!this.state.isOnline) {
                    return await this.submitOfflineQuiz(quizData);
                }

                return await originalSubmitQuiz(quizData);

            } catch (error) {
                if (!this.state.isOnline) {
                    return await this.submitOfflineQuiz(quizData);
                }
                throw error;
            }
        };

        console.log('🎯 Quiz engine extended for offline use');
    }

    /**
     * Extend UI Controller for PWA
     */
    extendUIControllerForPWA() {
        // Add PWA-specific UI elements
        this.uiController.addPWAElements = () => {
            this.addPWAUIElements();
        };

        // Override error handling to show offline-friendly messages
        const originalShowError = this.uiController.showError?.bind(this.uiController);
        if (originalShowError) {
            this.uiController.showError = (message, options = {}) => {
                if (!this.state.isOnline && !options.isOfflineError) {
                    message = `${message} (Using cached content)`;
                }
                return originalShowError(message, options);
            };
        }

        console.log('🎨 UI controller extended for PWA');
    }

    /**
     * Extend Question Bank for Offline
     */
    extendQuestionBankForOffline() {
        const originalGetQuestions = this.questionBank.getQuestionsForTopics.bind(this.questionBank);

        // Override to use cached questions when offline
        this.questionBank.getQuestionsForTopics = async (topicIds, count, options = {}) => {
            try {
                if (this.state.isOnline) {
                    const questions = await originalGetQuestions(topicIds, count, options);

                    // Cache questions for offline use
                    await this.cacheQuestionsForOffline(questions, topicIds);

                    return questions;
                }

                // Try to get cached questions
                return await this.getCachedQuestions(topicIds, count, options);

            } catch (error) {
                console.warn('Failed to get questions, trying cache:', error);
                return await this.getCachedQuestions(topicIds, count, options);
            }
        };

        console.log('📚 Question bank extended for offline use');
    }

    /**
     * Handle Connectivity Changes
     */
    handleConnectivityChange(isOnline) {
        const wasOnline = this.state.isOnline;
        this.state.isOnline = isOnline;

        console.log(`🌐 Connectivity changed: ${isOnline ? 'online' : 'offline'}`);

        if (isOnline && !wasOnline) {
            // Just came back online
            this.handleBackOnline();
        } else if (!isOnline && wasOnline) {
            // Just went offline
            this.handleWentOffline();
        }

        // Update UI
        this.updateConnectivityUI();

        // Dispatch event
        this.dispatchEvent('connectivity-change', {
            isOnline,
            wasOnline,
            timestamp: Date.now()
        });
    }

    /**
     * Handle Back Online
     */
    async handleBackOnline() {
        try {
            // Sync pending offline data
            await this.syncOfflineData();

            // Update caches
            await this.updateCaches();

            // Resume normal operations
            this.resumeOnlineOperations();

            // Show success notification
            this.showNotification('Back online! Syncing data...', 'success');

        } catch (error) {
            console.error('Error handling back online:', error);
            this.showNotification('Online but sync failed. Some data may be outdated.', 'warning');
        }
    }

    /**
     * Handle Went Offline
     */
    handleWentOffline() {
        // Switch to offline mode
        this.enableOfflineMode();

        // Show offline notification
        this.showNotification(
            'You\'re offline. Using cached content.',
            'info',
            { persistent: true, id: 'offline-status' }
        );

        // Optimize for battery saving
        this.enableBatterySaving();
    }

    /**
     * Start Offline Quiz
     */
    async startOfflineQuiz(topicIds, options = {}) {
        try {
            console.log('🎯 Starting offline quiz');

            // Get cached questions
            const questions = await this.getCachedQuestions(topicIds, options.count || 20);

            if (questions.length === 0) {
                throw new Error('No cached questions available for offline use');
            }

            // Create offline quiz instance
            const offlineQuiz = {
                id: this.generateQuizId(),
                topicIds,
                questions,
                startTime: Date.now(),
                isOffline: true,
                options
            };

            // Store offline quiz
            this.state.offlineQuizzes.set(offlineQuiz.id, offlineQuiz);
            this.state.activeQuiz = offlineQuiz.id;

            return {
                quizId: offlineQuiz.id,
                questions: questions.slice(0, options.count || 20),
                isOffline: true,
                totalQuestions: questions.length
            };

        } catch (error) {
            console.error('Failed to start offline quiz:', error);
            throw new Error('Unable to start quiz offline. Please connect to the internet.');
        }
    }

    /**
     * Submit Offline Quiz
     */
    async submitOfflineQuiz(quizData) {
        try {
            console.log('📝 Submitting offline quiz');

            // Store submission for later sync
            const submission = {
                id: this.generateSubmissionId(),
                quizData,
                timestamp: Date.now(),
                isOffline: true,
                needsSync: true
            };

            // Add to pending sync
            this.state.pendingSync.push(submission);

            // Store in offline manager queue
            this.offlineManager.addToOfflineQueue({
                type: 'SUBMIT_QUIZ',
                payload: submission
            });

            // Calculate offline score
            const score = this.calculateOfflineScore(quizData);

            return {
                submissionId: submission.id,
                score,
                isOffline: true,
                willSyncWhenOnline: true
            };

        } catch (error) {
            console.error('Failed to submit offline quiz:', error);
            throw error;
        }
    }

    /**
     * Sync Offline Data
     */
    async syncOfflineData() {
        if (this.state.pendingSync.length === 0) {
            return;
        }

        console.log(`🔄 Syncing ${this.state.pendingSync.length} offline items`);

        const syncPromises = this.state.pendingSync.map(async (item) => {
            try {
                await this.syncIndividualItem(item);
                return { item, success: true };
            } catch (error) {
                console.warn('Failed to sync item:', error);
                return { item, success: false, error };
            }
        });

        const results = await Promise.allSettled(syncPromises);
        const successful = results.filter(r => r.value?.success).length;

        // Remove successfully synced items
        this.state.pendingSync = this.state.pendingSync.filter(item => {
            const result = results.find(r => r.value?.item?.id === item.id);
            return !result?.value?.success;
        });

        console.log(`✅ Synced ${successful} items, ${this.state.pendingSync.length} remaining`);
    }

    /**
     * Add Connectivity Indicator
     */
    addConnectivityIndicator() {
        if (document.querySelector('.connectivity-indicator')) {
            return; // Already exists
        }

        const indicator = document.createElement('div');
        indicator.className = `connectivity-indicator ${this.state.isOnline ? 'online' : 'offline'}`;
        indicator.setAttribute('aria-live', 'polite');
        indicator.setAttribute('aria-label',
            this.state.isOnline ? 'Online' : 'Offline - using cached content'
        );
        indicator.textContent = this.state.isOnline ? 'Online' : 'Offline';

        document.body.appendChild(indicator);
    }

    /**
     * Update Connectivity UI
     */
    updateConnectivityUI() {
        // Update connectivity indicator
        const indicator = document.querySelector('.connectivity-indicator');
        if (indicator) {
            indicator.className = `connectivity-indicator ${this.state.isOnline ? 'online' : 'offline'}`;
            indicator.textContent = this.state.isOnline ? 'Online' : 'Offline';
            indicator.setAttribute('aria-label',
                this.state.isOnline ? 'Online' : 'Offline - using cached content'
            );
        }

        // Update body class
        document.body.classList.toggle('offline', !this.state.isOnline);
        document.body.classList.toggle('online', this.state.isOnline);

        // Hide/show offline status notification
        const notification = document.querySelector('.notification[data-id="offline-status"]');
        if (this.state.isOnline && notification) {
            notification.remove();
        }
    }

    /**
     * Show Notification
     */
    showNotification(message, type = 'info', options = {}) {
        // Use offline manager's notification system
        return this.offlineManager?.showConnectivityNotification(message, type, options);
    }

    /**
     * Ensure PWA Meta Tags
     */
    ensurePWAMetaTags() {
        const metaTags = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'apple-mobile-web-app-title', content: 'MBLEX Quiz' },
            { name: 'application-name', content: 'MBLEX Quiz' },
            { name: 'msapplication-TileColor', content: '#667eea' },
            { name: 'theme-color', content: '#667eea' }
        ];

        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    /**
     * Ensure Manifest Link
     */
    ensureManifestLink() {
        if (!document.querySelector('link[rel="manifest"]')) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = '/manifest.json';
            document.head.appendChild(link);
        }
    }

    /**
     * Load Offline Styles
     */
    async loadOfflineStyles() {
        if (!document.querySelector('link[href*="offline-styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/offline-styles.css';
            document.head.appendChild(link);
        }
    }

    /**
     * Handle Quiz Events
     */
    handleQuizStart(quizData) {
        console.log('🎯 Quiz started:', quizData);
        this.state.activeQuiz = quizData.quizId;

        // Update PWA state
        this.updatePWAState('quiz-active');
    }

    handleQuizComplete(results) {
        console.log('✅ Quiz completed:', results);
        this.state.activeQuiz = null;

        // Store results for offline sync if needed
        if (!this.state.isOnline) {
            this.offlineManager.addToOfflineQueue({
                type: 'SUBMIT_QUIZ',
                payload: results
            });
        }

        this.updatePWAState('quiz-complete');
    }

    handleProgressUpdate(progress) {
        // Update progress in real-time
        this.updatePWAState('quiz-progress', progress);
    }

    /**
     * Handle Visibility Changes
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            // App went to background - optimize for battery
            this.enableBatterySaving();
        } else {
            // App came to foreground - resume normal operations
            this.resumeNormalOperations();
        }
    }

    /**
     * Handle Before Unload
     */
    handleBeforeUnload() {
        // Save any pending state before page unloads
        if (this.state.activeQuiz) {
            // Save quiz state to localStorage for recovery
            const quizState = {
                quizId: this.state.activeQuiz,
                timestamp: Date.now(),
                url: window.location.href
            };

            localStorage.setItem('pwa-quiz-recovery', JSON.stringify(quizState));
        }

        console.log('🔄 PWA state saved for recovery');
    }

    /**
     * Battery Saving Mode
     */
    enableBatterySaving() {
        // Reduce update frequency when app is in background
        console.log('🔋 Battery saving mode enabled');

        // Could pause non-critical timers, reduce sync frequency, etc.
    }

    resumeNormalOperations() {
        console.log('🔋 Normal operations resumed');

        // Resume full functionality when app is active
    }

    /**
     * Update PWA State
     */
    updatePWAState(state, data = null) {
        console.log('📱 PWA state updated:', state, data);

        // Dispatch custom events for other components
        this.dispatchEvent('state-change', { state, data });
    }

    /**
     * Show Progress View
     */
    showProgressView() {
        // Implementation would show progress/statistics view
        console.log('📊 Showing progress view');
    }

    /**
     * Add PWA UI Elements
     */
    addPWAUIElements() {
        // Add PWA-specific UI elements to the quiz interface
        this.addConnectivityIndicator();
        this.addCacheStatusIndicator();
        this.addOfflineQueueStatus();
    }

    /**
     * Add Cache Status Indicator
     */
    addCacheStatusIndicator() {
        if (document.querySelector('.cache-status')) {
            return; // Already exists
        }

        const indicator = document.createElement('div');
        indicator.className = 'cache-status loading';
        indicator.innerHTML = '<span>Loading quiz data...</span>';
        indicator.style.display = 'none'; // Hidden by default, shown when needed

        document.body.appendChild(indicator);
    }

    /**
     * Add Offline Queue Status
     */
    addOfflineQueueStatus() {
        if (document.querySelector('.offline-queue-status')) {
            return; // Already exists
        }

        const indicator = document.createElement('div');
        indicator.className = 'offline-queue-status';
        indicator.innerHTML = `
            <span class="offline-queue-text">Offline items:</span>
            <span class="offline-queue-count">0</span>
        `;

        document.body.appendChild(indicator);
    }

    /**
     * Cache Questions for Offline
     */
    async cacheQuestionsForOffline(questions, topicIds) {
        try {
            // Send questions to service worker for caching
            await this.offlineManager.sendMessageToServiceWorker({
                type: 'CACHE_QUESTIONS',
                payload: { questions, topicIds }
            });

            console.log(`📚 Cached ${questions.length} questions for offline use`);
        } catch (error) {
            console.warn('Failed to cache questions for offline:', error);
        }
    }

    /**
     * Get Cached Questions
     */
    async getCachedQuestions(topicIds, count = 20, options = {}) {
        try {
            // Try to get questions from cache
            const response = await this.offlineManager.sendMessageToServiceWorker({
                type: 'GET_CACHED_QUESTIONS',
                payload: { topicIds, count, options }
            });

            return response.questions || [];
        } catch (error) {
            console.warn('Failed to get cached questions:', error);
            return [];
        }
    }

    /**
     * Calculate Offline Score
     */
    calculateOfflineScore(quizData) {
        let correct = 0;
        let total = quizData.answers ? quizData.answers.length : 0;

        if (quizData.answers) {
            quizData.answers.forEach(answer => {
                if (answer.isCorrect) {
                    correct++;
                }
            });
        }

        return {
            correct,
            total,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0
        };
    }

    /**
     * Sync Individual Item
     */
    async syncIndividualItem(item) {
        switch (item.type) {
            case 'SUBMIT_QUIZ':
                return await this.syncQuizSubmission(item.payload);
            case 'SAVE_PROGRESS':
                return await this.syncProgress(item.payload);
            case 'UPDATE_PREFERENCES':
                return await this.syncPreferences(item.payload);
            default:
                throw new Error(`Unknown sync item type: ${item.type}`);
        }
    }

    /**
     * Sync Quiz Submission
     */
    async syncQuizSubmission(submissionData) {
        // Mock implementation - would sync with actual server
        console.log('🔄 Syncing quiz submission:', submissionData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true, synced: true };
    }

    /**
     * Sync Progress
     */
    async syncProgress(progressData) {
        console.log('🔄 Syncing progress:', progressData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return { success: true, synced: true };
    }

    /**
     * Sync Preferences
     */
    async syncPreferences(preferencesData) {
        console.log('🔄 Syncing preferences:', preferencesData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        return { success: true, synced: true };
    }

    /**
     * Update Caches
     */
    async updateCaches() {
        try {
            await this.offlineManager.sendMessageToServiceWorker({
                type: 'UPDATE_CACHES'
            });

            console.log('🔄 Caches updated');
        } catch (error) {
            console.warn('Failed to update caches:', error);
        }
    }

    /**
     * Resume Online Operations
     */
    resumeOnlineOperations() {
        console.log('🌐 Resuming online operations');

        // Re-enable full functionality
        this.state.cacheStatus = 'ready';
        this.updateConnectivityUI();
    }

    /**
     * Enable Offline Mode
     */
    enableOfflineMode() {
        console.log('📱 Enabling offline mode');

        this.state.cacheStatus = 'offline';
        this.updateConnectivityUI();
    }

    /**
     * Refresh Critical Caches
     */
    async refreshCriticalCaches() {
        try {
            await this.offlineManager.sendMessageToServiceWorker({
                type: 'REFRESH_CRITICAL_CACHES'
            });

            console.log('🔄 Critical caches refreshed');
        } catch (error) {
            console.warn('Failed to refresh critical caches:', error);
        }
    }

    /**
     * Sync Initial State
     */
    async syncInitialState() {
        try {
            // Check for any recovery state
            const recoveryState = localStorage.getItem('pwa-quiz-recovery');
            if (recoveryState) {
                const parsed = JSON.parse(recoveryState);
                console.log('🔄 Found recovery state:', parsed);

                // Clear recovery state
                localStorage.removeItem('pwa-quiz-recovery');

                // Could restore quiz state if needed
                this.dispatchEvent('recovery-available', parsed);
            }

            // Initialize connectivity state
            this.updateConnectivityUI();

            console.log('🔄 Initial state synced');
        } catch (error) {
            console.warn('Failed to sync initial state:', error);
        }
    }

    /**
     * Utility Methods
     */
    generateQuizId() {
        return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSubmissionId() {
        return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    dispatchEvent(type, detail) {
        const event = new CustomEvent(`pwa-${type}`, { detail });
        document.dispatchEvent(event);
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Public API
     */

    // Get PWA status
    getStatus() {
        return {
            ...this.state,
            isInitialized: this.initialized,
            offlineCapable: !!this.offlineManager,
            serviceWorkerSupported: 'serviceWorker' in navigator
        };
    }

    // Subscribe to PWA events
    addEventListener(type, callback) {
        const eventType = `pwa-${type}`;
        document.addEventListener(eventType, callback);

        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }
        this.eventListeners.get(eventType).add(callback);

        return () => {
            document.removeEventListener(eventType, callback);
            this.eventListeners.get(eventType)?.delete(callback);
        };
    }

    // Force sync offline data
    async forceSyncOfflineData() {
        if (this.state.isOnline) {
            await this.syncOfflineData();
        } else {
            throw new Error('Cannot sync while offline');
        }
    }

    // Get offline quiz count
    getOfflineQuizCount() {
        return this.state.offlineQuizzes.size;
    }

    // Clear offline data
    async clearOfflineData() {
        this.state.offlineQuizzes.clear();
        this.state.pendingSync = [];

        if (this.offlineManager) {
            this.offlineManager.clearOfflineQueue();
        }

        console.log('🗑️ Offline data cleared');
    }
}

// Auto-initialize when DOM is ready - DISABLED FOR LOCAL DEVELOPMENT
// Check if we're running locally
const isLocalDevelopment = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';

if (!isLocalDevelopment) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.PWAIntegration = new PWAIntegration();
            window.PWAIntegration.initialize().catch(console.error);
        });
    } else {
        window.PWAIntegration = new PWAIntegration();
        window.PWAIntegration.initialize().catch(console.error);
    }
} else {
    console.log('🚫 PWA Integration disabled for local development');
    // Create a stub object to prevent errors
    window.PWAIntegration = {
        config: {
            enableOfflineMode: false,
            showConnectivityStatus: false
        },
        getStatus: () => ({ isLocalDevelopment: true, disabled: true })
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAIntegration;
}

console.log('📱 PWA Integration module loaded');