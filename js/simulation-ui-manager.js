/**
 * Simulation UI Manager
 * Handles the user interface for MBLEX simulation scenarios
 * Integrates with SimulationEngine to provide interactive gameplay
 */

class SimulationUIManager {
    constructor() {
        this.currentScenario = null;
        this.elements = {};
        this.feedbackModal = null;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupEngineCallbacks();
        
        console.log('Simulation UI Manager initialized');
    }
    
    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        // Main screens
        this.elements.simulationScreen = document.getElementById('simulationScreen');
        this.elements.gameScreen = document.getElementById('simulationGameScreen');
        
        // Debug: Check if elements exist
        console.log('simulationScreen found:', !!this.elements.simulationScreen);
        console.log('simulationGameScreen found:', !!this.elements.gameScreen);
        
        // Welcome screen buttons
        this.elements.startButton = document.getElementById('startRandomScenario');
        this.elements.progressButton = document.getElementById('viewProgress');
        this.elements.resetButton = document.getElementById('resetProgress');
        
        // Game screen elements
        this.elements.scenarioTitle = document.getElementById('scenarioTitle');
        this.elements.scenarioDescription = document.getElementById('scenarioDescription');
        this.elements.currentStep = document.getElementById('currentStep');
        this.elements.totalSteps = document.getElementById('totalSteps');
        this.elements.currentScore = document.getElementById('currentScore');
        this.elements.progressFill = document.getElementById('progressFill');
        
        // Patient and content areas (will be populated)
        this.elements.patientPanel = document.querySelector('.patient-panel');
        this.elements.stepContent = document.querySelector('.step-content');
        this.elements.choicesContainer = document.querySelector('.choices-container');
        this.elements.gameControls = document.querySelector('.game-controls');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start button
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                this.startRandomScenario();
            });
        }
        
        // Progress button
        if (this.elements.progressButton) {
            this.elements.progressButton.addEventListener('click', () => {
                this.showProgressModal();
            });
        }
        
        // Reset button
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => {
                this.showResetConfirmation();
            });
        }
        
        // Setup study area format button handlers
        this.setupStudyAreaHandlers();
    }
    
    /**
     * Setup callbacks with simulation engine
     */
    setupEngineCallbacks() {
        // Wait for game engine to be available
        if (!window.gameEngine) {
            console.log('Waiting for game engine...');
            setTimeout(() => {
                this.setupEngineCallbacks();
            }, 100);
            return;
        }
        
        console.log('=== SETTING UP GAME ENGINE CALLBACKS ===');
        console.log('Game engine available:', !!window.gameEngine);
        console.log('Game engine type:', typeof window.gameEngine);
        console.log('Game engine on method:', typeof window.gameEngine.on);
        
        // Game started event - copied from nursing app pattern
        window.gameEngine.on('gameStarted', (data) => {
            console.log('gameStarted event triggered');
            this.handleGameStarted(data);
        });
        
        // Choice made event - immediate feedback like nursing app
        window.gameEngine.on('choiceMade', (data) => {
            console.log('choiceMade event triggered with data:', data);
            this.handleChoiceMade(data);
        });
        
        // Step advanced event - updated to match nursing pattern
        window.gameEngine.on('stepAdvanced', (data) => {
            console.log('stepAdvanced event triggered');
            this.handleStepAdvanced(data);
        });
        
        // Game completed event - updated to match nursing pattern
        window.gameEngine.on('gameCompleted', (data) => {
            console.log('gameCompleted event triggered');
            this.handleGameCompleted(data);
        });
        
        console.log('Event listeners registered successfully');
    }
    
    /**
     * Start a random scenario
     */
    startRandomScenario() {
        if (!window.gameEngine) {
            console.error('Game engine not available');
            // Show user-friendly message
            alert('Simulation system is still loading. Please try again in a moment.');
            return;
        }
        
        // Start random scenario - updated to match nursing app method
        const success = window.gameEngine.startGame('random');
        if (success) {
            this.switchToGameScreen();
        }
    }
    
    /**
     * Switch from welcome to game screen
     */
    switchToGameScreen() {
        console.log('Switching to game screen...');
        
        // Use direct navigation per README specifications
        if (window.uiManager) {
            window.uiManager.navigateToScreen('simulationGameScreen');
            console.log('Navigated to simulationGameScreen via main UI manager');
        } else {
            console.error('Main UI manager not available');
        }
    }
    
    /**
     * Switch back to welcome screen
     */
    switchToWelcomeScreen() {
        // Use the main UI manager's navigation system
        if (window.uiManager) {
            window.uiManager.navigateToScreen('simulationScreen');
            console.log('Navigated back to simulationScreen via main UI manager');
        } else {
            console.error('Main UI manager not available');
        }
    }
    
    /**
     * Handle game started event
     */
    handleGameStarted(data) {
        this.currentScenario = data.scenario;
        
        // Update header info
        if (this.elements.scenarioTitle) {
            this.elements.scenarioTitle.textContent = data.scenario.title;
        }
        if (this.elements.scenarioDescription) {
            this.elements.scenarioDescription.textContent = data.scenario.category.replace('_', ' ').toUpperCase() + ' • ' + data.scenario.difficulty.toUpperCase();
        }
        if (this.elements.totalSteps) {
            this.elements.totalSteps.textContent = data.totalSteps;
        }
        if (this.elements.currentStep) {
            this.elements.currentStep.textContent = '1';
        }
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = '0';
        }
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = (1/data.totalSteps * 100) + '%';
        }
        
        // Render patient panel
        this.renderPatientPanel(data.scenario.patient, data.scenario.vitals);
        
        // Render first step
        this.renderCurrentStep();
    }
    
    /**
     * Render patient information panel
     */
    renderPatientPanel(patient, vitals) {
        const patientPanelHTML = `
            <div class="patient-panel">
                <div class="patient-header">
                    <div class="patient-photo">
                        <div class="patient-avatar">${patient.gender === 'Female' ? '👩' : '👨'}</div>
                    </div>
                    <div class="patient-details">
                        <h3>${patient.name}</h3>
                        <p><strong>Age:</strong> ${patient.age} • <strong>Gender:</strong> ${patient.gender}</p>
                        <p><strong>Occupation:</strong> ${patient.occupation || 'Not specified'}</p>
                        <p><strong>Chief Complaint:</strong> ${patient.chiefComplaint}</p>
                    </div>
                </div>
                
                ${patient.currentSymptoms ? `
                <div class="patient-symptoms">
                    <h4>Current Symptoms:</h4>
                    <ul>
                        ${patient.currentSymptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="patient-vitals">
                    ${Object.entries(vitals).map(([key, value]) => `
                        <div class="vital-item">
                            <span class="vital-value">${value}</span>
                            <span class="vital-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert patient panel into game screen
        const gameContent = this.elements.gameScreen.querySelector('.game-content');
        if (gameContent) {
            // Remove existing patient panel
            const existingPanel = gameContent.querySelector('.patient-panel');
            if (existingPanel) {
                existingPanel.remove();
            }
            
            // Add new patient panel
            gameContent.insertAdjacentHTML('afterbegin', patientPanelHTML);
        }
    }
    
    /**
     * Render the current step
     */
    renderCurrentStep() {
        const currentStep = window.gameEngine.getCurrentStep();
        if (!currentStep) {
            console.error('No current step to render');
            return;
        }
        
        const stepHTML = `
            <div class="step-content">
                <div class="step-header">
                    <h2>${currentStep.title}</h2>
                    <p>${currentStep.context}</p>
                </div>
                
                <div class="step-question">
                    <h3>${currentStep.question}</h3>
                </div>
                
                <div class="choices-container">
                    ${this.renderRandomizedChoices(currentStep.choices)}
                </div>
                
                <div class="game-controls">
                    <button id="endScenario" class="btn btn-secondary">
                        End Scenario
                    </button>
                </div>
            </div>
        `;
        
        // Insert step content into game screen
        const gameContent = this.elements.gameScreen.querySelector('.game-content');
        if (gameContent) {
            // Remove existing step content
            const existingContent = gameContent.querySelector('.step-content');
            if (existingContent) {
                existingContent.remove();
            }
            
            // Add new step content
            gameContent.insertAdjacentHTML('beforeend', stepHTML);
            
            // Setup direct choice handling like nursing app
            this.setupChoiceHandling();
        }
    }
    
    /**
     * Setup direct choice handling - copied from nursing app pattern
     */
    setupChoiceHandling() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => {
            const choiceId = button.getAttribute('data-choice-id');
            
            // Direct click handling like nursing app
            button.addEventListener('click', () => this.handleChoiceClick(choiceId));
            
            // Keyboard navigation
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleChoiceClick(choiceId);
                }
            });
        });
        
        console.log('Choice handling setup complete');
    }

    /**
     * Handle choice click - immediate processing like nursing app
     */
    handleChoiceClick(choiceId) {
        console.log('Choice clicked:', choiceId);
        
        const result = window.gameEngine.makeChoice(choiceId);
        if (result) {
            this.disableChoices();
            this.highlightSelectedChoice(choiceId);
        }
    }

    /**
     * Disable all choice buttons after selection
     */
    disableChoices() {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
        });
    }

    /**
     * Highlight the selected choice
     */
    highlightSelectedChoice(choiceId) {
        const selectedButton = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
            selectedButton.style.backgroundColor = '#007bff';
            selectedButton.style.color = 'white';
        }
    }

    /**
     * Randomize choice order using Fisher-Yates shuffle algorithm
     * Copied from proven nursing app implementation
     */
    randomizeChoices(choices) {
        // Fisher-Yates shuffle algorithm for proper randomization
        const shuffled = [...choices];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Render choices in randomized order with consistent A,B,C,D labels
     * Preserves original choice IDs for game engine logic
     */
    renderRandomizedChoices(choices) {
        // Randomize the order while preserving original data
        const randomizedChoices = this.randomizeChoices([...choices]);
        const letterLabels = ['A', 'B', 'C', 'D'];
        
        return randomizedChoices.map((choice, index) => `
            <button class="choice-btn" 
                    data-choice-id="${choice.id}" 
                    data-display-letter="${letterLabels[index]}">
                <strong>${letterLabels[index]}.</strong> ${choice.text}
            </button>
        `).join('');
    }

    /**
     * Clean up existing event listeners
     */
    cleanupEventListeners() {
        if (this.eventHandlers) {
            this.eventHandlers.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventHandlers = [];
            console.log('Previous event listeners cleaned up');
        }
    }
    
    /**
     * Setup choice selection interactions
     */
    setupChoiceSelection() {
        console.log('=== Setting up choice selection ===');
        
        // Clear any existing listeners
        this.cleanupEventListeners();
        
        const choices = this.elements.gameScreen.querySelectorAll('.choice-option');
        const submitButton = document.getElementById('submitAnswer');
        const endButton = document.getElementById('endScenario');
        
        console.log('Found choices:', choices.length);
        console.log('Submit button exists:', !!submitButton);
        console.log('End button exists:', !!endButton);
        
        if (!submitButton) {
            console.error('CRITICAL: Submit button not found in DOM');
            return;
        }
        
        // Store selected choice ID in instance variable for proper scope
        this.selectedChoiceId = null;
        
        // Choice selection event listeners
        choices.forEach((choice, index) => {
            const clickHandler = () => {
                console.log(`=== Choice ${index + 1} clicked ===`);
                console.log('Choice ID:', choice.dataset.choiceId);
                
                // Remove previous selection
                choices.forEach(c => c.classList.remove('selected'));
                
                // Select current choice
                choice.classList.add('selected');
                this.selectedChoiceId = choice.dataset.choiceId;
                
                console.log('Selected choice ID set to:', this.selectedChoiceId);
                
                // Enable submit button
                submitButton.disabled = false;
                submitButton.classList.add('enabled');
                console.log('Submit button enabled successfully');
            };
            
            choice.addEventListener('click', clickHandler);
            // Store handler for cleanup
            if (!this.eventHandlers) this.eventHandlers = [];
            this.eventHandlers.push({ element: choice, event: 'click', handler: clickHandler });
        });
        
        // Submit answer event listener
        const submitHandler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('=== SUBMIT BUTTON CLICKED ===');
            console.log('Selected choice ID:', this.selectedChoiceId);
            console.log('Game engine exists:', !!window.gameEngine);
            console.log('Game engine state:', window.gameEngine ? window.gameEngine.gameState : 'N/A');
            console.log('Current scenario:', window.gameEngine ? !!window.gameEngine.currentScenario : 'N/A');
            
            // Disable submit button immediately
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
            }
            
            if (!this.selectedChoiceId) {
                console.error('CRITICAL: No choice selected');
                alert('Please select an answer first!');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Answer';
                }
                return;
            }
            
            if (!window.gameEngine) {
                console.error('CRITICAL: Game engine not available');
                alert('Game engine not available!');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Answer';
                }
                return;
            }
            
            console.log('About to call gameEngine.submitAnswer()...');
            console.log('Callbacks registered:', Object.keys(window.gameEngine.callbacks || {}));
            
            try {
                const result = window.gameEngine.submitAnswer(this.selectedChoiceId);
                console.log('Submit answer result:', result);
                
                if (result === false) {
                    console.error('Submit answer failed!');
                    alert('Failed to submit answer. Please try again.');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Answer';
                    }
                }
                // If result is true, the callback should handle further UI updates
            } catch (error) {
                console.error('Error calling submitAnswer:', error);
                alert('Error submitting answer: ' + error.message);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Answer';
                }
            }
        };
        
        submitButton.addEventListener('click', submitHandler);
        
        // Also add with useCapture for better reliability
        submitButton.addEventListener('click', submitHandler, true);
        
        // Store handler for cleanup
        if (!this.eventHandlers) this.eventHandlers = [];
        this.eventHandlers.push({ element: submitButton, event: 'click', handler: submitHandler });
        
        console.log('Submit button event listener attached successfully');
        
        // End scenario
        if (endButton) {
            endButton.addEventListener('click', () => {
                this.showEndScenarioConfirmation();
            });
        }
    }
    
    /**
     * Handle choice made event
     */
    /**
     * Handle choice made event - immediate feedback like nursing app
     */
    handleChoiceMade(result) {
        console.log('=== HANDLE CHOICE MADE EVENT ===');
        console.log('Choice result:', result);
        
        this.displayFeedback(result);
        this.updateScoreDisplay();
        this.highlightCorrectChoice(result);
        
        console.log('Choice made handling completed');
    }

    /**
     * Display immediate feedback like nursing app
     */
    displayFeedback(result) {
        console.log('Displaying feedback for result:', result);
        
        // Create or show feedback modal
        this.showFeedbackModal(result);
    }

    /**
     * Show feedback modal with choice result
     */
    showFeedbackModal(result) {
        const feedbackClass = result.correct ? 'feedback-correct' : 'feedback-incorrect';
        const feedbackTitle = result.correct ? 'Correct!' : 'Incorrect';
        const feedbackSymbol = result.correct ? '✓' : '✗';
        
        // Create modal HTML - vertical layout with proper colors
        const modalHTML = `
            <div class="modal-overlay active" id="choiceFeedbackModal">
                <div class="modal-content feedback-modal-container">
                    <!-- Top section: Correct/Incorrect with colored background -->
                    <div class="feedback-header ${feedbackClass}">
                        <div class="feedback-symbol">${feedbackSymbol}</div>
                        <h3>${feedbackTitle}</h3>
                    </div>
                    
                    <!-- Middle section: Explanation with white text on dark background -->
                    <div class="feedback-body">
                        <p>${result.rationale || result.choice.rationale}</p>
                    </div>
                    
                    <!-- Bottom section: Continue button -->
                    <div class="feedback-actions">
                        <button class="btn btn-primary" onclick="window.simulationUIManager.continueTreatment()">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing feedback modal
        const existingModal = document.getElementById('choiceFeedbackModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        console.log('Feedback modal displayed');
    }

    /**
     * Continue to next step or complete game
     */
    continueTreatment() {
        // Close feedback modal
        const modal = document.getElementById('choiceFeedbackModal');
        if (modal) {
            modal.remove();
        }
        
        // Advance to next step
        window.gameEngine.advanceStep();
    }

    /**
     * Update score display
     */
    updateScoreDisplay() {
        const progress = window.gameEngine.getProgress();
        if (progress && this.elements.currentScore) {
            this.elements.currentScore.textContent = progress.scorePercentage;
        }
    }

    /**
     * Highlight correct choice after feedback - updated for randomized display
     */
    highlightCorrectChoice(result) {
        // Find and highlight the correct choice using original ID
        const currentStep = window.gameEngine.getCurrentStep();
        if (currentStep) {
            const correctChoice = currentStep.choices.find(c => c.correct);
            if (correctChoice) {
                const button = document.querySelector(`[data-choice-id="${correctChoice.id}"]`);
                if (button) {
                    button.classList.add('correct-choice');
                    button.style.backgroundColor = '#28a745';
                    button.style.color = 'white';
                    button.style.border = '2px solid #155724';
                }
            }
        }
    }
    
    /**
     * Show feedback for choice made
     */
    showChoiceFeedback(data) {
        console.log('=== SHOWING CHOICE FEEDBACK ===');
        console.log('Feedback data:', data);
        
        // Validate data structure
        if (!data || !data.choice) {
            console.error('Invalid feedback data:', data);
            alert('Error: Invalid feedback data received');
            return;
        }
        
        const feedbackHTML = `
            <div class="feedback-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            ">
                <div class="feedback-content" style="
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                ">
                    <div class="feedback-header ${data.correct ? 'correct' : 'incorrect'}">
                        <h2 style="color: ${data.correct ? '#27ae60' : '#e74c3c'}; margin-bottom: 1rem;">
                            ${data.correct ? '✅ Correct!' : '❌ Incorrect'}
                        </h2>
                        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
                            ${data.correct ? 'Well done!' : 'The correct answer was:'}
                        </p>
                    </div>
                    
                    <div class="feedback-rationale" style="
                        text-align: left;
                        background: #f8f9fa;
                        padding: 1.5rem;
                        border-radius: 8px;
                        margin-bottom: 1.5rem;
                        border-left: 4px solid ${data.correct ? '#27ae60' : '#e74c3c'};
                    ">
                        <h4 style="margin-bottom: 0.5rem; color: #2c3e50;">Explanation:</h4>
                        <p style="color: #444; line-height: 1.6; margin: 0;">${data.choice.rationale}</p>
                    </div>
                    
                    <div class="feedback-score" style="margin-bottom: 1.5rem; color: #666;">
                        <p>Current Score: ${data.currentScore}/${data.maxScore} (${Math.round((data.currentScore/data.maxScore)*100)}%)</p>
                    </div>
                    
                    <div class="feedback-actions">
                        <button id="continueGame" class="btn btn-primary" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            font-size: 1.1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: transform 0.2s ease;
                        ">Continue</button>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        document.body.insertAdjacentHTML('beforeend', feedbackHTML);
        
        // Setup continue button
        const continueButton = document.getElementById('continueGame');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.closeFeedbackModal();
            });
            continueButton.addEventListener('mouseenter', () => {
                continueButton.style.transform = 'translateY(-2px)';
            });
            continueButton.addEventListener('mouseleave', () => {
                continueButton.style.transform = 'translateY(0)';
            });
        }
        
        console.log('Feedback modal displayed');
    }
    
    /**
     * Close feedback modal
     */
    closeFeedbackModal() {
        console.log('=== CLOSING FEEDBACK MODAL ===');
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.remove();
            console.log('Feedback modal removed');
        }
        
        // Don't render next step here - let the game engine handle step progression
        // The game engine will call handleStepCompleted() or handleScenarioCompleted()
        console.log('Waiting for game engine to handle step progression...');
    }
    
    /**
     * Handle step advanced event - updated to match nursing pattern
     */
    handleStepAdvanced(data) {
        console.log('=== HANDLE STEP ADVANCED EVENT ===');
        console.log('Step advanced data:', data);
        
        // Render next step
        console.log('Rendering next step...');
        this.renderCurrentStep();
        
        // Update step counter and progress
        const progress = window.gameEngine.getProgress();
        console.log('Current progress:', progress);
        
        if (progress) {
            if (this.elements.currentStep) {
                this.elements.currentStep.textContent = progress.currentStep;
            }
            if (this.elements.progressFill) {
                this.elements.progressFill.style.width = progress.progressPercentage + '%';
            }
        }
        
        console.log('Step advanced handling finished');
    }
    
    /**
     * Handle game completed event - updated to match nursing pattern
     */
    handleGameCompleted(data) {
        console.log('Scenario completed event received:', data);
        setTimeout(() => {
            console.log('Navigating to results screen');
            this.showResultsScreen(data);
        }, 1000);
    }
    
    /**
     * Update progress display
     */
    updateProgressDisplay(progress) {
        if (this.elements.currentStep) {
            this.elements.currentStep.textContent = progress.currentStep;
        }
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = progress.scorePercentage;
        }
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = progress.progressPercentage + '%';
        }
    }
    
    /**
     * Show results screen
     */
    showResultsScreen(results) {
        console.log('Displaying results screen with data:', results);
        
        // Navigate to results screen
        if (window.uiManager) {
            window.uiManager.navigateToScreen('simulationResultsScreen');
        }
        
        // Store results for review functionality
        this.currentResults = results;
        
        // Populate results screen with data
        document.getElementById('resultsScenarioTitle').textContent = results.scenario.title;
        document.getElementById('resultsScoreNumber').textContent = results.correctAnswers;
        
        // Update the score total to be dynamic
        const scoreTotalElement = document.querySelector('.score-total');
        if (scoreTotalElement) {
            scoreTotalElement.textContent = `/ ${results.totalQuestions}`;
        }
        
        document.getElementById('resultsScorePercentage').textContent = results.percentage + '%';
        document.getElementById('resultsGrade').textContent = results.grade;
        document.getElementById('resultsTime').textContent = results.totalTimeFormatted;
        document.getElementById('resultsCorrect').textContent = `${results.correctAnswers}/${results.totalQuestions}`;
        document.getElementById('resultsFeedback').textContent = results.feedback.overall;
        
        // Set grade color
        const gradeElement = document.getElementById('resultsGrade');
        const gradeColors = {
            'A': '#27ae60',
            'B': '#2ecc71', 
            'C': '#f39c12',
            'D': '#e67e22',
            'F': '#e74c3c'
        };
        gradeElement.style.color = gradeColors[results.grade] || '#e74c3c';
        
        // Setup result screen actions
        this.setupResultScreenActions();
    }
    
    /**
     * Setup result screen actions
     */
    setupResultScreenActions() {
        const tryAgainBtn = document.getElementById('newScenarioBtn');
        const reviewBtn = document.getElementById('reviewAnswersBtn');
        const returnBtn = document.getElementById('returnToMenuBtn');
        
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                this.startRandomScenario();
            });
        }
        
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.showReviewModal();
            });
        }
        
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                this.switchToWelcomeScreen();
            });
        }
    }
    
    /**
     * Show review modal with all answers
     */
    showReviewModal() {
        if (!this.currentResults) {
            console.error('No results available for review');
            return;
        }
        
        const results = this.currentResults;
        let reviewHTML = `
            <div class="review-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            ">
                <div class="review-content" style="
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 800px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                ">
                    <div class="review-header" style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 1rem;">
                        <h2 style="color: #2c3e50; margin-bottom: 0.5rem;">Answer Review</h2>
                        <h3 style="color: #666; font-weight: normal;">${results.scenario.title}</h3>
                        <p style="color: #888;">Final Score: ${results.correctAnswers}/${results.totalQuestions} (${results.percentage}%)</p>
                    </div>
                    
                    <div class="review-answers">
        `;
        
        // Add each question and answer
        results.choices.forEach((choice, index) => {
            const step = results.scenario.steps[index];
            const correctChoice = step.choices.find(c => c.correct);
            const userChoice = step.choices.find(c => c.id === choice.choiceId);
            
            reviewHTML += `
                <div class="review-item" style="
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    border: 2px solid ${choice.correct ? '#27ae60' : '#e74c3c'};
                    border-radius: 8px;
                    background: ${choice.correct ? '#f8fff8' : '#fff8f8'};
                ">
                    <div class="question-header" style="margin-bottom: 1rem;">
                        <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">
                            ${choice.correct ? '✅' : '❌'} Part ${index + 1}: ${step.title}
                        </h4>
                        <p style="color: #666; font-style: italic;">${step.question}</p>
                    </div>
                    
                    <div class="answer-details">
                        <div class="your-answer" style="margin-bottom: 1rem;">
                            <strong style="color: ${choice.correct ? '#27ae60' : '#e74c3c'};">Your Answer:</strong>
                            <p style="margin: 0.5rem 0;">${userChoice.text}</p>
                        </div>
                        
                        ${!choice.correct ? `
                        <div class="correct-answer" style="margin-bottom: 1rem;">
                            <strong style="color: #27ae60;">Correct Answer:</strong>
                            <p style="margin: 0.5rem 0;">${correctChoice.text}</p>
                        </div>
                        ` : ''}
                        
                        <div class="explanation" style="
                            background: #f8f9fa;
                            padding: 1rem;
                            border-radius: 6px;
                            border-left: 4px solid ${choice.correct ? '#27ae60' : '#e74c3c'};
                        ">
                            <strong>Explanation:</strong>
                            <p style="margin: 0.5rem 0 0 0;">${choice.correct ? userChoice.rationale : correctChoice.rationale}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        reviewHTML += `
                    </div>
                    
                    <div class="review-actions" style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #f0f0f0;">
                        <button id="closeReview" class="btn btn-secondary" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            font-size: 1.1rem;
                            font-weight: 600;
                            cursor: pointer;
                            margin-right: 1rem;
                        ">Close Review</button>
                        <button id="newScenarioFromReview" class="btn btn-primary" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            font-size: 1.1rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">New Scenario</button>
                    </div>
                </div>
            </div>
        `;
        
        // Show review modal
        document.body.insertAdjacentHTML('beforeend', reviewHTML);
        
        // Setup close functionality
        document.getElementById('closeReview').addEventListener('click', () => {
            document.querySelector('.review-modal').remove();
        });
        
        document.getElementById('newScenarioFromReview').addEventListener('click', () => {
            document.querySelector('.review-modal').remove();
            this.startRandomScenario();
        });
    }
    
    /**
     * Show progress modal
     */
    showProgressModal() {
        const stats = window.gameEngine.getStats();
        const progressHTML = `
            <div class="progress-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📊 Your Progress</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="progress-stats">
                            <div class="stat-item">
                                <span class="stat-value">${stats.scenariosCompleted}</span>
                                <span class="stat-label">Scenarios Completed</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.scenariosRemaining}</span>
                                <span class="stat-label">Remaining</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${Math.round((stats.scenariosCompleted / stats.totalScenariosAvailable) * 100)}%</span>
                                <span class="stat-label">Progress</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary close-modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', progressHTML);
        
        // Setup close functionality
        const closeButtons = document.querySelectorAll('.progress-modal .close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.progress-modal').remove();
            });
        });
    }
    
    /**
     * Show reset confirmation
     */
    showResetConfirmation() {
        if (confirm('This will reset all your simulation progress. Are you sure?')) {
            window.gameEngine.resetProgress();
            alert('Progress reset successfully!');
        }
    }
    
    /**
     * Show end scenario confirmation
     */
    showEndScenarioConfirmation() {
        if (confirm('Are you sure you want to end this scenario? Your progress will not be saved.')) {
            window.gameEngine.endSimulation();
            this.switchToWelcomeScreen();
        }
    }
    
    /**
     * Setup study area format button handlers
     */
    setupStudyAreaHandlers() {
        // Note: Format button handling is now managed by study-system.js
        // This method is kept for future study area-specific functionality
        console.log('Study area handlers setup - format navigation handled by study-system.js');
    }
}

// Initialize when DOM is ready and all dependencies are loaded
function initializeSimulationUI() {
    // Wait for all dependencies
    if (typeof SIMULATION_SCENARIOS === 'undefined' || !window.gameEngine) {
        console.log('Waiting for simulation dependencies...');
        setTimeout(initializeSimulationUI, 200);
        return;
    }
    
    window.simulationUIManager = new SimulationUIManager();
    console.log('Simulation UI Manager ready');
}

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts are loaded
    setTimeout(initializeSimulationUI, 500);
});