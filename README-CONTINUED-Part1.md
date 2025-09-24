# Educational Web App Template - Advanced Implementation (Continued)

This document continues from the main README.md and covers additional components, advanced features, and implementation details not included in the first document.

## Table of Contents
1. [Application Initialization & Error Handling](#application-initialization--error-handling)
2. [UI Manager System](#ui-manager-system)
3. [Game Engine for Simulations](#game-engine-for-simulations)
4. [Study System Implementation](#study-system-implementation)
5. [AI Chatbot Integration](#ai-chatbot-integration)
6. [Advanced HTML Components](#advanced-html-components)
7. [Utility Functions Library](#utility-functions-library)
8. [Additional CSS Components](#additional-css-components)
9. [Modal System](#modal-system)
10. [Performance Optimization](#performance-optimization)
11. [Content Data Structure](#content-data-structure)
12. [Debugging and Development Tools](#debugging-and-development-tools)

## Application Initialization & Error Handling

### Complete app.js Implementation

```javascript
/**
 * Main Application Controller
 * Handles initialization, error handling, and global utilities
 */

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application - DOM ready, waiting for authentication...');
    
    /**
     * Initialize main application after authentication
     * This runs AFTER the user has successfully logged in
     */
    const initApp = () => {
        console.log('User authenticated - initializing main application');
        
        // Check if all required elements exist
        const requiredElements = [
            'mainStartScreen', 
            'studyScreen', 
            'simulationScreen', 
            'resultsScreen',
            'resourceScreen'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements);
            showErrorMessage('Application initialization failed. Please reload the page.');
            return;
        }
        
        // Check if content is loaded
        if (typeof APP_CONTENT === 'undefined' || !APP_CONTENT.length) {
            console.error('Application content not loaded');
            showErrorMessage('Content failed to load. Please reload the page.');
            return;
        }
        
        console.log(`Loaded ${APP_CONTENT.length} content items`);
        
        // Initialize UI Manager
        try {
            window.uiManager = new UIManager(gameEngine);
            console.log('UI Manager successfully initialized');
            
            // Mark initialization as complete
            document.body.classList.add('app-initialized');
            
            // Show welcome message for first-time users
            showWelcomeMessageIfFirstVisit();
            
        } catch (error) {
            console.error('Failed to initialize UI Manager:', error);
            showErrorMessage('Application failed to initialize. Please reload the page.');
            return;
        }
        
        console.log('Application Ready!');
        
        // Announce readiness for screen readers
        setTimeout(() => {
            announceToScreenReader('Application loaded and ready');
        }, 1000);
    };
    
    /**
     * Listen for authentication completion
     * Auth0 will fire this event when login is successful
     */
    document.addEventListener('authenticationComplete', (event) => {
        console.log('Authentication complete event received:', event.detail);
        initApp();
    });
    
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
            console.log(`Application loaded in ${Math.round(loadTime)}ms`);
            
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
        showToast('Connection restored', 2000);
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
            // Page is hidden - pause any timers or animations
            console.log('Page hidden');
            if (window.gameEngine && window.gameEngine.isPlaying) {
                window.gameEngine.pauseGame();
            }
        } else {
            // Page is visible again
            console.log('Page visible');
            if (window.gameEngine && window.gameEngine.isPaused) {
                window.gameEngine.resumeGame();
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
        info: '#2c3e50',
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
    const hasVisited = localStorage.getItem('appVisited');
    if (!hasVisited) {
        setTimeout(() => {
            showToast('Welcome! Explore the features to get started.', 5000, 'success');
            localStorage.setItem('appVisited', 'true');
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
window.AppFramework = {
    version: '2.0.0',
    
    // Public API
    getUIManager: () => window.uiManager,
    getGameEngine: () => window.gameEngine,
    getAudioManager: () => window.audioManager,
    
    // Debug utilities
    getDebugInfo: () => {
        return {
            version: window.AppFramework.version,
            initialized: document.body.classList.contains('app-initialized'),
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
    
    // Export application data
    exportData: () => {
        const data = {
            version: window.AppFramework.version,
            userPreferences: localStorage.getItem('userPreferences'),
            progress: localStorage.getItem('userProgress'),
            timestamp: new Date().toISOString()
        };
        
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        return 'Data exported';
    },
    
    // Performance test
    testPerformance: () => {
        const startTime = performance.now();
        const iterations = 1000;
        
        // Test DOM operations
        for (let i = 0; i < iterations; i++) {
            const div = document.createElement('div');
            div.textContent = 'Test';
            document.body.appendChild(div);
            document.body.removeChild(div);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        console.log(`Performance Test: ${iterations} DOM operations in ${Math.round(totalTime)}ms`);
        console.log(`Average time per operation: ${(totalTime / iterations).toFixed(3)}ms`);
        
        return {
            iterations,
            totalTime: Math.round(totalTime),
            averageTime: parseFloat((totalTime / iterations).toFixed(3))
        };
    },
    
    // Check system compatibility
    checkCompatibility: () => {
        const compatibility = {
            localStorage: typeof Storage !== 'undefined',
            eventListeners: typeof EventTarget !== 'undefined',
            css3: 'CSS' in window && 'supports' in CSS,
            es6: typeof Map !== 'undefined' && typeof Set !== 'undefined',
            promises: typeof Promise !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            touch: 'ontouchstart' in window,
            mobile: /Mobi|Android/i.test(navigator.userAgent),
            browser: navigator.userAgent
        };
        
        console.log('Compatibility Check:', compatibility);
        return compatibility;
    }
};

// Developer console welcome message
console.log(`
🎓 Educational App Framework v${window.AppFramework.version}
Type AppFramework.getDebugInfo() for debug information
Type AppFramework.testPerformance() to run performance test
Type AppFramework.checkCompatibility() to check browser support
Type AppFramework.exportData() to export user data
`);
```

## UI Manager System

### Complete UIManager Class Implementation

```javascript
/**
 * UIManager Class
 * Handles all UI interactions, screen management, and user feedback
 */
class UIManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentScreen = 'start';
        this.elements = {};
        this.modals = {};
        this.animations = true; // Can be disabled for performance
        
        this.init();
        this.setupEventListeners();
    }

    /**
     * Initialize UI Manager
     */
    init() {
        this.cacheElements();
        this.setupGameEventListeners();
        this.initializeModals();
        this.initializeAccessibility();
        console.log('UI Manager initialized');
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        // Main screens
        this.elements.screens = {
            loading: document.getElementById('loadingScreen'),
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            results: document.getElementById('resultsScreen'),
            study: document.getElementById('studyScreen'),
            resource: document.getElementById('resourceScreen')
        };

        // Navigation elements
        this.elements.nav = {
            backButton: document.getElementById('globalBackButton'),
            backArrow: document.getElementById('globalBackArrow'),
            menuButton: document.getElementById('menuButton')
        };

        // Game elements
        this.elements.game = {
            title: document.getElementById('scenarioTitle'),
            currentStep: document.getElementById('currentStep'),
            totalSteps: document.getElementById('totalSteps'),
            score: document.getElementById('currentScore'),
            errors: document.getElementById('errorCount'),
            description: document.getElementById('scenarioDescription'),
            question: document.getElementById('scenarioQuestion'),
            choices: document.getElementById('choicesContainer'),
            feedback: document.getElementById('feedbackCard'),
            continueBtn: document.getElementById('continueButton')
        };

        // Patient information elements
        this.elements.patient = {
            card: document.getElementById('patientCard'),
            image: document.getElementById('patientImage'),
            name: document.getElementById('patientName'),
            age: document.getElementById('patientAge'),
            gender: document.getElementById('patientGender'),
            room: document.getElementById('patientRoom'),
            presentation: document.getElementById('patientPresentation')
        };

        // Vital signs
        this.elements.vitals = {
            bp: document.getElementById('vitalBP'),
            hr: document.getElementById('vitalHR'),
            rr: document.getElementById('vitalRR'),
            temp: document.getElementById('vitalTemp'),
            o2: document.getElementById('vitalO2'),
            pain: document.getElementById('vitalPain')
        };

        // Results elements
        this.elements.results = {
            score: document.getElementById('finalScore'),
            grade: document.getElementById('gradeDisplay'),
            interventions: document.getElementById('totalInterventions'),
            correct: document.getElementById('correctResponses'),
            errors: document.getElementById('totalErrors'),
            time: document.getElementById('timeSpent'),
            summary: document.getElementById('performanceSummary'),
            playAgain: document.getElementById('playAgainButton'),
            review: document.getElementById('reviewAnswersButton')
        };

        // Modal elements
        this.elements.modals = {
            about: document.getElementById('aboutModal'),
            review: document.getElementById('reviewModal'),
            share: document.getElementById('shareModal'),
            exit: document.getElementById('exitConfirmModal')
        };

        // Accessibility
        this.elements.announcements = document.getElementById('announcements');
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Navigation
        this.elements.nav.backButton?.addEventListener('click', () => this.navigateBack());
        this.elements.nav.backArrow?.addEventListener('click', () => this.navigateToPrevious());
        this.elements.nav.menuButton?.addEventListener('click', () => this.showMenu());

        // Game controls
        this.elements.game.continueBtn?.addEventListener('click', () => this.continueGame());

        // Results screen
        this.elements.results.playAgain?.addEventListener('click', () => this.restartGame());
        this.elements.results.review?.addEventListener('click', () => this.showReviewModal());

        // Modal close buttons
        document.querySelectorAll('.modal .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Touch gestures for mobile
        if ('ontouchstart' in window) {
            this.setupTouchGestures();
        }

        // Window resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Setup game engine event listeners
     */
    setupGameEventListeners() {
        if (this.game) {
            this.game.on('gameStarted', (data) => this.handleGameStarted(data));
            this.game.on('choiceMade', (data) => this.handleChoiceMade(data));
            this.game.on('stepAdvanced', (data) => this.handleStepAdvanced(data));
            this.game.on('gameCompleted', (data) => this.handleGameCompleted(data));
            this.game.on('gameReset', () => this.handleGameReset());
        }
    }

    /**
     * Screen management
     */
    showScreen(screenName, transition = true) {
        const screens = this.elements.screens;
        
        // Hide all screens
        Object.values(screens).forEach(screen => {
            if (screen) {
                if (transition && this.animations) {
                    screen.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        screen.style.display = 'none';
                        screen.classList.remove('active');
                    }, 300);
                } else {
                    screen.style.display = 'none';
                    screen.classList.remove('active');
                }
            }
        });

        // Show target screen
        const targetScreen = screens[screenName];
        if (targetScreen) {
            setTimeout(() => {
                targetScreen.style.display = 'flex';
                targetScreen.classList.add('active');
                if (transition && this.animations) {
                    targetScreen.style.animation = 'fadeIn 0.3s ease';
                }
                this.currentScreen = screenName;
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Update navigation visibility
                this.updateNavigation(screenName);
                
                // Announce to screen reader
                this.announceScreenChange(screenName);
            }, transition ? 300 : 0);
        }
    }

    /**
     * Modal management
     */
    showModal(modalId) {
        const modal = this.elements.modals[modalId] || document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            if (this.animations) {
                modal.style.animation = 'fadeIn 0.3s ease';
            }
            
            // Focus management for accessibility
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Trap focus within modal
            this.trapFocus(modal);
        }
    }

    hideModal(modalId) {
        const modal = this.elements.modals[modalId] || document.getElementById(modalId);
        if (modal) {
            if (this.animations) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }, 300);
            } else {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            
            // Release focus trap
            this.releaseFocusTrap();
        }
    }

    /**
     * Game event handlers
     */
    handleGameStarted(data) {
        this.showScreen('game');
        this.updateGameDisplay(data);
    }

    handleChoiceMade(data) {
        this.showFeedback(data);
    }

    handleStepAdvanced(data) {
        this.updateGameDisplay(data);
        this.hideFeedback();
    }

    handleGameCompleted(data) {
        this.showResults(data);
    }

    handleGameReset() {
        this.clearGameDisplay();
    }

    /**
     * Update game display with current data
     */
    updateGameDisplay(data) {
        const { scenario, step, score, errors } = data;
        
        // Update header
        if (this.elements.game.title) {
            this.elements.game.title.textContent = scenario.title;
        }
        
        // Update progress
        if (this.elements.game.currentStep) {
            this.elements.game.currentStep.textContent = step.index + 1;
        }
        if (this.elements.game.totalSteps) {
            this.elements.game.totalSteps.textContent = scenario.totalSteps;
        }
        
        // Update score
        if (this.elements.game.score) {
            this.elements.game.score.textContent = Math.round(score);
        }
        if (this.elements.game.errors) {
            this.elements.game.errors.textContent = errors;
        }
        
        // Update patient info
        this.updatePatientInfo(scenario.patient);
        
        // Update vitals
        this.updateVitals(scenario.vitals);
        
        // Update question
        if (this.elements.game.description) {
            this.elements.game.description.textContent = step.description;
        }
        if (this.elements.game.question) {
            this.elements.game.question.textContent = step.question;
        }
        
        // Update choices
        this.updateChoices(step.choices);
    }

    /**
     * Update patient information display
     */
    updatePatientInfo(patient) {
        if (!patient) return;
        
        const elements = this.elements.patient;
        
        if (elements.image && patient.image) {
            elements.image.src = patient.image;
            elements.image.style.display = 'block';
        }
        
        if (elements.name) elements.name.textContent = patient.name || 'Unknown';
        if (elements.age) elements.age.textContent = patient.age || '-';
        if (elements.gender) elements.gender.textContent = patient.gender || '-';
        if (elements.room) elements.room.textContent = patient.room || '-';
        if (elements.presentation) {
            elements.presentation.textContent = patient.presentation || 'No data available';
        }
    }

    /**
     * Update vital signs display
     */
    updateVitals(vitals) {
        if (!vitals) return;
        
        const elements = this.elements.vitals;
        
        if (elements.bp) elements.bp.textContent = vitals.bp || '-';
        if (elements.hr) elements.hr.textContent = vitals.hr || '-';
        if (elements.rr) elements.rr.textContent = vitals.rr || '-';
        if (elements.temp) elements.temp.textContent = vitals.temp || '-';
        if (elements.o2) elements.o2.textContent = vitals.o2 || '-';
        if (elements.pain) elements.pain.textContent = vitals.pain || '-';
    }

    /**
     * Update choices display
     */
    updateChoices(choices) {
        const container = this.elements.game.choices;
        if (!container) return;
        
        container.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.dataset.choiceId = choice.id;
            
            // Add keyboard navigation
            button.setAttribute('tabindex', '0');
            button.setAttribute('aria-label', `Choice ${index + 1}: ${choice.text}`);
            
            button.addEventListener('click', () => {
                this.selectChoice(choice.id);
            });
            
            container.appendChild(button);
        });
    }

    /**
     * Handle choice selection
     */
    selectChoice(choiceId) {
        // Disable all choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Notify game engine
        if (this.game) {
            this.game.makeChoice(choiceId);
        }
    }

    /**
     * Show feedback for choice
     */
    showFeedback(data) {
        const feedback = this.elements.game.feedback;
        if (!feedback) return;
        
        feedback.classList.remove('hidden');
        feedback.classList.add(data.correct ? 'correct' : 'incorrect');
        
        const title = feedback.querySelector('.feedback-title');
        const text = feedback.querySelector('.feedback-text');
        
        if (title) {
            title.textContent = data.correct ? '✓ Correct!' : '✗ Incorrect';
        }
        if (text) {
            text.textContent = data.rationale;
        }
        
        // Enable continue button
        if (this.elements.game.continueBtn) {
            this.elements.game.continueBtn.disabled = false;
            this.elements.game.continueBtn.focus();
        }
    }

    /**
     * Hide feedback
     */
    hideFeedback() {
        const feedback = this.elements.game.feedback;
        if (feedback) {
            feedback.classList.add('hidden');
            feedback.classList.remove('correct', 'incorrect');
        }
    }

    /**
     * Continue to next step
     */
    continueGame() {
        if (this.game) {
            this.game.nextStep();
        }
    }

    /**
     * Show results screen
     */
    showResults(data) {
        this.showScreen('results');
        
        const elements = this.elements.results;
        
        if (elements.score) {
            elements.score.textContent = `${Math.round(data.score)}%`;
        }
        
        if (elements.grade) {
            elements.grade.textContent = this.calculateGrade(data.score);
        }
        
        if (elements.interventions) {
            elements.interventions.textContent = data.totalInterventions;
        }
        
        if (elements.correct) {
            elements.correct.textContent = data.correctResponses;
        }
        
        if (elements.errors) {
            elements.errors.textContent = data.errors;
        }
        
        if (elements.time) {
            elements.time.textContent = this.formatTime(data.timeSpent);
        }
        
        if (elements.summary) {
            elements.summary.textContent = this.generateSummary(data);
        }
    }

    /**
     * Calculate grade from score
     */
    calculateGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Format time display
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    }

    /**
     * Generate performance summary
     */
    generateSummary(data) {
        const accuracy = (data.correctResponses / data.totalInterventions * 100).toFixed(1);
        
        if (data.score >= 90) {
            return `Excellent performance! You demonstrated strong clinical judgment with ${accuracy}% accuracy.`;
        } else if (data.score >= 80) {
            return `Good job! You showed solid understanding with ${accuracy}% accuracy. Keep practicing to improve further.`;
        } else if (data.score >= 70) {
            return `Fair performance. You got ${accuracy}% correct. Review the material and try again.`;
        } else {
            return `Needs improvement. You scored ${accuracy}% accuracy. Review the concepts and practice more.`;
        }
    }

    /**
     * Restart game
     */
    restartGame() {
        if (this.game) {
            this.game.startGame();
        }
    }

    /**
     * Show review modal with answers
     */
    showReviewModal() {
        this.showModal('review');
        
        const container = document.getElementById('reviewContent');
        if (container && this.game) {
            container.innerHTML = this.game.getUserChoices().map((choice, index) => `
                <div class="review-item ${choice.correct ? 'correct' : 'incorrect'}">
                    <h4>Question ${index + 1}</h4>
                    <p><strong>Your Answer:</strong> ${choice.text}</p>
                    <p><strong>Result:</strong> ${choice.correct ? 'Correct' : 'Incorrect'}</p>
                    <p><strong>Explanation:</strong> ${choice.rationale}</p>
                </div>
            `).join('');
        }
    }

    /**
     * Navigation methods
     */
    navigateBack() {
        // Return to main menu
        window.location.hash = '#mainStartScreen';
        this.showScreen('mainStart');
    }

    navigateToPrevious() {
        // Go back one screen
        window.history.back();
    }

    updateNavigation(screenName) {
        const nav = this.elements.nav;
        
        // Show/hide navigation based on screen
        if (screenName === 'mainStart' || screenName === 'login') {
            if (nav.backButton) nav.backButton.style.display = 'none';
            if (nav.backArrow) nav.backArrow.style.display = 'none';
        } else {
            if (nav.backButton) nav.backButton.style.display = 'block';
            if (nav.backArrow) nav.backArrow.style.display = 'block';
        }
    }

    /**
     * Keyboard navigation
     */
    handleKeyboard(event) {
        // ESC key closes modals
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                this.hideModal(openModal.id);
            }
        }
        
        // Arrow keys for navigation
        if (event.key === 'ArrowLeft' && event.ctrlKey) {
            this.navigateToPrevious();
        }
        
        // Number keys for choices
        if (this.currentScreen === 'game' && !isNaN(event.key)) {
            const choiceIndex = parseInt(event.key) - 1;
            const choices = document.querySelectorAll('.choice-btn');
            if (choices[choiceIndex] && !choices[choiceIndex].disabled) {
                choices[choiceIndex].click();
            }
        }
    }

    /**
     * Touch gesture support
     */
    setupTouchGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe right - go back
                    if (this.currentScreen !== 'mainStart') {
                        this.navigateToPrevious();
                    }
                }
            }
        };
    }

    /**
     * Responsive design handling
     */
    handleResize() {
        const width = window.innerWidth;
        
        // Adjust UI for different screen sizes
        if (width < 768) {
            document.body.classList.add('mobile-view');
            document.body.classList.remove('tablet-view', 'desktop-view');
        } else if (width < 1024) {
            document.body.classList.add('tablet-view');
            document.body.classList.remove('mobile-view', 'desktop-view');
        } else {
            document.body.classList.add('desktop-view');
            document.body.classList.remove('mobile-view', 'tablet-view');
        }
    }

    /**
     * Accessibility features
     */
    initializeAccessibility() {
        // Add ARIA live region for announcements
        if (!this.elements.announcements) {
            const announcer = document.createElement('div');
            announcer.id = 'announcements';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
            this.elements.announcements = announcer;
        }
    }

    announceScreenChange(screenName) {
        const messages = {
            start: 'Start screen loaded',
            game: 'Game screen loaded. Make your choice.',
            results: 'Results screen loaded. Review your performance.',
            study: 'Study screen loaded. Select a topic.',
            resource: 'Resource library loaded.'
        };
        
        const message = messages[screenName] || `${screenName} screen loaded`;
        this.announceToScreenReader(message);
    }

    announceToScreenReader(message) {
        if (this.elements.announcements) {
            this.elements.announcements.textContent = message;
            setTimeout(() => {
                this.elements.announcements.textContent = '';
            }, 100);
        }
    }

    /**
     * Focus management for modals
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        this.focusTrapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };
        
        document.addEventListener('keydown', this.focusTrapHandler);
    }

    releaseFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Remove all event listeners
        document.removeEventListener('keydown', this.handleKeyboard);
        window.removeEventListener('resize', this.handleResize);
        
        // Clear cached elements
        this.elements = {};
        
        // Clear game engine listeners
        if (this.game) {
            this.game.removeAllListeners();
        }
        
        console.log('UI Manager destroyed');
    }
}

// Export for use
window.UIManager = UIManager;
```

## Game Engine for Simulations

### Complete Game Engine Implementation

```javascript
/**
 * Educational Simulation Engine
 * Manages scenarios, scoring, and game state
 */
class SimulationEngine {
    constructor() {
        // Game state
        this.currentScenario = null;
        this.currentStepIndex = 0;
        this.gameState = 'idle'; // idle, playing, paused, completed
        this.startTime = null;
        this.endTime = null;
        
        // Scoring
        this.totalInterventions = 0;
        this.correctResponses = 0;
        this.errors = 0;
        this.score = 100;
        this.userChoices = [];
        
        // Performance tracking
        this.scenarioHistory = [];
        this.timePerStep = [];
        this.currentStepStartTime = null;
        
        // Event system
        this.eventListeners = {};
        
        // Configuration
        this.config = {
            pointsPerError: 10,
            minScore: 0,
            maxScore: 100,
            passingScore: 70
        };
        
        this.init();
    }

    /**
     * Initialize game engine
     */
    init() {
        console.log('Simulation Engine initialized');
        this.loadProgress();
        this.loadScenarios();
    }

    /**
     * Event system for communication with UI
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    removeAllListeners() {
        this.eventListeners = {};
    }

    /**
     * Load scenarios from data
     */
    loadScenarios() {
        // Scenarios would be loaded from your content data
        if (typeof APP_SCENARIOS !== 'undefined') {
            this.scenarios = APP_SCENARIOS;
            console.log(`Loaded ${this.scenarios.length} scenarios`);
        } else {
            console.warn('No scenarios loaded');
            this.scenarios = [];
        }
    }

    /**
     * Game state management
     */
    startGame() {
        this.resetGame();
        this.currentScenario = this.selectRandomScenario();
        
        if (!this.currentScenario) {
            console.error('No scenario available');
            return;
        }
        
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.currentStepIndex = 0;
        this.currentStepStartTime = Date.now();
        
        console.log('Game started with scenario:', this.currentScenario.title);
        
        this.emit('gameStarted', {
            scenario: this.currentScenario,
            step: this.getCurrentStep(),
            score: this.score,
            errors: this.errors
        });
    }

    resetGame() {
        this.currentScenario = null;
        this.currentStepIndex = 0;
        this.gameState = 'idle';
        this.startTime = null;
        this.endTime = null;
        this.totalInterventions = 0;
        this.correctResponses = 0;
        this.errors = 0;
        this.score = 100;
        this.userChoices = [];
        this.timePerStep = [];
        this.currentStepStartTime = null;
        
        console.log('Game reset');
        this.emit('gameReset');
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.emit('gamePaused');
            console.log('Game paused');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.emit('gameResumed');
            console.log('Game resumed');
        }
    }

    /**
     * Scenario selection
     */
    selectRandomScenario() {
        if (!this.scenarios || this.scenarios.length === 0) {
            return null;
        }
        
        // Filter out recently played scenarios
        const availableScenarios = this.scenarios.filter(scenario => 
            !this.scenarioHistory.includes(scenario.id) || 
            this.scenarioHistory.length >= this.scenarios.length
        );
        
        if (availableScenarios.length === 0) {
            // Reset history if all scenarios have been played
            this.scenarioHistory = [];
            return this.selectRandomScenario();
        }
        
        // Select random scenario
        const randomIndex = Math.floor(Math.random() * availableScenarios.length);
        const selectedScenario = this.deepCopy(availableScenarios[randomIndex]);
        
        // Add to history
        this.scenarioHistory.push(selectedScenario.id);
        
        // Limit history size
        if (this.scenarioHistory.length > 10) {
            this.scenarioHistory.shift();
        }
        
        return selectedScenario;
    }

    /**
     * Get current step
     */
    getCurrentStep() {
        if (!this.currentScenario || this.currentStepIndex >= this.currentScenario.steps.length) {
            return null;
        }
        return this.currentScenario.steps[this.currentStepIndex];
    }

    /**
     * Process user choice
     */
    makeChoice(choiceId) {
        if (this.gameState !== 'playing') {
            console.warn('Cannot make choice - game not playing');
            return null;
        }
        
        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            console.error('No current step');
            return null;
        }
        
        // Find the selected choice
        const choice = currentStep.choices.find(c => c.id === choiceId);
        if (!choice) {
            console.error('Invalid choice ID:', choiceId);
            return null;
        }
        
        // Record time spent on this step
        const timeSpent = Date.now() - this.currentStepStartTime;
        this.timePerStep.push(timeSpent);
        
        // Update scoring
        this.totalInterventions++;
        
        if (choice.correct) {
            this.correctResponses++;
        } else {
            this.errors++;
            this.score = Math.max(
                this.config.minScore,
                this.score - this.config.pointsPerError
            );
        }
        
        // Record user choice
        const choiceRecord = {
            stepId: currentStep.id,
            stepIndex: this.currentStepIndex,
            stepTitle: currentStep.title,
            choiceId: choice.id,
            choiceText: choice.text,
            correct: choice.correct,
            rationale: choice.rationale,
            timeSpent: timeSpent
        };
        
        this.userChoices.push(choiceRecord);
        
        // Emit choice made event
        this.emit('choiceMade', {
            ...choiceRecord,
            currentScore: this.score,
            totalErrors: this.errors
        });
        
        console.log(`Choice made: ${choice.text} - ${choice.correct ? 'Correct' : 'Incorrect'}`);
        
        return choiceRecord;
    }

    /**
     * Move to next step
     */
    nextStep() {
        if (this.gameState !== 'playing') {
            return;
        }
        
        this.currentStepIndex++;
        
        // Check if game is complete
        if (this.currentStepIndex >= this.currentScenario.steps.length) {
            this.completeGame();