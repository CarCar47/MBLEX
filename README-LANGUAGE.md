# Language Translation System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Language Manager Implementation](#language-manager-implementation)
4. [Adding Translations](#adding-translations)
5. [HTML Implementation](#html-implementation)
6. [JavaScript Integration](#javascript-integration)
7. [CSS Styling](#css-styling)
8. [Testing](#testing)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Future Development Guidelines](#future-development-guidelines)

---

## Overview

The MBLEX Preparation Platform features a comprehensive bilingual system supporting **English** and **Spanish** languages. The translation system is designed to be maintainable, scalable, and easy to extend as new features are added to the application.

### Key Features
- **Instant language switching** without page reload
- **Persistent language preference** using localStorage
- **Complete UI translation** for all text elements
- **Modular architecture** for easy maintenance
- **No external dependencies** - pure JavaScript implementation

### Supported Languages
- **English (en)** - Default language
- **Spanish (es)** - Full translation support

---

## Architecture

### File Structure
```
project-root/
├── js/
│   └── language-manager.js    # Core translation system
├── css/
│   └── styles.css             # Language toggle styling
├── index.html                 # HTML with translation attributes
└── test-language.html         # Testing utility
```

### Data Flow
```
User clicks language button → 
Language Manager updates state → 
Apply translations to DOM → 
Save preference to localStorage → 
Fire custom event for components
```

---

## Language Manager Implementation

### Core JavaScript Module
Located in `js/language-manager.js`, this is the heart of the translation system.

```javascript
/**
 * Language Manager for MBLEX App
 * Handles language switching between English and Spanish
 */

// Translation dictionary structure
const translations = {
    en: {
        // Key: English text
        'main-title': 'MBLEX Preparation Platform',
        'main-subtitle': 'Master your massage therapy licensure exam',
        // ... more translations
    },
    es: {
        // Key: Spanish text
        'main-title': 'Plataforma de Preparación MBLEX',
        'main-subtitle': 'Domina tu examen de licencia de terapia de masaje',
        // ... more translations
    }
};
```

### Core Functions

#### 1. Setting Language
```javascript
/**
 * Set the application language
 * @param {string} lang - Language code ('en' or 'es')
 */
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('mblex-language', lang);
    updateLanguageButtons(lang);
    applyTranslations(lang);
    
    // Fire event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    }));
}
```

#### 2. Getting Translations
```javascript
/**
 * Get a specific translation
 * @param {string} key - Translation key
 * @param {string} lang - Optional language override
 * @returns {string} - Translated text
 */
function getTranslation(key, lang = null) {
    const language = lang || currentLanguage;
    return translations[language][key] || key;
}
```

#### 3. Applying Translations to DOM
```javascript
/**
 * Apply translations to all elements with data-translate attribute
 */
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = translations[lang][key];
        
        if (translation) {
            element.textContent = translation;
        }
    });
}
```

---

## Adding Translations

### Step 1: Add Translation Keys
Edit `js/language-manager.js` and add your new translations:

```javascript
const translations = {
    en: {
        // Existing translations...
        
        // Add new translations
        'new-feature-title': 'New Feature',
        'new-feature-desc': 'Description of the new feature',
        'new-feature-btn': 'Try New Feature'
    },
    es: {
        // Existing translations...
        
        // Add Spanish translations
        'new-feature-title': 'Nueva Característica',
        'new-feature-desc': 'Descripción de la nueva característica',
        'new-feature-btn': 'Probar Nueva Característica'
    }
};
```

### Step 2: Apply to HTML Elements
Add the `data-translate` attribute to your HTML elements:

```html
<!-- Example: Adding a new card -->
<div class="option-card">
    <h2 data-translate="new-feature-title">New Feature</h2>
    <p data-translate="new-feature-desc">Description of the new feature</p>
    <button data-translate="new-feature-btn">Try New Feature</button>
</div>
```

### Step 3: Dynamic Text Translation
For dynamically generated content, use the Language Manager API:

```javascript
// Get current language
const currentLang = window.LanguageManager.getCurrentLanguage();

// Get specific translation
const welcomeText = window.LanguageManager.getTranslation('welcome-message');

// Create element with translation
const element = document.createElement('p');
element.textContent = window.LanguageManager.getTranslation('dynamic-text');
```

---

## HTML Implementation

### Language Toggle Buttons
The language toggle is positioned in the main screen header:

```html
<!-- Language Toggle -->
<div class="language-toggle">
    <button id="btnEnglish" class="lang-btn active" onclick="setLanguage('en')">
        English
    </button>
    <button id="btnSpanish" class="lang-btn" onclick="setLanguage('es')">
        Español
    </button>
</div>
```

### Translation Attributes
Every translatable element needs a `data-translate` attribute:

```html
<!-- Main Screen Example -->
<div class="main-title">
    <h1 data-translate="main-title">MBLEX Preparation Platform</h1>
    <p data-translate="main-subtitle">Master your massage therapy licensure exam</p>
</div>

<!-- Card Example -->
<div class="option-card">
    <h2 data-translate="study-title">Study Area</h2>
    <p data-translate="study-desc">Comprehensive study materials...</p>
    <button data-translate="study-btn">Start Studying</button>
</div>
```

### Complete Card Translation Example
```html
<!-- Study Area Card with Full Translation Support -->
<div class="option-card study-card">
    <div class="option-icon">📚</div>
    <h2 data-translate="study-title">Study Area</h2>
    <p data-translate="study-desc">
        Comprehensive study materials organized by MBLEX topics and body systems
    </p>
    <button id="studyButton" class="btn btn-primary" data-translate="study-btn">
        Start Studying
    </button>
</div>
```

---

## JavaScript Integration

### Initializing on Page Load
The Language Manager initializes automatically:

```javascript
// In language-manager.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguageManager);
} else {
    initializeLanguageManager();
}
```

### Listening for Language Changes
Other components can react to language changes:

```javascript
// Listen for language change events
document.addEventListener('languageChanged', (event) => {
    const newLanguage = event.detail.language;
    console.log('Language changed to:', newLanguage);
    
    // Update component-specific content
    updateMyComponent(newLanguage);
});
```

### Programmatic Language Switching
```javascript
// Switch to Spanish programmatically
window.LanguageManager.setLanguage('es');

// Get current language
const currentLang = window.LanguageManager.getCurrentLanguage();

// Check if Spanish is active
if (currentLang === 'es') {
    // Spanish-specific logic
}
```

---

## CSS Styling

### Desktop Language Toggle Styles
```css
/* Language Toggle Container */
.language-toggle {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: flex;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

/* Language Buttons */
.lang-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 6px;
    font-size: 0.9rem;
    min-width: 80px;
}

/* Hover State */
.lang-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

/* Active Language */
.lang-btn.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

### Mobile Responsive Styles
```css
@media (max-width: 768px) {
    /* Language toggle on mobile */
    .language-toggle {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        justify-content: center;
    }
    
    .main-start-container {
        padding-top: 4rem; /* Make room for language toggle */
    }
}
```

---

## Testing

### Test File Usage
Use `test-language.html` to verify the translation system:

```html
<!-- test-language.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Language Toggle Test</title>
</head>
<body>
    <script src="js/language-manager.js"></script>
    <script>
        // Test functions
        function testLanguageSwitch() {
            // Test 1: Check Language Manager exists
            console.assert(window.LanguageManager, 'Language Manager loaded');
            
            // Test 2: Test English translation
            window.LanguageManager.setLanguage('en');
            const enText = window.LanguageManager.getTranslation('main-title');
            console.assert(enText === 'MBLEX Preparation Platform', 'English OK');
            
            // Test 3: Test Spanish translation
            window.LanguageManager.setLanguage('es');
            const esText = window.LanguageManager.getTranslation('main-title');
            console.assert(esText === 'Plataforma de Preparación MBLEX', 'Spanish OK');
            
            // Test 4: Test persistence
            const saved = localStorage.getItem('mblex-language');
            console.assert(saved === 'es', 'Persistence OK');
        }
    </script>
</body>
</html>
```

### Manual Testing Checklist
- [ ] Language toggle buttons appear correctly
- [ ] Clicking English switches all text to English
- [ ] Clicking Español switches all text to Spanish
- [ ] Language preference persists after page reload
- [ ] All cards translate correctly
- [ ] Buttons and labels update properly
- [ ] No untranslated text remains visible

---

## Best Practices

### 1. Translation Key Naming Convention
Use descriptive, hierarchical keys:
```javascript
// Good naming
'study-title'        // Section-Element
'study-desc'         // Section-Description
'study-btn'          // Section-Button
'modal-confirm-btn'  // Component-Action-Element

// Avoid
'title1'            // Not descriptive
'text'              // Too generic
'button'            // Unclear context
```

### 2. Default Text as Fallback
Always provide English text in HTML as fallback:
```html
<!-- Good: Has default text -->
<h2 data-translate="study-title">Study Area</h2>

<!-- Avoid: Empty element -->
<h2 data-translate="study-title"></h2>
```

### 3. Consistent Translation Length
Consider text length differences between languages:
```javascript
// Account for Spanish being ~20% longer
en: {
    'short-btn': 'Save',
    'long-desc': 'Click here to save your progress'
},
es: {
    'short-btn': 'Guardar',  // Still fits
    'long-desc': 'Haz clic aquí para guardar tu progreso'  // Plan for extra space
}
```

### 4. Context-Aware Translations
Provide context in translation keys:
```javascript
// Medical/Technical terms
'massage-technique-effleurage': 'Effleurage',
'massage-technique-petrissage': 'Petrissage',

// UI Elements
'nav-back': 'Back',
'nav-home': 'Home',
'nav-menu': 'Menu'
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Translations Not Appearing
```javascript
// Check if element has data-translate attribute
console.log(document.querySelectorAll('[data-translate]'));

// Verify translation key exists
console.log(translations[currentLanguage]['your-key']);

// Manually trigger translation
applyTranslations(currentLanguage);
```

#### 2. Language Not Persisting
```javascript
// Check localStorage
console.log(localStorage.getItem('mblex-language'));

// Clear and reset
localStorage.removeItem('mblex-language');
window.LanguageManager.setLanguage('en');
```

#### 3. Dynamic Content Not Translating
```javascript
// After adding dynamic content, reapply translations
function addDynamicContent() {
    // Add your content
    const newElement = document.createElement('p');
    newElement.setAttribute('data-translate', 'dynamic-key');
    newElement.textContent = 'Default text';
    container.appendChild(newElement);
    
    // Reapply translations
    applyTranslations(currentLanguage);
}
```

---

## Future Development Guidelines

### Adding New Features
When adding new features to the application, follow these steps:

#### 1. Plan Your Translations
Before coding, list all text that needs translation:
```javascript
// Feature: Progress Tracker
const newTranslations = {
    'progress-title': 'Your Progress',
    'progress-completed': 'Completed',
    'progress-remaining': 'Remaining',
    'progress-reset': 'Reset Progress'
};
```

#### 2. Add to Translation Dictionary
```javascript
// In language-manager.js
const translations = {
    en: {
        // Existing...
        'progress-title': 'Your Progress',
        'progress-completed': 'Completed',
        'progress-remaining': 'Remaining',
        'progress-reset': 'Reset Progress'
    },
    es: {
        // Existing...
        'progress-title': 'Tu Progreso',
        'progress-completed': 'Completado',
        'progress-remaining': 'Restante',
        'progress-reset': 'Reiniciar Progreso'
    }
};
```

#### 3. Implement in HTML
```html
<div class="progress-tracker">
    <h3 data-translate="progress-title">Your Progress</h3>
    <p>
        <span data-translate="progress-completed">Completed</span>: 
        <span id="completed-count">0</span>
    </p>
    <button data-translate="progress-reset">Reset Progress</button>
</div>
```

#### 4. Handle Dynamic Updates
```javascript
// Update dynamic content with translations
function updateProgress(completed, total) {
    const completedText = window.LanguageManager.getTranslation('progress-completed');
    const remainingText = window.LanguageManager.getTranslation('progress-remaining');
    
    document.getElementById('progress-text').innerHTML = `
        ${completedText}: ${completed} / ${total}
        <br>
        ${remainingText}: ${total - completed}
    `;
}
```

### Adding New Languages
To add a third language (e.g., Portuguese):

#### 1. Extend Translation Dictionary
```javascript
const translations = {
    en: { /* ... */ },
    es: { /* ... */ },
    pt: {
        'main-title': 'Plataforma de Preparação MBLEX',
        // Add all Portuguese translations
    }
};
```

#### 2. Add Language Button
```html
<button id="btnPortuguese" class="lang-btn" onclick="setLanguage('pt')">
    Português
</button>
```

#### 3. Update Language Manager
```javascript
// Validate new language in setLanguage function
function setLanguage(lang) {
    if (['en', 'es', 'pt'].includes(lang)) {
        currentLanguage = lang;
        // ... rest of function
    }
}
```

### Component-Specific Translations
For complex components with many translations:

```javascript
// Create component-specific translation module
const ChatbotTranslations = {
    en: {
        'chat-welcome': 'Hello! How can I help you?',
        'chat-input-placeholder': 'Type your message...',
        'chat-send': 'Send'
    },
    es: {
        'chat-welcome': '¡Hola! ¿Cómo puedo ayudarte?',
        'chat-input-placeholder': 'Escribe tu mensaje...',
        'chat-send': 'Enviar'
    }
};

// Merge with main translations
Object.assign(translations.en, ChatbotTranslations.en);
Object.assign(translations.es, ChatbotTranslations.es);
```

### Translation Validation Script
Create a validation script to ensure all translations are complete:

```javascript
// validate-translations.js
function validateTranslations() {
    const enKeys = Object.keys(translations.en);
    const esKeys = Object.keys(translations.es);
    
    // Find missing translations
    const missingInSpanish = enKeys.filter(key => !esKeys.includes(key));
    const missingInEnglish = esKeys.filter(key => !enKeys.includes(key));
    
    if (missingInSpanish.length > 0) {
        console.warn('Missing Spanish translations:', missingInSpanish);
    }
    
    if (missingInEnglish.length > 0) {
        console.warn('Missing English translations:', missingInEnglish);
    }
    
    return missingInSpanish.length === 0 && missingInEnglish.length === 0;
}
```

---

## Quick Reference

### Essential Functions
```javascript
// Set language
window.LanguageManager.setLanguage('es');

// Get current language
const lang = window.LanguageManager.getCurrentLanguage();

// Get translation
const text = window.LanguageManager.getTranslation('key');

// Listen for changes
document.addEventListener('languageChanged', (e) => {
    console.log('New language:', e.detail.language);
});
```

### HTML Pattern
```html
<element data-translate="key">Default Text</element>
```

### Adding New Translation
1. Add to `translations` object in `language-manager.js`
2. Add `data-translate` attribute to HTML element
3. Test both languages

---

## Conclusion

The language translation system is designed to be simple, maintainable, and scalable. By following these guidelines, future developers can easily:
- Add new features with full bilingual support
- Maintain consistency across the application
- Extend the system to support additional languages
- Ensure a seamless user experience in both English and Spanish

For questions or issues, refer to the test file (`test-language.html`) or the Language Manager source code (`js/language-manager.js`).

---

*Last Updated: Current Version*
*Supported Languages: English (en), Spanish (es)*
*System Status: Production Ready*