/**
 * Main Application Controller
 * Handles initialization, error handling, and global utilities for MBLEX app
 */

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('MBLEX App - DOM ready, initializing immediately...');

    /**
     * Initialize main application immediately (no auth required)
     */
    const initApp = async () => {
        console.log('Initializing MBLEX application...');
        
        // Check if all required elements exist
        const requiredElements = [
            'mainStartScreen', 
            'studyScreen', 
            'testScreen',
            'simulationScreen',
            'aiTutorScreen'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements);
            showErrorMessage('Application initialization failed. Please reload the page.');
            return;
        }
        
        // Initialize managers (they're already created as global instances)
        try {
            console.log('🔍 Checking existing managers...');

            // Check if instances exist
            console.log('Available instances:', {
                secureStorage: !!window.secureStorage,
                audioManager: !!window.audioManager,
                uiManager: !!window.uiManager,
                chatbotManager: !!window.chatbotManager,
                quizGenerator: !!window.quizGenerator
            });

            // Managers are initialized automatically, but we can verify they exist
            if (!window.audioManager) {
                console.warn('Audio Manager not found');
            }
            if (!window.uiManager) {
                console.warn('UI Manager not found');
            }
            if (!window.chatbotManager) {
                console.warn('Chatbot Manager not found');
            }

            // Initialize Quiz Generator
            console.log('Initializing Quiz Generator...');

            try {
                // Check if QuizGenerator class is available
                if (window.QuizGenerator) {
                    console.log('🎯 Creating QuizGenerator...');
                    window.quizGenerator = new window.QuizGenerator();
                    console.log('✅ QuizGenerator initialized');
                } else {
                    console.warn('QuizGenerator class not found - may load later');
                }

            } catch (error) {
                console.error('❌ Quiz Generator initialization failed:', error);
                console.error('Error details:', error.stack);
            }

            // Mark initialization as complete
            document.body.classList.add('app-initialized');
            
            // Show welcome message for first-time users
            showWelcomeMessageIfFirstVisit();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showErrorMessage('Application failed to initialize. Please reload the page.');
            return;
        }
        
        console.log('MBLEX Application Ready!');
        
        // Announce readiness for screen readers
        setTimeout(() => {
            announceToScreenReader('MBLEX preparation platform loaded and ready');
        }, 1000);
    };
    
    // Initialize app immediately
    initApp();

    // Handle URL hash navigation
    const handleHashNavigation = () => {
        const hash = window.location.hash.substring(1); // Remove #
        console.log('Hash navigation detected:', hash);

        if (hash && window.uiManager) {
            // Map of valid screen hashes
            const validScreens = [
                'mainStartScreen',
                'studyScreen',
                'testScreen',
                'simulationScreen',
                'aiTutorScreen'
            ];

            if (validScreens.includes(hash)) {
                console.log('Navigating to screen from hash:', hash);
                window.uiManager.navigateToScreen(hash);
            }
        }
    };

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    // Handle initial hash on page load (after initialization)
    setTimeout(() => {
        console.log('🔍 DEBUGGING: Checking Quiz Generator initialization');
        console.log('quizGenerator available:', !!window.quizGenerator);
        console.log('secureStorage available:', !!window.secureStorage);

        const quizSetup = document.getElementById('quizSetup');
        console.log('quizSetup element:', quizSetup);
        console.log('Quiz Generator loaded:', !!window.QuizGenerator);

        handleHashNavigation();
    }, 1000);
    
    /**
     * Global error handling
     * Catches any unhandled errors in the application
     */
    window.addEventListener('error', function(event) {
        console.error('Application Error:', event.error);
        
        // Don't show error message for minor issues
        if (event.error && event.error.message && !event.error.message.includes('ResizeObserver')) {
            showErrorMessage('An error occurred. The application may not function properly.');
        }
    });
    
    /**
     * Handle unhandled promise rejections
     */
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Only show user-facing error for critical rejections
        if (event.reason && event.reason.critical) {
            showErrorMessage('An unexpected error occurred.');
        }
    });
    
    /**
     * Performance monitoring
     * Track page load times and performance metrics
     */
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log(`MBLEX App loaded in ${Math.round(loadTime)}ms`);
            
            // Log detailed performance metrics
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                console.log('Performance Metrics:', {
                    pageLoad: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                    firstPaint: getFirstPaint()
                });
            }
        });
    }
    
    /**
     * Network connection monitoring
     * Detect and handle offline/online states
     */
    if ('navigator' in window && 'connection' in navigator) {
        const connection = navigator.connection;
        console.log('Network Information:', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
        });
        
        // Warn on slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            showToast('Slow network detected. Application may load slowly.', 5000);
        }
    }
    
    /**
     * Online/offline event listeners
     */
    window.addEventListener('online', function() {
        hideOfflineMessage();
        console.log('Connection restored');
        showToast('Connection restored', 2000, 'success');
    });
    
    window.addEventListener('offline', function() {
        showOfflineMessage();
        console.log('Connection lost - running in offline mode');
    });
    
    /**
     * Page visibility handling
     * Pause/resume features when page is hidden/visible
     */
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page is hidden - pause any audio
            console.log('Page hidden');
            if (window.audioManager && window.audioManager.isPlaying) {
                window.audioManager.stopMusic();
            }
        } else {
            // Page is visible again
            console.log('Page visible');
            if (window.audioManager && !window.audioManager.audioMuted) {
                window.audioManager.startMusicForSection(window.audioManager.currentSection || 'main');
            }
        }
    });
});

/**
 * Error display system
 * Shows user-friendly error messages with recovery options
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message-overlay';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
        </div>
    `;
    
    // Apply styles directly for immediate display
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        animation: fadeIn 0.3s ease;
    `;
    
    const errorContent = errorDiv.querySelector('.error-content');
    errorContent.style.cssText = `
        background: #e74c3c;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
        animation: slideInDown 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Offline message display
 * Shows banner when connection is lost
 */
function showOfflineMessage() {
    let offlineMsg = document.getElementById('offline-message');
    if (!offlineMsg) {
        offlineMsg = document.createElement('div');
        offlineMsg.id = 'offline-message';
        offlineMsg.innerHTML = `
            <div class="offline-content">
                📡 No internet connection. Some features may be limited.
            </div>
        `;
        offlineMsg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f39c12;
            color: white;
            text-align: center;
            padding: 0.5rem;
            z-index: 9999;
            font-weight: 600;
            animation: slideInDown 0.3s ease;
        `;
        document.body.appendChild(offlineMsg);
    }
    offlineMsg.style.display = 'block';
}

function hideOfflineMessage() {
    const offlineMsg = document.getElementById('offline-message');
    if (offlineMsg) {
        offlineMsg.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => {
            offlineMsg.style.display = 'none';
        }, 300);
    }
}

/**
 * Toast notification system
 * Shows temporary messages to the user
 */
function showToast(message, duration = 3000, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Color based on type
    const colors = {
        info: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        max-width: 300px;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * First visit detection and welcome message
 */
function showWelcomeMessageIfFirstVisit() {
    const hasVisited = window.secureStorage.getItem('app-visited', false);
    if (!hasVisited) {
        setTimeout(() => {
            showToast('Welcome to MBLEX Prep! Explore the four learning areas to get started.', 5000, 'success');
            window.secureStorage.setItem('app-visited', true);
        }, 2000);
    }
}

/**
 * Get first paint metrics
 */
function getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
}

/**
 * Screen reader announcements for accessibility
 */
function announceToScreenReader(message) {
    const announcements = document.getElementById('announcements');
    if (announcements) {
        announcements.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            announcements.textContent = '';
        }, 1000);
    }
}

/**
 * Global application API and debugging utilities
 */
window.MBLEXApp = {
    version: '1.0.0',
    
    // Public API
    getUIManager: () => window.uiManager,
    getAudioManager: () => window.audioManager,
    getChatbotManager: () => window.chatbotManager,
    getCurrentUser: getCurrentUser,
    
    // Navigation helpers
    navigateToStudy: () => window.uiManager?.navigateToScreen('studyScreen'),
    navigateToTest: () => window.uiManager?.navigateToScreen('testScreen'),
    navigateToSimulation: () => window.uiManager?.navigateToScreen('simulationScreen'),
    navigateToChatbot: () => window.uiManager?.navigateToScreen('aiTutorScreen'),
    navigateToMain: () => window.uiManager?.navigateToMainMenu(),
    
    // Debug utilities
    getDebugInfo: () => {
        return {
            version: window.MBLEXApp.version,
            initialized: document.body.classList.contains('app-initialized'),
            currentScreen: window.uiManager?.getCurrentScreen(),
            audio: window.audioManager?.getDebugInfo(),
            chatbot: window.chatbotManager?.getStatus(),
            user: 'User info available via getCurrentUser()',
            performance: {
                loadTime: performance.now(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
                } : 'not available'
            },
            network: navigator.onLine ? 'online' : 'offline'
        };
    },
    
    // Utility functions
    showToast: showToast,
    showError: showErrorMessage
};

// Developer console welcome message
console.log(`
🎓 MBLEX Preparation Platform v${window.MBLEXApp.version}
Type MBLEXApp.getDebugInfo() for debug information
Type MBLEXApp.navigateToStudy() to go to study area
Type MBLEXApp.navigateToTest() to go to test generator
Type MBLEXApp.navigateToSimulation() to go to simulations
Type MBLEXApp.navigateToChatbot() to go to AI tutor
`);

// Global keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+M for main menu
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        window.MBLEXApp.navigateToMain();
    }
    
    // Ctrl+1-4 for direct navigation
    if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const screens = ['studyScreen', 'testScreen', 'simulationScreen', 'aiTutorScreen'];
        const index = parseInt(e.key) - 1;
        window.uiManager?.navigateToScreen(screens[index]);
    }
});