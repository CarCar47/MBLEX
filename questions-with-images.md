# Questions with Images - Test Generator Implementation Plan

## Overview
This document outlines the implementation strategy for the MBLEX Test Generator, supporting both standard text-only questions and enhanced questions with visual aids (anatomical diagrams, technique demonstrations, etc.). The system will display questions one at a time, with special handling for image-based questions to optimize learning comprehension.

## Question Data Structure

### Standard Question Format
Each question in the system will follow this structure:

```javascript
{
  id: "q001",                              // Unique question identifier
  category_id: "anatomy_physiology",       // Maps to MBLEX content areas
  question: "What is the primary function of the deltoid muscle?",
  image: "N/A",                            // No image for standard questions
  options: [
    "Shoulder abduction",
    "Elbow flexion", 
    "Wrist extension",
    "Hip rotation"
  ],
  correct: 0,                              // Index of correct answer (0-based)
  rationale_correct: "Excellent! The deltoid muscle's primary function is shoulder abduction, allowing the arm to move away from the body laterally.",
  rationale_incorrect: "Not quite. You selected [chosen option], but the deltoid muscle's primary function is actually shoulder abduction. The deltoid is responsible for lifting the arm away from the body to the side.",
  difficulty: "medium",                    // easy, medium, hard
  language: "en",                          // en or es for bilingual support
  subcategory: "muscular_system",          // Optional subcategory
  tags: ["muscles", "shoulder", "movement"] // Optional tags for filtering
}
```

### Question with Image Format
For questions requiring visual aids:

```javascript
{
  id: "q047",
  category_id: "kinesiology",
  question: "Which muscle is highlighted in the diagram below?",
  image: "assets/images/kinesiology/posterior_shoulder_muscles.jpg",  // Image path
  options: [
    "Infraspinatus",
    "Supraspinatus",
    "Teres Minor",
    "Subscapularis"
  ],
  correct: 0,
  rationale_correct: "Correct! The infraspinatus muscle is clearly highlighted in the posterior view. This muscle is part of the rotator cuff and is responsible for external rotation of the shoulder.",
  rationale_incorrect: "Incorrect. You selected [chosen option], but the highlighted muscle is actually the infraspinatus. Notice its position on the posterior scapula below the scapular spine - this is the key identifying feature of the infraspinatus.",
  difficulty: "hard",
  language: "en",
  subcategory: "muscle_identification",
  tags: ["muscles", "rotator_cuff", "shoulder", "anatomy_diagram"]
}
```

## Display Order Logic

### Questions WITHOUT Images (Majority)
When `image: "N/A"`:
1. Question text
2. Answer options
3. Category label
4. Submit button

```javascript
function displayStandardQuestion(questionData) {
  // Skip image rendering entirely
  renderQuestionText(questionData.question);
  renderOptions(questionData.options);
  renderCategoryBadge(questionData.category_id);
  renderSubmitButton();
}
```

### Questions WITH Images
When `image` contains a valid path:
1. **Image first** (sets visual context)
2. Question text
3. Answer options  
4. Category label
5. Submit button

```javascript
function displayImageQuestion(questionData) {
  // Image takes priority for context setting
  renderImage(questionData.image);
  renderQuestionText(questionData.question);
  renderOptions(questionData.options);
  renderCategoryBadge(questionData.category_id);
  renderSubmitButton();
}
```

## Implementation Architecture

### Core Question Display Function
```javascript
function displayQuestion(questionData) {
  // Clear previous question
  clearQuestionArea();
  
  // Conditional rendering based on image presence
  if (questionData.image && questionData.image !== "N/A") {
    // Image-based question flow
    renderImage(questionData.image);
  }
  
  // Standard elements (always present)
  renderQuestionText(questionData.question);
  renderOptions(questionData.options);
  renderCategoryBadge(questionData.category_id);
  renderSubmitButton();
  
  // Store current question for answer validation
  currentQuestion = questionData;
}
```

### Image Rendering with Error Handling
```javascript
function renderImage(imagePath) {
  const imageContainer = document.getElementById('questionImageContainer');
  
  if (imagePath === "N/A" || !imagePath) {
    imageContainer.style.display = 'none';
    return;
  }
  
  const img = new Image();
  img.onload = function() {
    imageContainer.innerHTML = `
      <img src="${imagePath}" 
           alt="Question diagram" 
           class="question-image"
           style="max-width: 100%; height: auto; margin-bottom: 1rem;">
    `;
    imageContainer.style.display = 'block';
  };
  
  img.onerror = function() {
    console.error(`Failed to load image: ${imagePath}`);
    imageContainer.style.display = 'none';
  };
  
  img.src = imagePath;
}
```

## Category Mapping to MBLEX Areas

Questions will be organized by the 7 MBLEX content areas:

```javascript
const MBLEX_CATEGORIES = {
  anatomy_physiology: {
    name: "Anatomy & Physiology",
    percentage: 11,
    expectedImages: true  // Many anatomy diagrams
  },
  kinesiology: {
    name: "Kinesiology", 
    percentage: 12,
    expectedImages: true  // Movement and muscle diagrams
  },
  pathology_contraindications: {
    name: "Pathology, Contraindications & Special Populations",
    percentage: 14,
    expectedImages: true  // Condition recognition images
  },
  soft_tissue_benefits: {
    name: "Benefits & Effects of Soft Tissue Manipulation",
    percentage: 15,
    expectedImages: true  // Technique demonstrations
  },
  client_assessment: {
    name: "Client Assessment & Treatment Planning",
    percentage: 17,
    expectedImages: false  // Mostly text-based
  },
  ethics_boundaries: {
    name: "Ethics, Boundaries, Laws & Regulations",
    percentage: 16,
    expectedImages: false  // Conceptual, no images needed
  },
  professional_practice: {
    name: "Guidelines for Professional Practice",
    percentage: 15,
    expectedImages: false  // Text-based scenarios
  }
};
```

## File Organization for Images

```
assets/images/questions/
├── anatomy_physiology/
│   ├── skeletal_system/
│   ├── muscular_system/
│   ├── nervous_system/
│   └── other_systems/
├── kinesiology/
│   ├── muscle_actions/
│   ├── joint_movements/
│   └── rom_demonstrations/
├── pathology_contraindications/
│   ├── conditions/
│   ├── skin_markings/
│   └── special_populations/
├── soft_tissue_benefits/
│   ├── techniques/
│   ├── hand_positions/
│   └── modalities/
└── client_assessment/
    ├── posture_analysis/
    └── gait_patterns/
```

## Loading Questions from File

### Expected Question File Format (JSON)
```json
{
  "questions": [
    {
      "id": "q001",
      "category_id": "anatomy_physiology",
      "question": "What is the insertion point of the biceps brachii?",
      "image": "N/A",
      "options": ["Radial tuberosity", "Olecranon process", "Medial epicondyle", "Lateral epicondyle"],
      "correct": 0,
      "explanation": "The biceps brachii inserts on the radial tuberosity...",
      "difficulty": "medium",
      "language": "en"
    },
    {
      "id": "q002",
      "category_id": "kinesiology",
      "question": "Identify the highlighted muscle in this posterior view.",
      "image": "assets/images/questions/kinesiology/muscle_actions/trapezius_highlight.jpg",
      "options": ["Trapezius", "Latissimus Dorsi", "Rhomboids", "Levator Scapulae"],
      "correct": 0,
      "explanation": "The trapezius muscle is clearly highlighted...",
      "difficulty": "easy",
      "language": "en"
    }
  ]
}
```

### Question Loader Function
```javascript
async function loadQuestions(filePath) {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    
    // Validate and process questions
    const processedQuestions = data.questions.map(q => {
      // Ensure all required fields exist
      return {
        ...q,
        image: q.image || "N/A",  // Default to N/A if missing
        tags: q.tags || [],
        subcategory: q.subcategory || null
      };
    });
    
    // Store in question bank
    questionBank = processedQuestions;
    
    // Organize by category for filtering
    organizeQuestionsByCategory();
    
    return processedQuestions;
  } catch (error) {
    console.error('Failed to load questions:', error);
    return [];
  }
}
```

## User Interface Components

### HTML Structure for Question Display
```html
<!-- Question Container -->
<div id="questionContainer" class="question-container">
  <!-- Image Container (hidden for non-image questions) -->
  <div id="questionImageContainer" class="image-container" style="display: none;">
    <!-- Image will be inserted here dynamically -->
  </div>
  
  <!-- Question Text -->
  <div id="questionText" class="question-text">
    <!-- Question text inserted here -->
  </div>
  
  <!-- Answer Options -->
  <div id="optionsContainer" class="options-container">
    <!-- Radio buttons/options inserted here -->
  </div>
  
  <!-- Category Badge -->
  <div id="categoryBadge" class="category-badge">
    <!-- Category label inserted here -->
  </div>
  
  <!-- Submit Button -->
  <button id="submitAnswer" class="btn btn-primary">
    Submit Answer
  </button>
</div>
```

### CSS Considerations for Images
```css
.question-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.image-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Responsive image sizing */
@media (min-width: 768px) {
  .question-image {
    max-width: 600px;
  }
}

@media (max-width: 767px) {
  .question-image {
    max-width: 100%;
  }
}
```

## Test Generation Logic

### Creating Custom Tests
```javascript
function generateTest(options = {}) {
  const {
    categoryId = null,      // Specific MBLEX category or null for mixed
    questionCount = 20,      // Number of questions
    difficulty = 'mixed',    // easy, medium, hard, or mixed
    includeImages = true,    // Include image-based questions
    language = 'en'          // Language preference
  } = options;
  
  let availableQuestions = [...questionBank];
  
  // Filter by category if specified
  if (categoryId) {
    availableQuestions = availableQuestions.filter(q => q.category_id === categoryId);
  }
  
  // Filter by difficulty if not mixed
  if (difficulty !== 'mixed') {
    availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // Filter by image preference
  if (!includeImages) {
    availableQuestions = availableQuestions.filter(q => q.image === "N/A");
  }
  
  // Filter by language
  availableQuestions = availableQuestions.filter(q => q.language === language);
  
  // Shuffle and select questions
  const shuffled = shuffleArray(availableQuestions);
  const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  
  return {
    testId: generateTestId(),
    questions: selectedQuestions,
    totalQuestions: selectedQuestions.length,
    categoryId: categoryId,
    difficulty: difficulty,
    createdAt: new Date().toISOString()
  };
}
```

## Quiz State Management

### Global Test Session State
```javascript
const QuizState = {
  // Test configuration
  testSession: null,
  currentTest: null,
  currentQuestionIndex: 0,
  
  // User answers storage
  userAnswers: [],
  
  // UI state
  isAnswerSubmitted: false,
  showingRationale: false,
  
  // Initialize new quiz session
  initializeQuiz(testData) {
    this.testSession = {
      testId: testData.testId,
      questions: testData.questions,
      startTime: new Date(),
      endTime: null,
      totalQuestions: testData.questions.length,
      categoryId: testData.categoryId || null,
      difficulty: testData.difficulty || 'mixed'
    };
    
    this.currentTest = testData;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.resetQuestionState();
    
    console.log('Quiz initialized:', this.testSession);
  },
  
  // Reset question-level state
  resetQuestionState() {
    this.isAnswerSubmitted = false;
    this.showingRationale = false;
  },
  
  // Get current question
  getCurrentQuestion() {
    if (!this.testSession || this.currentQuestionIndex >= this.testSession.questions.length) {
      return null;
    }
    return this.testSession.questions[this.currentQuestionIndex];
  },
  
  // Check if quiz is complete
  isQuizComplete() {
    return this.currentQuestionIndex >= this.testSession.totalQuestions;
  },
  
  // Get progress information
  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.testSession?.totalQuestions || 0,
      percentage: this.testSession ? ((this.currentQuestionIndex + 1) / this.testSession.totalQuestions) * 100 : 0,
      answered: this.userAnswers.length
    };
  }
};
```

## Answer Feedback System

### Dynamic Rationale Display
```javascript
class AnswerFeedback {
  
  // Process and display answer feedback
  static displayFeedback(question, selectedAnswerIndex, isCorrect) {
    const feedbackContainer = document.getElementById('answerFeedback');
    const selectedAnswerText = question.options[selectedAnswerIndex];
    
    // Choose appropriate rationale
    let rationale = isCorrect ? question.rationale_correct : question.rationale_incorrect;
    
    // Replace [chosen option] placeholder with actual selection
    if (rationale.includes('[chosen option]')) {
      rationale = rationale.replace('[chosen option]', selectedAnswerText);
    }
    
    // Build feedback HTML
    const feedbackHTML = `
      <div class="feedback-container ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="feedback-header">
          <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
          <div class="feedback-status">${isCorrect ? 'Correct!' : 'Incorrect'}</div>
        </div>
        <div class="feedback-rationale">
          ${rationale}
        </div>
        ${!isCorrect ? this.buildCorrectAnswerDisplay(question) : ''}
        <div class="feedback-actions">
          <button id="nextQuestion" class="btn btn-primary">
            ${QuizState.isQuizComplete() ? 'View Results' : 'Next Question'}
          </button>
        </div>
      </div>
    `;
    
    feedbackContainer.innerHTML = feedbackHTML;
    feedbackContainer.style.display = 'block';
    
    // Update quiz state
    QuizState.showingRationale = true;
    
    // Setup next question handler
    this.setupNextQuestionHandler();
  }
  
  // Show correct answer for incorrect responses
  static buildCorrectAnswerDisplay(question) {
    const correctAnswerText = question.options[question.correct];
    return `
      <div class="correct-answer-display">
        <strong>Correct Answer:</strong> ${correctAnswerText}
      </div>
    `;
  }
  
  // Handle next question navigation
  static setupNextQuestionHandler() {
    const nextButton = document.getElementById('nextQuestion');
    nextButton.onclick = () => {
      if (QuizState.isQuizComplete()) {
        // Show results screen
        QuizResults.displayResults();
      } else {
        // Move to next question
        QuizState.currentQuestionIndex++;
        QuizState.resetQuestionState();
        displayQuestion(QuizState.getCurrentQuestion());
        document.getElementById('answerFeedback').style.display = 'none';
      }
    };
  }
}
```

## Answer Storage and Review System

### Comprehensive Answer Recording
```javascript
class AnswerStorage {
  
  // Record user's answer with full context
  static recordAnswer(question, selectedIndex, isCorrect) {
    const answerRecord = {
      questionId: question.id,
      categoryId: question.category_id,
      question: question.question,
      image: question.image,
      options: [...question.options],
      correctIndex: question.correct,
      selectedIndex: selectedIndex,
      selectedText: question.options[selectedIndex],
      correctText: question.options[question.correct],
      isCorrect: isCorrect,
      rationale: isCorrect ? question.rationale_correct : question.rationale_incorrect,
      difficulty: question.difficulty,
      tags: question.tags || [],
      timestamp: new Date().toISOString(),
      timeSpent: this.calculateTimeSpent()
    };
    
    QuizState.userAnswers.push(answerRecord);
    
    // Store in localStorage for persistence
    this.saveToLocalStorage();
    
    return answerRecord;
  }
  
  // Calculate time spent on current question
  static calculateTimeSpent() {
    // Implementation would track time from question display to answer submission
    return QuizState.questionStartTime ? 
           Date.now() - QuizState.questionStartTime : 0;
  }
  
  // Persist quiz data to localStorage
  static saveToLocalStorage() {
    const quizData = {
      testSession: QuizState.testSession,
      userAnswers: QuizState.userAnswers,
      currentQuestionIndex: QuizState.currentQuestionIndex,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`mblex_quiz_${QuizState.testSession.testId}`, JSON.stringify(quizData));
  }
  
  // Load quiz from localStorage (for resume functionality)
  static loadFromLocalStorage(testId) {
    const saved = localStorage.getItem(`mblex_quiz_${testId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }
  
  // Get answers by category for review
  static getAnswersByCategory() {
    const byCategory = {};
    
    QuizState.userAnswers.forEach(answer => {
      if (!byCategory[answer.categoryId]) {
        byCategory[answer.categoryId] = {
          correct: 0,
          total: 0,
          answers: []
        };
      }
      
      byCategory[answer.categoryId].total++;
      if (answer.isCorrect) {
        byCategory[answer.categoryId].correct++;
      }
      byCategory[answer.categoryId].answers.push(answer);
    });
    
    return byCategory;
  }
  
  // Get only incorrect answers for review
  static getIncorrectAnswers() {
    return QuizState.userAnswers.filter(answer => !answer.isCorrect);
  }
}
```

## Scoring and Results System

### Comprehensive Results Display
```javascript
class QuizResults {
  
  // Display final quiz results
  static displayResults() {
    const totalQuestions = QuizState.userAnswers.length;
    const correctAnswers = QuizState.userAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passingScore = 75; // Typical MBLEX passing score
    const passed = score >= passingScore;
    
    // Calculate category breakdowns
    const categoryResults = AnswerStorage.getAnswersByCategory();
    
    // Calculate time statistics
    const totalTime = this.calculateTotalTime();
    const avgTimePerQuestion = Math.round(totalTime / totalQuestions);
    
    // Build results HTML
    const resultsHTML = `
      <div class="quiz-results-container">
        <div class="results-header ${passed ? 'passed' : 'failed'}">
          <div class="score-display">
            <div class="score-number">${score}%</div>
            <div class="score-status">${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}</div>
            <div class="score-details">${correctAnswers}/${totalQuestions} correct</div>
          </div>
        </div>
        
        <div class="results-summary">
          <div class="stat-item">
            <div class="stat-label">Time Taken</div>
            <div class="stat-value">${this.formatTime(totalTime)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Avg per Question</div>
            <div class="stat-value">${avgTimePerQuestion}s</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Difficulty</div>
            <div class="stat-value">${QuizState.testSession.difficulty}</div>
          </div>
        </div>
        
        <div class="category-breakdown">
          <h3>Performance by MBLEX Category</h3>
          ${this.buildCategoryBreakdown(categoryResults)}
        </div>
        
        <div class="results-actions">
          <button id="reviewIncorrect" class="btn btn-secondary">
            Review Incorrect (${QuizState.userAnswers.filter(a => !a.isCorrect).length})
          </button>
          <button id="retakeQuiz" class="btn btn-primary">
            Take Another Quiz
          </button>
          <button id="studyWeakAreas" class="btn btn-accent">
            Study Weak Areas
          </button>
        </div>
      </div>
    `;
    
    // Display results screen
    document.getElementById('quizResults').innerHTML = resultsHTML;
    this.showResultsScreen();
    this.setupResultsActions();
  }
  
  // Build category performance breakdown
  static buildCategoryBreakdown(categoryResults) {
    const MBLEX_CATEGORIES = {
      anatomy_physiology: "Anatomy & Physiology",
      kinesiology: "Kinesiology",
      pathology_contraindications: "Pathology, Contraindications & Special Populations",
      soft_tissue_benefits: "Benefits & Effects of Soft Tissue Manipulation",
      client_assessment: "Client Assessment & Treatment Planning",
      ethics_boundaries: "Ethics, Boundaries, Laws & Regulations",
      professional_practice: "Guidelines for Professional Practice"
    };
    
    let html = '<div class="category-results">';
    
    Object.keys(categoryResults).forEach(categoryId => {
      const category = categoryResults[categoryId];
      const percentage = Math.round((category.correct / category.total) * 100);
      const categoryName = MBLEX_CATEGORIES[categoryId] || categoryId;
      
      html += `
        <div class="category-result-item">
          <div class="category-name">${categoryName}</div>
          <div class="category-score">
            <div class="score-bar">
              <div class="score-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="score-text">${category.correct}/${category.total} (${percentage}%)</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Calculate total quiz time
  static calculateTotalTime() {
    const startTime = new Date(QuizState.testSession.startTime);
    const endTime = new Date();
    return Math.round((endTime - startTime) / 1000); // seconds
  }
  
  // Format time for display
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Show results screen
  static showResultsScreen() {
    // Hide quiz screen, show results screen
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    document.getElementById('resultsScreen').style.display = 'flex';
  }
  
  // Setup results action buttons
  static setupResultsActions() {
    // Review incorrect answers
    document.getElementById('reviewIncorrect').onclick = () => {
      ReviewMode.startReview(AnswerStorage.getIncorrectAnswers());
    };
    
    // Retake quiz
    document.getElementById('retakeQuiz').onclick = () => {
      // Return to quiz setup or generate similar quiz
      this.returnToQuizSetup();
    };
    
    // Study weak areas
    document.getElementById('studyWeakAreas').onclick = () => {
      this.navigateToWeakAreas();
    };
  }
  
  // Navigate to weak categories for targeted study
  static navigateToWeakAreas() {
    const categoryResults = AnswerStorage.getAnswersByCategory();
    const weakCategories = [];
    
    Object.keys(categoryResults).forEach(categoryId => {
      const category = categoryResults[categoryId];
      const percentage = (category.correct / category.total) * 100;
      if (percentage < 70) { // Below 70% considered weak
        weakCategories.push(categoryId);
      }
    });
    
    // Navigate to first weak area or show study selection
    if (weakCategories.length > 0) {
      window.studySystem.navigateToStudyArea(weakCategories[0]);
    } else {
      window.studySystem.backToStudySelection();
    }
  }
  
  // Return to quiz setup
  static returnToQuizSetup() {
    // Clear current quiz state
    QuizState.testSession = null;
    QuizState.userAnswers = [];
    QuizState.currentQuestionIndex = 0;
    
    // Return to study area selection or quiz setup
    window.studySystem.backToStudySelection();
  }
}
```

## Review Mode System

### Dedicated Review Interface
```javascript
class ReviewMode {
  
  // Start reviewing specific answers
  static startReview(answersToReview) {
    this.reviewAnswers = answersToReview;
    this.currentReviewIndex = 0;
    this.displayReviewQuestion();
  }
  
  // Display question in review mode
  static displayReviewQuestion() {
    const answer = this.reviewAnswers[this.currentReviewIndex];
    if (!answer) return;
    
    const reviewHTML = `
      <div class="review-container">
        <div class="review-header">
          <div class="review-progress">
            Question ${this.currentReviewIndex + 1} of ${this.reviewAnswers.length}
          </div>
          <div class="review-category">${answer.categoryId}</div>
        </div>
        
        ${answer.image !== 'N/A' ? `
          <div class="review-image">
            <img src="${answer.image}" alt="Question diagram" class="question-image">
          </div>
        ` : ''}
        
        <div class="review-question">
          <h3>${answer.question}</h3>
        </div>
        
        <div class="review-answers">
          ${this.buildReviewOptions(answer)}
        </div>
        
        <div class="review-explanation">
          <h4>Explanation:</h4>
          <p>${answer.rationale}</p>
        </div>
        
        <div class="review-navigation">
          <button id="prevReview" ${this.currentReviewIndex === 0 ? 'disabled' : ''}>
            Previous
          </button>
          <button id="nextReview">
            ${this.currentReviewIndex === this.reviewAnswers.length - 1 ? 'Finish Review' : 'Next'}
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('reviewMode').innerHTML = reviewHTML;
    this.showReviewScreen();
    this.setupReviewNavigation();
  }
  
  // Build answer options with correct/incorrect indicators
  static buildReviewOptions(answer) {
    let html = '<div class="review-options">';
    
    answer.options.forEach((option, index) => {
      const isSelected = index === answer.selectedIndex;
      const isCorrect = index === answer.correctIndex;
      
      let optionClass = 'review-option';
      if (isCorrect) optionClass += ' correct-option';
      if (isSelected && !isCorrect) optionClass += ' incorrect-selected';
      if (isSelected && isCorrect) optionClass += ' correct-selected';
      
      html += `
        <div class="${optionClass}">
          <div class="option-text">${option}</div>
          <div class="option-indicator">
            ${isCorrect ? '✅ Correct' : ''}
            ${isSelected && !isCorrect ? '❌ Your Answer' : ''}
            ${isSelected && isCorrect ? '✅ Your Answer (Correct!)' : ''}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Setup review navigation
  static setupReviewNavigation() {
    document.getElementById('prevReview').onclick = () => {
      if (this.currentReviewIndex > 0) {
        this.currentReviewIndex--;
        this.displayReviewQuestion();
      }
    };
    
    document.getElementById('nextReview').onclick = () => {
      if (this.currentReviewIndex < this.reviewAnswers.length - 1) {
        this.currentReviewIndex++;
        this.displayReviewQuestion();
      } else {
        // Finish review
        QuizResults.displayResults();
      }
    };
  }
  
  // Show review screen
  static showReviewScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    document.getElementById('reviewScreen').style.display = 'flex';
  }
}
```

## Integration with Existing Study System

The test generator will integrate seamlessly with the current MBLEX study areas:

1. **Entry Points**: Each study area's "Study This Area" button can lead to either:
   - Study materials (future content)
   - Practice questions for that specific category

2. **Navigation Flow**:
   ```
   Study Area Selection → Category-Specific Test → Question Display → Results
                      ↓
                Category Study Materials (future)
   ```

3. **Progress Integration**: Test results can be tracked per MBLEX category, showing strengths and weaknesses across the 7 content areas.

## Future Enhancements

1. **Adaptive Testing**: Adjust difficulty based on user performance
2. **Image Zoom**: Allow users to click images for enlarged view
3. **Timed Tests**: Simulate actual MBLEX exam conditions
4. **Explanation Mode**: Show explanations immediately vs. at end
5. **Bookmark Questions**: Mark questions for later review
6. **Offline Support**: Cache questions and images for offline use
7. **Analytics Dashboard**: Track performance trends over time

## Development Checklist

When ready to implement:

- [ ] Create `js/test-generator.js` module
- [ ] Create `js/question-renderer.js` module  
- [ ] Set up question JSON file structure
- [ ] Organize image assets by category
- [ ] Implement question display logic
- [ ] Add progress tracking system
- [ ] Create results/review screen
- [ ] Test image loading and error handling
- [ ] Ensure responsive design for all screen sizes
- [ ] Add accessibility features (alt text, keyboard nav)
- [ ] Implement bilingual support (en/es)
- [ ] Add loading states for images
- [ ] Create practice test presets (quick 10, full 100, etc.)
- [ ] Test across all 7 MBLEX categories

## Notes for Implementation

- **Image Optimization**: All images should be compressed for web (< 200KB ideally)
- **Lazy Loading**: Implement lazy loading for images to improve performance
- **Caching Strategy**: Cache frequently used images in browser storage
- **Error Recovery**: Gracefully handle missing images (fall back to text-only)
- **Accessibility**: Ensure all images have descriptive alt text
- **Mobile First**: Design image display to work well on mobile devices first

---

This document serves as the blueprint for implementing the test generator feature. When question data is ready, this structure will enable rapid development and integration into the existing MBLEX preparation platform.