/**
 * MBLEX Study System
 * Handles the 7 MBLEX content areas and navigation between study screens
 */

class StudySystem {
    constructor() {
        this.currentArea = null;
        this.mblexAreas = [];
        
        this.init();
    }

    init() {
        this.loadMblexAreas();
        this.setupEventListeners();
        
        // Listen for when the study screen is shown
        document.addEventListener('authenticationComplete', () => {
            // Render cards once authentication is complete
            setTimeout(() => {
                this.renderStudyAreaCards();
            }, 100);
        });

        // Also render on DOM ready as fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.renderStudyAreaCards();
                }, 100);
            });
        } else {
            setTimeout(() => {
                this.renderStudyAreaCards();
            }, 100);
        }
        
        console.log('MBLEX Study System initialized');
    }

    /**
     * Load the 7 MBLEX content areas with exam percentages
     */
    loadMblexAreas() {
        this.mblexAreas = [
            {
                id: 'anatomy_physiology',
                name: 'Anatomy & Physiology',
                percentage: 11,
                icon: '🧍',
                color: '#e74c3c',
                description: 'Body system structures and functions, tissue injury and repair, energetic anatomy concepts'
            },
            {
                id: 'kinesiology',
                name: 'Kinesiology',
                percentage: 12,
                icon: '🦴',
                color: '#3498db',
                description: 'Muscle components, contractions, proprioceptors, joint structure, range of motion'
            },
            {
                id: 'pathology_contraindications',
                name: 'Pathology, Contraindications & Special Populations',
                percentage: 14,
                icon: '⚠️',
                color: '#f39c12',
                description: 'Medical conditions, safety protocols, contraindications, special populations, medications'
            },
            {
                id: 'soft_tissue_benefits',
                name: 'Benefits & Effects of Soft Tissue Manipulation',
                percentage: 15,
                icon: '🤲',
                color: '#2ecc71',
                description: 'Physiological and psychological effects, massage techniques, hot/cold applications, modalities'
            },
            {
                id: 'client_assessment',
                name: 'Client Assessment & Treatment Planning',
                percentage: 17,
                icon: '📋',
                color: '#9b59b6',
                description: 'Session organization, consultation, evaluation, clinical reasoning, treatment strategies'
            },
            {
                id: 'ethics_boundaries',
                name: 'Ethics, Boundaries, Laws & Regulations',
                percentage: 16,
                icon: '⚖️',
                color: '#34495e',
                description: 'Professional conduct, ethical behavior, boundaries, legal compliance, confidentiality'
            },
            {
                id: 'professional_practice',
                name: 'Guidelines for Professional Practice',
                percentage: 15,
                icon: '🏢',
                color: '#1abc9c',
                description: 'Safety practices, hygiene, equipment use, business practices, documentation, terminology'
            }
        ];
    }

    /**
     * Setup event listeners for study system navigation
     */
    setupEventListeners() {
        // Study area cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.study-area-card')) {
                const card = e.target.closest('.study-area-card');
                const areaId = card.dataset.areaId;
                this.navigateToStudyArea(areaId);
            }
        });

        // Learning format cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.format-card')) {
                const card = e.target.closest('.format-card');
                const areaId = card.dataset.area;
                const format = card.dataset.format;
                this.navigateToLearningFormat(areaId, format);
            }
        });

        // Back to study selection buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.back-to-study-selection')) {
                this.backToStudySelection();
            }
        });

        // Back to format selection button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.back-to-format-selection')) {
                this.backToFormatSelection();
            }
        });
    }

    /**
     * Navigate to a specific MBLEX study area
     */
    navigateToStudyArea(areaId) {
        const area = this.mblexAreas.find(a => a.id === areaId);
        if (!area) {
            console.error('Study area not found:', areaId);
            return;
        }

        this.currentArea = area;
        console.log('Navigating to study area:', area.name);

        // Hide all screens (including main screens and other study areas) - use nursing app proven method
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show specific study area screen
        const areaScreen = document.getElementById(`${areaId}Screen`);
        if (areaScreen) {
            areaScreen.classList.add('active');
            // CRITICAL: Reset scroll to top when showing study area screen
            window.scrollTo(0, 0);
        }

        // Update UI manager navigation history
        if (window.uiManager) {
            window.uiManager.currentScreen = `${areaId}Screen`;
            window.uiManager.navigationHistory.push(`${areaId}Screen`);
            window.uiManager.updateNavigationControls(`${areaId}Screen`);
            
            // Update browser history
            history.pushState({ screen: `${areaId}Screen` }, '', `#${areaId}Screen`);
        }

        // Update audio for study section
        if (window.audioManager) {
            window.audioManager.startMusicForSection('study');
        }

        // Announce to screen reader
        this.announceScreenChange(area.name);
    }

    /**
     * Navigate to a specific learning format within a study area
     */
    async navigateToLearningFormat(areaId, format) {
        const area = this.mblexAreas.find(a => a.id === areaId);
        if (!area) {
            console.error('Study area not found:', areaId);
            return;
        }

        console.log(`Navigating to ${format} format for ${area.name}`);
        
        // Store current context for back navigation
        this.currentArea = area;
        this.currentFormat = format;

        const formatNames = {
            'reading': 'Reading Materials',
            'images': 'Image Gallery',
            'videos': 'Video Library'
        };

        if (format === 'reading') {
            // Navigate to content display screen
            this.showContentScreen(area, format);
            
            // Load content using ContentManager
            try {
                const content = await window.contentManager.getReadingContent(areaId);
                this.displayContent(area, format, content);
            } catch (error) {
                console.error('Failed to load content:', error);
                this.showContentError(error.message);
            }
        } else {
            // For images and videos, show placeholder for now
            const message = `Loading ${formatNames[format]} for ${area.name}...\n\nThis feature will contain:\n- ${formatNames[format]} specific to ${area.name}\n- Interactive study materials\n- Progress tracking\n\nCurrently in development.`;
            alert(message);
        }
    }

    /**
     * Show the content display screen
     */
    showContentScreen(area, format) {
        const formatNames = {
            'reading': 'Reading Materials',
            'images': 'Image Gallery', 
            'videos': 'Video Library'
        };

        // Hide all screens - use nursing app proven method
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show content display screen - use nursing app proven method
        const contentScreen = document.getElementById('contentDisplayScreen');
        if (contentScreen) {
            contentScreen.classList.add('active');
            // Reset scroll to top when showing content
            window.scrollTo(0, 0);
        }

        // Update header
        const titleElement = document.getElementById('contentTitle');
        const subtitleElement = document.getElementById('contentSubtitle');
        if (titleElement) {
            titleElement.textContent = `${area.icon} ${area.name}`;
        }
        if (subtitleElement) {
            subtitleElement.textContent = `${formatNames[format]} • ${area.percentage}% of MBLEX exam`;
        }

        // Show loading state
        this.showContentLoading();

        // Update UI manager state
        if (window.uiManager) {
            window.uiManager.currentScreen = 'contentDisplayScreen';
            window.uiManager.updateNavigationControls('contentDisplayScreen');
            
            // Update browser history
            history.pushState({ 
                screen: 'contentDisplayScreen', 
                area: area.id, 
                format: format 
            }, '', `#${area.id}_${format}`);
        }

        // Update audio for study section
        if (window.audioManager) {
            window.audioManager.startMusicForSection('study');
        }
    }

    /**
     * Display loaded content
     */
    displayContent(area, format, content) {
        // Hide loading
        this.hideContentLoading();

        // Process and display content
        const contentBody = document.getElementById('contentBody');
        if (contentBody) {
            const processedContent = window.contentManager.processMarkdown(content);
            console.log('Processed content (first 500 chars):', processedContent.substring(0, 500));
            contentBody.innerHTML = processedContent;
        }

        // Show content container
        const contentContainer = document.getElementById('contentContainer');
        if (contentContainer) {
            contentContainer.style.display = 'block';
        }

        console.log(`Content displayed for ${area.name} ${format}`);
    }

    /**
     * Show content loading state
     */
    showContentLoading() {
        const loadingElement = document.getElementById('contentLoading');
        const containerElement = document.getElementById('contentContainer');
        const errorElement = document.getElementById('contentError');

        if (loadingElement) loadingElement.style.display = 'block';
        if (containerElement) containerElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
    }

    /**
     * Hide content loading state
     */
    hideContentLoading() {
        const loadingElement = document.getElementById('contentLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Show content error state
     */
    showContentError(message) {
        const loadingElement = document.getElementById('contentLoading');
        const containerElement = document.getElementById('contentContainer');
        const errorElement = document.getElementById('contentError');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (containerElement) containerElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
    }


    /**
     * Clean up contentDisplayScreen content and state
     */
    cleanupContentDisplay() {
        console.log('Cleaning up content display screen');
        
        // Clear injected content
        const contentBody = document.getElementById('contentBody');
        if (contentBody) {
            contentBody.innerHTML = '';
        }
        
        // Reset all content display elements
        const contentContainer = document.getElementById('contentContainer');
        const loadingElement = document.getElementById('contentLoading');
        const errorElement = document.getElementById('contentError');
        
        if (contentContainer) contentContainer.style.display = 'none';
        if (loadingElement) loadingElement.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
        
        console.log('Content display screen cleaned up');
    }

    /**
     * Go back to the main study area selection
     */
    backToStudySelection() {
        this.cleanupContentDisplay(); // Clean up before navigation
        console.log('Returning to study area selection');

        // Hide all screens first - use nursing app proven method
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show main study screen - use nursing app proven method
        const mainStudyScreen = document.getElementById('studyScreen');
        if (mainStudyScreen) {
            mainStudyScreen.classList.add('active');
            // Reset scroll when returning to study selection
            window.scrollTo(0, 0);
        }

        this.currentArea = null;

        // Update UI manager state
        if (window.uiManager) {
            window.uiManager.currentScreen = 'studyScreen';
            window.uiManager.updateNavigationControls('studyScreen');
            
            // Update browser history
            history.pushState({ screen: 'studyScreen' }, '', '#studyScreen');
        }

        // Update audio for study section
        if (window.audioManager) {
            window.audioManager.startMusicForSection('study');
        }

        // Announce to screen reader
        this.announceScreenChange('Study Areas Selection');
    }

    /**
     * Go back to the format selection for current area
     */
    backToFormatSelection() {
        if (!this.currentArea) {
            console.warn('No current area set for back navigation');
            this.backToStudySelection();
            return;
        }

        console.log(`Returning to format selection for ${this.currentArea.name}`);

        // Navigate back to the study area screen
        this.navigateToStudyArea(this.currentArea.id);
    }

    /**
     * Render the study area selection cards
     */
    renderStudyAreaCards() {
        const container = document.getElementById('studyAreasContainer');
        if (!container) return;

        let html = '<div class="study-areas-grid">';
        
        this.mblexAreas.forEach(area => {
            html += `
                <div class="study-area-card" data-area-id="${area.id}">
                    <div class="study-area-header" style="border-left: 4px solid ${area.color}">
                        <div class="study-area-icon">${area.icon}</div>
                        <div class="study-area-info">
                            <h3 class="study-area-name">${area.name}</h3>
                            <div class="study-area-percentage">${area.percentage}% of exam</div>
                        </div>
                    </div>
                    <p class="study-area-description">${area.description}</p>
                    <div class="study-area-footer">
                        <button class="btn btn-primary btn-small">
                            Study This Area
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Get current study area information
     */
    getCurrentArea() {
        return this.currentArea;
    }

    /**
     * Get all MBLEX areas
     */
    getAllAreas() {
        return [...this.mblexAreas];
    }

    /**
     * Get area by ID
     */
    getAreaById(areaId) {
        return this.mblexAreas.find(a => a.id === areaId);
    }

    /**
     * Announce screen changes for accessibility
     */
    announceScreenChange(message) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            announcements.textContent = `${message} loaded`;
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            currentArea: this.currentArea?.name || 'None',
            totalAreas: this.mblexAreas.length,
            areasLoaded: this.mblexAreas.map(a => a.name)
        };
    }
}

// Create global instance
window.studySystem = new StudySystem();