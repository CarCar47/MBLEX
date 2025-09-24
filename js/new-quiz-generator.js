/**
 * New Quiz Generator - Functional MBLEX Quiz System
 * Based on the React JSX version - Clean, modern, and working
 * Updated for Vercel compatibility with embedded questions
 */

import { getAllQuestions, getAllTopics } from './question-bank.js';

class QuizGenerator {
    constructor() {
        // Quiz data from the React JSX file
        // Initialize with empty array - questions will be loaded dynamically
        this.questionBank = [];

        // Get unique topics
        this.allTopics = [...new Set(this.questionBank.map(q => q.topic))];

        // State
        this.selectedTopics = [];
        this.questionCount = 10;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];

        this.init();
    }

    async init() {
        await this.loadAllQuestions();
        this.setupEventListeners();
        this.renderTopicButtons();
        this.updatePoolCount();
        this.loadSavedState();
        console.log('✅ New Quiz Generator initialized with all question topics');
    }

    async loadAllQuestions(retryCount = 0) {
        const MAX_RETRIES = 5;
        const RETRY_DELAY = 500; // milliseconds

        try {
            // Load questions from embedded modules
            this.questionBank = getAllQuestions();
            this.allTopics = getAllTopics();

            // If no questions loaded and we haven't exhausted retries, wait and retry
            if (this.questionBank.length === 0 && retryCount < MAX_RETRIES) {
                console.log(`⏳ No questions loaded, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);

                return new Promise(resolve => {
                    setTimeout(async () => {
                        await this.loadAllQuestions(retryCount + 1);
                        resolve();
                    }, RETRY_DELAY);
                });
            }

            console.log(`🎯 Total questions loaded: ${this.questionBank.length}`);
            console.log(`📂 Available topics: ${this.allTopics.length}`);
            console.log('📋 Topics:', this.allTopics);

            // Fallback if no questions loaded after all retries
            if (this.questionBank.length === 0) {
                console.warn('⚠️ No questions loaded after retries, using fallback');
                this.questionBank = [{
                    id: "fallback-1",
                    topic: "System Error",
                    stem: "No questions could be loaded. Please check the embedded modules.",
                    choices: ["Refresh the page", "Check console for errors", "Contact administrator", "Try again later"],
                    answer: 0,
                    rationale: "This is a fallback question when the question bank fails to load."
                }];
                this.allTopics = ["System Error"];
            }
        } catch (error) {
            console.error('❌ Failed to load embedded questions:', error);
            this.questionBank = [{
                id: "error-1",
                topic: "Module Error",
                stem: "Failed to import question modules. Please check the module system.",
                choices: ["Refresh the page", "Check console for errors", "Contact administrator", "Try again later"],
                answer: 0,
                rationale: "This indicates a problem with the JavaScript module imports."
            }];
            this.allTopics = ["Module Error"];
        }
    }

    setupEventListeners() {
        // Generate quiz button
        document.getElementById('generateQuizBtn').addEventListener('click', () => {
            this.generateQuiz();
        });

        // Question count change
        document.getElementById('questionCount').addEventListener('change', (e) => {
            this.questionCount = parseInt(e.target.value);
            this.updatePoolCount();
            this.saveState();
        });

        // Reset quiz button
        document.getElementById('resetQuizBtn').addEventListener('click', () => {
            this.resetQuiz();
        });

        // Navigation buttons
        document.getElementById('prevQuestionBtn').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('nextQuestionBtn').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Submit quiz button
        document.getElementById('submitQuizBtn').addEventListener('click', () => {
            this.submitQuiz();
        });
    }

    renderTopicButtons() {
        const container = document.getElementById('topicButtons');
        container.innerHTML = '';

        this.allTopics.forEach(topic => {
            const button = document.createElement('button');
            button.className = `topic-btn ${this.selectedTopics.includes(topic) ? 'active' : ''}`;
            button.textContent = topic;
            button.onclick = () => this.toggleTopic(topic);
            container.appendChild(button);
        });
    }

    toggleTopic(topic) {
        if (this.selectedTopics.includes(topic)) {
            this.selectedTopics = this.selectedTopics.filter(t => t !== topic);
        } else {
            this.selectedTopics.push(topic);
        }

        this.renderTopicButtons();
        this.updatePoolCount();
        this.updateGenerateButton();
        this.saveState();
    }

    updatePoolCount() {
        const pool = this.getQuestionPool();
        document.getElementById('poolCount').textContent = pool.length;
    }

    updateGenerateButton() {
        const btn = document.getElementById('generateQuizBtn');
        const hasTopics = this.selectedTopics.length > 0;
        const hasQuestions = this.getQuestionPool().length >= this.questionCount;

        btn.disabled = !hasTopics || !hasQuestions;

        const warning = document.getElementById('topicWarning');
        warning.style.display = hasTopics ? 'none' : 'block';
    }

    getQuestionPool() {
        if (this.selectedTopics.length === 0) return [];
        return this.questionBank.filter(q => this.selectedTopics.includes(q.topic));
    }

    generateQuiz() {
        const pool = this.getQuestionPool();
        const shuffledPool = this.shuffleArray([...pool]);
        const selectedQuestions = shuffledPool.slice(0, this.questionCount);

        // Randomize answer choices for each question
        this.currentQuiz = selectedQuestions.map(q => ({
            ...q,
            shuffledChoices: this.shuffleChoicesWithTracking(q.choices, q.answer)
        }));

        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.length).fill(null);

        // Show quiz interface and add quiz-active class for header styling
        document.getElementById('quizSetup').style.display = 'none';
        document.getElementById('quizInterface').style.display = 'block';
        document.getElementById('resultsScreen').style.display = 'none';
        document.getElementById('testScreen').classList.add('quiz-active');

        this.displayCurrentQuestion();
    }

    shuffleChoicesWithTracking(choices, correctAnswer) {
        const choicesWithIndex = choices.map((choice, index) => ({
            text: choice,
            originalIndex: index
        }));

        const shuffled = this.shuffleArray(choicesWithIndex);
        const newCorrectIndex = shuffled.findIndex(c => c.originalIndex === correctAnswer);

        return {
            choices: shuffled,
            correctIndex: newCorrectIndex
        };
    }

    displayCurrentQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];

        // Update progress
        document.getElementById('questionCounter').textContent =
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.length}`;

        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        // Display question
        document.getElementById('questionTopic').textContent = question.topic;
        document.getElementById('questionStem').textContent = question.stem;

        // Display choices
        const container = document.getElementById('choiceContainer');
        container.innerHTML = '';

        question.shuffledChoices.choices.forEach((choice, index) => {
            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'choice-option';

            const selectedAnswer = this.userAnswers[this.currentQuestionIndex];
            if (selectedAnswer === index) {
                choiceDiv.classList.add('selected');
            }

            choiceDiv.innerHTML = `
                <input type="radio" id="choice${index}" name="question${this.currentQuestionIndex}"
                       value="${index}" ${selectedAnswer === index ? 'checked' : ''}>
                <label for="choice${index}">${choice.text}</label>
            `;

            choiceDiv.addEventListener('click', () => {
                this.selectAnswer(index);
            });

            container.appendChild(choiceDiv);
        });

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    selectAnswer(choiceIndex) {
        this.userAnswers[this.currentQuestionIndex] = choiceIndex;
        this.displayCurrentQuestion(); // Refresh to show selection
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');

        prevBtn.disabled = this.currentQuestionIndex === 0;
        nextBtn.disabled = this.currentQuestionIndex === this.currentQuiz.length - 1;

        // Show submit button if all questions are answered
        const allAnswered = this.userAnswers.every(answer => answer !== null);
        submitBtn.style.display = allAnswered ? 'block' : 'none';
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        }
    }

    submitQuiz() {
        this.showResults();
    }

    showResults() {
        // Calculate score
        let correctCount = 0;
        const results = this.currentQuiz.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.shuffledChoices.correctIndex;
            if (isCorrect) correctCount++;

            return {
                question,
                userAnswer,
                isCorrect,
                userAnswerText: userAnswer !== null ? question.shuffledChoices.choices[userAnswer].text : 'No answer',
                correctAnswerText: question.choices[question.answer]
            };
        });

        const percentage = Math.round((correctCount / this.currentQuiz.length) * 100);

        // Show results screen
        document.getElementById('quizInterface').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';

        // Generate results HTML
        const resultsContainer = document.getElementById('resultsScreen');
        resultsContainer.innerHTML = `
            <div class="results-container">
                <div class="score-summary">
                    <h2>Quiz Results</h2>
                    <div class="score-display">
                        <span class="score-number">${correctCount}/${this.currentQuiz.length}</span>
                        <span class="score-percentage">${percentage}%</span>
                    </div>
                    <div class="score-description">
                        ${this.getScoreDescription(percentage)}
                    </div>
                    <div class="top-actions">
                        <button id="newQuizFromResultsTop" class="btn-generate">🔄 Start New Quiz</button>
                    </div>
                </div>

                <div class="question-review">
                    <h3>Question Review</h3>
                    ${results.map((result, index) => `
                        <div class="review-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="review-header">
                                <span class="question-number">Question ${index + 1}</span>
                                <span class="result-indicator">${result.isCorrect ? '✓' : '✗'}</span>
                            </div>
                            <div class="review-question">${result.question.stem}</div>
                            <div class="review-answers">
                                <div class="user-answer">
                                    <strong>Your answer:</strong> ${result.userAnswerText}
                                </div>
                                ${!result.isCorrect ? `
                                    <div class="correct-answer">
                                        <strong>Correct answer:</strong> ${result.correctAnswerText}
                                    </div>
                                ` : ''}
                                <div class="rationale">
                                    <strong>Explanation:</strong> ${result.question.rationale}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="results-actions">
                    <button id="newQuizFromResults" class="btn-generate">🔄 Start New Quiz</button>
                </div>
            </div>
        `;

        // Add event listeners for both new quiz buttons
        document.getElementById('newQuizFromResultsTop').addEventListener('click', () => {
            this.resetQuiz();
        });

        document.getElementById('newQuizFromResults').addEventListener('click', () => {
            this.resetQuiz();
        });
    }

    getScoreDescription(percentage) {
        if (percentage >= 90) return "Excellent! You have a strong understanding of MBLEX concepts.";
        if (percentage >= 80) return "Good job! You're well-prepared for the MBLEX exam.";
        if (percentage >= 70) return "Not bad! Review the explanations and try again.";
        if (percentage >= 60) return "You're getting there. More study is recommended.";
        return "Keep studying! Review the explanations carefully and practice more.";
    }

    resetQuiz() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];

        // Show setup screen and remove quiz-active class
        document.getElementById('quizSetup').style.display = 'block';
        document.getElementById('quizInterface').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'none';
        document.getElementById('testScreen').classList.remove('quiz-active');

        this.updateGenerateButton();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    saveState() {
        const state = {
            selectedTopics: this.selectedTopics,
            questionCount: this.questionCount
        };
        localStorage.setItem('mblexQuizState', JSON.stringify(state));
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('mblexQuizState');
            if (saved) {
                const state = JSON.parse(saved);
                if (state.selectedTopics) {
                    this.selectedTopics = state.selectedTopics;
                    this.renderTopicButtons();
                }
                if (state.questionCount) {
                    this.questionCount = state.questionCount;
                    document.getElementById('questionCount').value = state.questionCount;
                }
                this.updatePoolCount();
                this.updateGenerateButton();
            }
        } catch (e) {
            console.log('Could not load saved state:', e);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the test screen
    if (window.location.hash === '#testScreen') {
        window.quizGenerator = new QuizGenerator();
    }
});

// Also initialize when navigating to test screen
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#testScreen' && !window.quizGenerator) {
        window.quizGenerator = new QuizGenerator();
    }
});