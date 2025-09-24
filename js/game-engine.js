/**
 * MBLEX Simulation Engine  
 * Handles interactive massage therapy scenario gameplay  
 * Features: scenario management, scoring, progress tracking, results analysis
 * Architecture per README specifications
 */

class SimulationEngine {
    constructor() {
        this.currentScenario = null;
        this.currentStepIndex = 0;
        this.userChoices = [];
        this.score = 0;
        this.maxScore = 0;
        this.startTime = null;
        this.stepStartTime = null;
        this.completedScenarios = [];
        this.gameState = 'idle'; // 'idle', 'playing', 'completed', 'paused'
        
        // Configuration
        this.config = {
            pointsPerCorrectAnswer: 10,
            timeBonus: false, // Can be enabled for speed bonuses
            passingScore: 70,
            maxScenarios: SIMULATION_SCENARIOS.length
        };
        
        // Event system for UI communication (copied from nursing app)
        this.eventListeners = {};
        
        this.init();
    }
    
    init() {
        // Wait for scenarios to be available
        if (typeof SIMULATION_SCENARIOS === 'undefined') {
            console.log('Waiting for simulation scenarios to load...');
            setTimeout(() => {
                this.init();
            }, 100);
            return;
        }
        
        // Load completed scenarios from localStorage
        this.loadProgress();
        
        console.log('Simulation Engine initialized with', SIMULATION_SCENARIOS.length, 'scenarios');
    }
    
    // Event system for UI communication (copied from nursing app)
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * Start a new simulation game (renamed to match nursing app)
     * @param {string} scenarioId - Specific scenario ID or 'random'
     */
    startGame(scenarioId = 'random') {
        if (scenarioId === 'random') {
            scenarioId = this.selectRandomScenario();
        }
        
        this.currentScenario = SIMULATION_SCENARIOS.find(s => s.id === scenarioId);
        
        if (!this.currentScenario) {
            console.error('Scenario not found:', scenarioId);
            return false;
        }
        
        // Initialize game state
        this.currentStepIndex = 0;
        this.userChoices = [];
        this.score = 0;
        this.maxScore = this.currentScenario.steps.length * this.config.pointsPerCorrectAnswer;
        this.startTime = Date.now();
        this.stepStartTime = Date.now();
        this.gameState = 'playing';
        
        // Track this scenario as started
        if (!this.completedScenarios.includes(scenarioId)) {
            // Mark as started (will be marked completed when finished)
        }
        
        // Fire event (copied from nursing app pattern)
        this.emit('gameStarted', {
            scenario: this.currentScenario,
            totalSteps: this.currentScenario.steps.length
        });
        
        console.log('Started simulation:', this.currentScenario.title);
        return true;
    }
    
    /**
     * Select a random scenario that hasn't been completed recently
     * Implements anti-repetition logic
     */
    selectRandomScenario() {
        const availableScenarios = SIMULATION_SCENARIOS.filter(scenario => 
            !this.completedScenarios.includes(scenario.id)
        );
        
        // If all scenarios have been completed, reset the list
        if (availableScenarios.length === 0) {
            console.log('All scenarios completed - resetting for replay');
            this.completedScenarios = [];
            return SIMULATION_SCENARIOS[Math.floor(Math.random() * SIMULATION_SCENARIOS.length)].id;
        }
        
        // Select random from available scenarios
        const randomIndex = Math.floor(Math.random() * availableScenarios.length);
        return availableScenarios[randomIndex].id;
    }
    
    /**
     * Get current step data
     */
    getCurrentStep() {
        if (!this.currentScenario || this.currentStepIndex >= this.currentScenario.steps.length) {
            return null;
        }
        
        return this.currentScenario.steps[this.currentStepIndex];
    }
    
    /**
     * Make a choice for the current step - immediate processing like nursing app
     * @param {string} choiceId - ID of the selected choice
     */
    makeChoice(choiceId) {
        console.log('Game engine makeChoice called with:', choiceId);
        console.log('Current game state:', this.gameState);
        
        if (this.gameState !== 'playing') {
            console.warn('Game not in playing state');
            return null;
        }
        
        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            console.error('No current step available');
            return null;
        }
        
        console.log('Current step:', currentStep.id);
        console.log('Available choices:', currentStep.choices.map(c => c.id));
        
        const selectedChoice = currentStep.choices.find(c => c.id === choiceId);
        if (!selectedChoice) {
            console.error('Choice not found:', choiceId);
            return null;
        }
        
        // Calculate time taken for this step
        const stepTime = Date.now() - this.stepStartTime;
        
        // Record the choice
        const choiceRecord = {
            stepId: currentStep.id,
            choiceId: choiceId,
            correct: selectedChoice.correct,
            points: selectedChoice.correct ? this.config.pointsPerCorrectAnswer : 0,
            timeSeconds: Math.round(stepTime / 1000),
            rationale: selectedChoice.rationale,
            choice: selectedChoice
        };
        
        this.userChoices.push(choiceRecord);
        
        // Update score
        if (selectedChoice.correct) {
            this.score += this.config.pointsPerCorrectAnswer;
        }
        
        // Fire choice event immediately
        this.emit('choiceMade', {
            choice: selectedChoice,
            correct: selectedChoice.correct,
            currentScore: this.score,
            maxScore: this.maxScore,
            step: currentStep,
            rationale: selectedChoice.rationale
        });
        
        console.log('Choice made:', choiceRecord);
        return choiceRecord;
    }

    /**
     * Advance to next step after choice feedback
     */
    advanceStep() {
        if (!this.currentScenario) return null;
        
        this.currentStepIndex++;
        this.stepStartTime = Date.now();
        
        if (this.currentStepIndex >= this.currentScenario.steps.length) {
            this.completeScenario();
            return null;
        }
        
        const nextStep = this.getCurrentStep();
        this.emit('stepAdvanced', {
            step: nextStep,
            stepIndex: this.currentStepIndex,
            totalSteps: this.currentScenario.steps.length
        });
        
        return nextStep;
    }

    /**
     * Submit an answer for the current step (legacy method - kept for compatibility)
     * @param {string} choiceId - ID of the selected choice
     */
    submitAnswer(choiceId) {
        console.log('Game engine submitAnswer called with:', choiceId);
        console.log('Current game state:', this.gameState);
        
        if (this.gameState !== 'playing') {
            console.warn('Game not in playing state');
            return false;
        }
        
        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            console.error('No current step available');
            return false;
        }
        
        console.log('Current step:', currentStep.id);
        console.log('Available choices:', currentStep.choices.map(c => c.id));
        
        const selectedChoice = currentStep.choices.find(c => c.id === choiceId);
        if (!selectedChoice) {
            console.error('Choice not found:', choiceId);
            return false;
        }
        
        // Calculate time taken for this step
        const stepTime = Date.now() - this.stepStartTime;
        
        // Record the choice
        const choiceRecord = {
            stepId: currentStep.id,
            choiceId: choiceId,
            correct: selectedChoice.correct,
            points: selectedChoice.correct ? this.config.pointsPerCorrectAnswer : 0,
            timeSeconds: Math.round(stepTime / 1000),
            rationale: selectedChoice.rationale
        };
        
        this.userChoices.push(choiceRecord);
        
        // Update score
        if (selectedChoice.correct) {
            this.score += this.config.pointsPerCorrectAnswer;
        }
        
        // Fire choice event
        console.log('=== FIRING CHOICE MADE EVENT ===');
        const choiceEventData = {
            choice: selectedChoice,
            correct: selectedChoice.correct,
            currentScore: this.score,
            maxScore: this.maxScore,
            step: currentStep
        };
        console.log('Choice event data:', choiceEventData);
        this.emit('choiceMade', choiceEventData);
        console.log('Choice made event emitted');
        
        // Move to next step or complete scenario
        this.currentStepIndex++;
        this.stepStartTime = Date.now();
        
        if (this.currentStepIndex >= this.currentScenario.steps.length) {
            this.completeScenario();
        } else {
            // Fire step completed event
            this.emit('stepAdvanced', {
                step: this.getCurrentStep(),
                stepIndex: this.currentStepIndex,
                totalSteps: this.currentScenario.steps.length,
                completedStep: currentStep,
                progress: this.currentStepIndex / this.currentScenario.steps.length
            });
        }
        
        return true;
    }
    
    /**
     * Complete the current scenario
     */
    completeScenario() {
        if (!this.currentScenario) {
            console.error('No current scenario to complete');
            return;
        }
        
        const totalTime = Date.now() - this.startTime;
        const percentage = Math.round((this.score / this.maxScore) * 100);
        const grade = this.calculateGrade(percentage);
        
        // Mark scenario as completed
        if (!this.completedScenarios.includes(this.currentScenario.id)) {
            this.completedScenarios.push(this.currentScenario.id);
        }
        
        // Calculate performance metrics
        const results = {
            scenario: this.currentScenario,
            score: this.score,
            maxScore: this.maxScore,
            percentage: percentage,
            grade: grade,
            totalTimeSeconds: Math.round(totalTime / 1000),
            totalTimeFormatted: this.formatTime(totalTime),
            choices: [...this.userChoices],
            correctAnswers: this.userChoices.filter(c => c.correct).length,
            totalQuestions: this.currentScenario.steps.length,
            passed: percentage >= this.config.passingScore,
            categoryBreakdown: this.calculateCategoryBreakdown(),
            feedback: this.generateFeedback(percentage, grade)
        };
        
        // Save progress
        this.saveProgress();
        
        // Update game state
        this.gameState = 'completed';
        
        // Fire completion event
        console.log('Firing scenario completed event');
        this.emit('gameCompleted', results);
        
        console.log('Scenario completed:', results);
        return results;
    }
    
    /**
     * Calculate letter grade based on percentage
     */
    calculateGrade(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }
    
    /**
     * Calculate performance breakdown by category
     */
    calculateCategoryBreakdown() {
        const breakdown = {};
        
        // Group choices by scenario category
        const category = this.currentScenario.category;
        const correctCount = this.userChoices.filter(c => c.correct).length;
        const totalCount = this.userChoices.length;
        
        breakdown[category] = {
            correct: correctCount,
            total: totalCount,
            percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        };
        
        return breakdown;
    }
    
    /**
     * Generate personalized feedback based on performance
     */
    generateFeedback(percentage, grade) {
        let feedback = {
            overall: '',
            strengths: [],
            improvements: [],
            nextSteps: []
        };
        
        // Overall performance feedback
        if (percentage >= 90) {
            feedback.overall = 'Excellent performance! You demonstrate strong understanding of professional massage therapy standards.';
        } else if (percentage >= 80) {
            feedback.overall = 'Good job! You show solid grasp of essential concepts with room for minor improvements.';
        } else if (percentage >= 70) {
            feedback.overall = 'Passing performance. Focus on strengthening key areas to improve confidence.';
        } else {
            feedback.overall = 'Additional study recommended. Review core concepts before attempting the MBLEX exam.';
        }
        
        // Category-specific feedback
        const category = this.currentScenario.category;
        const categoryNames = {
            'contraindications': 'Contraindication Recognition',
            'ethics': 'Professional Ethics',
            'legal_scope': 'Legal and Scope Issues',
            'emergency': 'Emergency Response',
            'legal_documentation': 'Documentation and Privacy'
        };
        
        const correctCount = this.userChoices.filter(c => c.correct).length;
        const totalCount = this.userChoices.length;
        
        if (correctCount === totalCount) {
            feedback.strengths.push(`Perfect score in ${categoryNames[category] || category}`);
        } else if (correctCount / totalCount >= 0.7) {
            feedback.strengths.push(`Strong understanding of ${categoryNames[category] || category}`);
        } else {
            feedback.improvements.push(`Review ${categoryNames[category] || category} concepts`);
        }
        
        // Next steps recommendations
        if (percentage >= 80) {
            feedback.nextSteps.push('Continue with additional scenarios to reinforce learning');
            feedback.nextSteps.push('Consider attempting more challenging difficulty levels');
        } else {
            feedback.nextSteps.push('Review rationales for incorrect answers');
            feedback.nextSteps.push('Study relevant MBLEX preparation materials');
            feedback.nextSteps.push('Practice with additional scenarios in this category');
        }
        
        return feedback;
    }
    
    /**
     * Format time duration in minutes and seconds
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }
    
    /**
     * Get current game progress
     */
    getProgress() {
        if (!this.currentScenario) {
            return null;
        }
        
        return {
            scenario: this.currentScenario.title,
            currentStep: this.currentStepIndex + 1,
            totalSteps: this.currentScenario.steps.length,
            scorePercentage: Math.round((this.score / this.maxScore) * 100),
            progressPercentage: Math.round((this.currentStepIndex / this.currentScenario.steps.length) * 100),
            score: this.score,
            maxScore: this.maxScore
        };
    }
    
    /**
     * Get overall statistics
     */
    getStats() {
        return {
            totalScenariosAvailable: SIMULATION_SCENARIOS.length,
            scenariosCompleted: this.completedScenarios.length,
            scenariosRemaining: SIMULATION_SCENARIOS.length - this.completedScenarios.length,
            completedScenarios: [...this.completedScenarios]
        };
    }
    
    /**
     * Reset progress (clear completed scenarios)
     */
    resetProgress() {
        this.completedScenarios = [];
        this.saveProgress();
        console.log('Progress reset - all scenarios available again');
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            const progressData = {
                completedScenarios: this.completedScenarios,
                lastUpdated: Date.now()
            };
            
            window.secureStorage.setItem('simulation-progress', progressData);
        } catch (error) {
            console.error('Failed to save simulation progress:', error);
        }
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const progressData = window.secureStorage.getItem('simulation-progress', null);
            if (progressData) {
                this.completedScenarios = progressData.completedScenarios || [];
                console.log('Loaded simulation progress:', this.completedScenarios.length, 'completed');
            }
        } catch (error) {
            console.error('Failed to load simulation progress:', error);
            this.completedScenarios = [];
        }
    }
    
    
    /**
     * Get scenario by ID
     */
    getScenario(scenarioId) {
        return SIMULATION_SCENARIOS.find(s => s.id === scenarioId);
    }
    
    /**
     * Get all available scenarios
     */
    getAllScenarios() {
        return SIMULATION_SCENARIOS;
    }
    
    /**
     * Get scenarios by category
     */
    getScenariosByCategory(category) {
        return SIMULATION_SCENARIOS.filter(s => s.category === category);
    }
    
    /**
     * Get scenarios by difficulty
     */
    getScenariosByDifficulty(difficulty) {
        return SIMULATION_SCENARIOS.filter(s => s.difficulty === difficulty);
    }
    
    /**
     * Pause current simulation
     */
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            return true;
        }
        return false;
    }
    
    /**
     * Resume paused simulation
     */
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.stepStartTime = Date.now(); // Reset step timer
            return true;
        }
        return false;
    }
    
    /**
     * End current simulation early
     */
    endSimulation() {
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.gameState = 'idle';
            this.currentScenario = null;
            this.currentStepIndex = 0;
            return true;
        }
        return false;
    }
}

// Create global instance per README specifications
window.gameEngine = new SimulationEngine();