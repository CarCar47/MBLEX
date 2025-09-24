/**
 * UI Manager
 * Handles screen navigation and UI state management
 */
class UIManager {
    constructor() {
        this.currentScreen = 'mainStartScreen';
        this.navigationHistory = ['mainStartScreen'];
        this.elements = {};
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupGlobalNavigation();
        console.log('UI Manager initialized');
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        // Main screens - use direct ID mapping per README architecture
        this.elements.screens = {
            loadingScreen: document.getElementById('loadingScreen'),
            loginScreen: document.getElementById('loginScreen'), 
            mainStartScreen: document.getElementById('mainStartScreen'),
            studyScreen: document.getElementById('studyScreen'),
            testScreen: document.getElementById('testScreen'),
            simulationScreen: document.getElementById('simulationScreen'),
            simulationGameScreen: document.getElementById('simulationGameScreen'),
            simulationResultsScreen: document.getElementById('simulationResultsScreen'),
            aiTutorScreen: document.getElementById('aiTutorScreen'),
            contentDisplayScreen: document.getElementById('contentDisplayScreen'),
            // Individual study area screens MUST be managed to prevent bleeding
            anatomy_physiologyScreen: document.getElementById('anatomy_physiologyScreen'),
            kinesiologyScreen: document.getElementById('kinesiologyScreen'),
            pathology_contraindicationsScreen: document.getElementById('pathology_contraindicationsScreen'),
            soft_tissue_benefitsScreen: document.getElementById('soft_tissue_benefitsScreen'),
            client_assessmentScreen: document.getElementById('client_assessmentScreen'),
            ethics_boundariesScreen: document.getElementById('ethics_boundariesScreen'),
            professional_practiceScreen: document.getElementById('professional_practiceScreen')
        };
        
        // Debug: Check if simulationGameScreen was found
        console.log('simulationGameScreen element:', this.elements.screens.simulationGameScreen);

        // Navigation elements
        this.elements.nav = {
            backButton: document.getElementById('globalBackButton'),
            backArrow: document.getElementById('globalBackArrow')
        };

        // Card buttons
        this.elements.buttons = {
            study: document.getElementById('studyButton'),
            test: document.getElementById('testButton'),
            simulation: document.getElementById('simulationButton'),
            aiTutor: document.getElementById('aiTutorButton')
        };
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Card button event listeners
        if (this.elements.buttons.study) {
            this.elements.buttons.study.addEventListener('click', () => {
                this.navigateToScreen('studyScreen');
                // Audio manager will handle not restarting if already in this section
                if (window.audioManager) {
                    window.audioManager.startMusicForSection('study');
                }
            });
        }

        if (this.elements.buttons.test) {
            this.elements.buttons.test.addEventListener('click', () => {
                this.navigateToTestScreen();
            });
        }

        if (this.elements.buttons.simulation) {
            this.elements.buttons.simulation.addEventListener('click', () => {
                this.navigateToScreen('simulationScreen');
                // Audio manager will handle not restarting if already in this section
                if (window.audioManager) {
                    window.audioManager.startMusicForSection('simulation');
                }
            });
        }

        if (this.elements.buttons.aiTutor) {
            this.elements.buttons.aiTutor.addEventListener('click', () => {
                this.navigateToScreen('aiTutorScreen');
                // Audio manager will handle not restarting if already in this section
                if (window.audioManager) {
                    window.audioManager.startMusicForSection('chatbot');
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Window resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Setup global navigation
     */
    setupGlobalNavigation() {
        // Global back button (returns to main menu)
        if (this.elements.nav.backButton) {
            this.elements.nav.backButton.addEventListener('click', () => {
                this.navigateToMainMenu();
            });
        }
        
        // Back arrow (goes back one screen)
        if (this.elements.nav.backArrow) {
            this.elements.nav.backArrow.addEventListener('click', () => {
                this.navigateBack();
            });
        }
        
        // Browser back button handling
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.screen) {
                this.showScreen(event.state.screen, false);
            }
        });
    }

    /**
     * Navigate to test screen with module loading checks
     * Implements 2025 best practices for module readiness verification
     */
    async navigateToTestScreen() {
        console.log('🎯 Attempting to navigate to test screen...');

        // Check if module manager is available
        if (!window.moduleManager) {
            console.warn('⚠️ Module manager not available, falling back to direct navigation');
            this.navigateToScreen('testScreen');
            return;
        }

        try {
            // Show immediate loading feedback
            this.showTestScreenLoadingState();

            // Wait for all critical modules to be ready
            const moduleResults = await window.moduleManager.getAllCriticalModulesReady();

            if (moduleResults.allSuccessful) {
                console.log('✅ All modules ready, navigating to test screen');

                // Navigate to test screen
                this.navigateToScreen('testScreen');

                // Start audio for test section
                if (window.audioManager) {
                    window.audioManager.startMusicForSection('test');
                }

                // Clear any loading states
                this.clearTestScreenLoadingState();

            } else {
                console.warn('⚠️ Some modules failed to load:', moduleResults.failed);

                // Show error state with retry option
                this.showTestScreenErrorState(moduleResults);
            }

        } catch (error) {
            console.error('❌ Failed to navigate to test screen:', error);
            this.showTestScreenErrorState({
                allSuccessful: false,
                failed: [{ name: 'unknown', error }],
                successful: [],
                totalModules: 0
            });
        }
    }

    /**
     * Show loading state for test screen navigation
     */
    showTestScreenLoadingState() {
        const testButton = this.elements.buttons.test;
        if (testButton) {
            // Store original content if not already stored
            if (!testButton.dataset.originalContent) {
                testButton.dataset.originalContent = testButton.innerHTML;
            }

            testButton.disabled = true;
            testButton.innerHTML = '🔄 Loading Quiz...';
        }

        // Show progress if possible
        if (window.moduleManager) {
            const progress = window.moduleManager.getLoadingProgress();
            console.log(`📊 Module loading progress: ${progress}%`);

            // You could update a progress bar here if one exists
        }
    }

    /**
     * Clear loading state for test screen
     */
    clearTestScreenLoadingState() {
        const testButton = this.elements.buttons.test;
        if (testButton) {
            testButton.disabled = false;

            // Restore original content if available, otherwise use default
            if (testButton.dataset.originalContent) {
                testButton.innerHTML = testButton.dataset.originalContent;
            } else {
                testButton.innerHTML = 'Take Practice Test';
            }
        }
    }

    /**
     * Show error state with retry option
     */
    showTestScreenErrorState(moduleResults) {
        const testButton = this.elements.buttons.test;
        if (testButton) {
            // Store original content if not already stored
            if (!testButton.dataset.originalContent) {
                testButton.dataset.originalContent = testButton.innerHTML;
            }

            testButton.disabled = false;
            testButton.innerHTML = '⚠️ Quiz Failed - Click to Retry';

            // Add retry functionality
            const retryHandler = () => {
                testButton.removeEventListener('click', retryHandler);
                this.navigateToTestScreen();
            };
            testButton.addEventListener('click', retryHandler);
        }

        // Log detailed error information
        if (moduleResults.failed && moduleResults.failed.length > 0) {
            console.error('Failed modules:', moduleResults.failed.map(f => f.name).join(', '));
        }

        // Auto-retry after 3 seconds
        setTimeout(() => {
            if (window.moduleManager && !window.moduleManager.areAllCriticalModulesLoaded()) {
                console.log('🔄 Auto-retrying module loading...');
                this.navigateToTestScreen();
            }
        }, 3000);
    }

    /**
     * Navigate to a specific screen
     */
    navigateToScreen(screenId, addToHistory = true) {
        console.log(`Navigating to: ${screenId}`);
        console.log('Available screens:', Object.keys(this.elements.screens));
        
        // Clean up contentDisplayScreen if navigating away from it
        if (this.currentScreen === 'contentDisplayScreen' && screenId !== 'contentDisplayScreen') {
            if (window.studySystem && window.studySystem.cleanupContentDisplay) {
                window.studySystem.cleanupContentDisplay();
            }
        }
        
        // Force contentDisplayScreen cleanup on ANY navigation to prevent bleeding
        if (screenId !== 'contentDisplayScreen' && window.studySystem && window.studySystem.cleanupContentDisplay) {
            window.studySystem.cleanupContentDisplay();
        }
        
        // Hide all screens first - use nursing app proven method (CSS classes only)
        Object.values(this.elements.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                // CRITICAL: Remove any inline display styles that might override CSS
                screen.style.removeProperty('display');
            }
        });
        
        // Show target screen using direct ID - no key mapping
        const targetScreen = this.elements.screens[screenId];
        console.log(`Direct navigation to screen: ${screenId}`, targetScreen);
        if (targetScreen) {
            // Show the screen - use nursing app proven method (CSS classes only)
            // CRITICAL: Remove any inline styles first, then add active class
            targetScreen.style.removeProperty('display');
            targetScreen.classList.add('active');
            
            // Add to navigation history
            if (addToHistory && screenId !== this.currentScreen) {
                this.navigationHistory.push(screenId);
                history.pushState({ screen: screenId }, '', `#${screenId}`);
            }
            
            this.currentScreen = screenId;
            
            // Update navigation controls
            this.updateNavigationControls(screenId);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Announce to screen reader
            this.announceScreenChange(screenId);
        } else {
            console.error(`Screen not found: ${screenId}`);
        }
    }


    /**
     * Navigate back one screen
     */
    navigateBack() {
        if (this.navigationHistory.length > 1) {
            this.navigationHistory.pop(); // Remove current screen
            const previousScreen = this.navigationHistory[this.navigationHistory.length - 1];
            this.navigateToScreen(previousScreen, false);
            
            // Update audio for previous section (audio manager will handle not restarting if same section)
            if (window.audioManager) {
                const section = this.getAudioSection(previousScreen);
                window.audioManager.startMusicForSection(section);
            }
        }
    }

    /**
     * Navigate to main menu
     */
    navigateToMainMenu() {
        this.navigationHistory = ['mainStartScreen'];
        this.navigateToScreen('mainStartScreen', false);
        
        // Audio manager will handle not restarting if already in main section
        if (window.audioManager) {
            window.audioManager.startMusicForSection('main');
        }
    }

    /**
     * Get audio section from screen ID
     */
    getAudioSection(screenId) {
        const mapping = {
            'mainStartScreen': 'main',
            'studyScreen': 'study', 
            'testScreen': 'test',
            'simulationScreen': 'simulation',
            'simulationGameScreen': 'simulation',
            'aiTutorScreen': 'chatbot'
        };
        return mapping[screenId] || 'main';
    }

    /**
     * Update visibility of navigation controls
     */
    updateNavigationControls(currentScreen) {
        const backArrow = this.elements.nav.backArrow;
        const backButton = this.elements.nav.backButton;
        
        // Keep navigation buttons always visible (user requested this change)
        // Show/hide based on current screen
        if (currentScreen === 'loginScreen' || currentScreen === 'loadingScreen') {
            backArrow?.classList.add('hidden');
            backButton?.classList.add('hidden');
        } else {
            // Always show navigation buttons on all screens (including main screen)
            backArrow?.classList.remove('hidden');
            backButton?.classList.remove('hidden');
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(event) {
        // ESC key goes back
        if (event.key === 'Escape') {
            if (this.currentScreen !== 'mainStartScreen' && this.currentScreen !== 'loginScreen') {
                this.navigateBack();
            }
        }
        
        // Alt + Home goes to main menu
        if (event.altKey && event.key === 'Home') {
            event.preventDefault();
            this.navigateToMainMenu();
        }
        
        // Number keys for quick navigation from main screen
        if (this.currentScreen === 'mainStartScreen' && !isNaN(event.key)) {
            const num = parseInt(event.key);
            switch (num) {
                case 1:
                    this.elements.buttons.study?.click();
                    break;
                case 2:
                    this.elements.buttons.test?.click();
                    break;
                case 3:
                    this.elements.buttons.simulation?.click();
                    break;
                case 4:
                    this.elements.buttons.aiTutor?.click();
                    break;
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const width = window.innerWidth;
        
        // Add/remove mobile classes
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
        
        // Adjust chatbot iframe height on mobile
        if (this.currentScreen === 'aiTutorScreen') {
            this.adjustChatbotHeight();
        }
    }

    /**
     * Adjust chatbot iframe height for mobile
     */
    adjustChatbotHeight() {
        const iframe = document.getElementById('chatbotIframe');
        const container = document.getElementById('chatbotFrame');
        
        if (iframe && container && window.innerWidth < 768) {
            // On mobile, make iframe take full available height
            const windowHeight = window.innerHeight;
            const headerHeight = document.querySelector('.chatbot-header')?.offsetHeight || 60;
            const instructionsHeight = document.querySelector('.chatbot-instructions')?.offsetHeight || 200;
            
            const availableHeight = windowHeight - headerHeight - instructionsHeight - 40; // 40px for padding
            iframe.style.height = Math.max(300, availableHeight) + 'px';
        }
    }

    /**
     * Announce screen changes for accessibility
     */
    announceScreenChange(screenName) {
        const messages = {
            'mainStartScreen': 'Main menu loaded. Choose your learning path.',
            'studyScreen': 'Study area loaded. Comprehensive MBLEX materials.',
            'testScreen': 'Test generator loaded. Practice MBLEX questions.',
            'simulationScreen': 'Simulation screen loaded. Interactive scenarios.',
            'simulationGameScreen': 'Simulation game started. Interactive scenario in progress.',
            'aiTutorScreen': 'AI Tutor loaded. Ask questions and get help.'
        };
        
        const message = messages[screenName] || `${screenName} loaded`;
        this.announceToScreenReader(message);
    }

    /**
     * Announce to screen reader
     */
    announceToScreenReader(message) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            announcements.textContent = message;
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    /**
     * Show loading state
     */
    showLoading(show = true) {
        const loadingScreen = this.elements.screens.loadingScreen;
        if (loadingScreen) {
            if (show) {
                loadingScreen.classList.add('active');
            } else {
                loadingScreen.classList.remove('active');
            }
        }
    }

    /**
     * Get current screen info
     */
    getCurrentScreen() {
        return {
            current: this.currentScreen,
            history: [...this.navigationHistory],
            canGoBack: this.navigationHistory.length > 1
        };
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            currentScreen: this.currentScreen,
            navigationHistory: [...this.navigationHistory],
            screenElements: Object.keys(this.elements.screens),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768
            }
        };
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboard);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('popstate', this.handlePopstate);
        
        console.log('UI Manager destroyed');
    }
}

// Create global instance
window.uiManager = new UIManager();