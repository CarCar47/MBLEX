/**
 * Language Manager for MBLEX App
 * Handles language switching between English and Spanish
 */

// Translation dictionary
const translations = {
    en: {
        // Main screen titles
        'main-title': 'MBLEX Preparation Platform',
        'main-subtitle': 'Master your massage therapy licensure exam',
        'welcome-back': 'Welcome back',
        'sign-out': 'Sign Out',
        
        // Study Area Card
        'study-title': 'Study Area',
        'study-desc': 'Comprehensive study materials organized by MBLEX topics and body systems',
        'study-btn': 'Start Studying',
        
        // Study Screen Headers
        'study-areas-title': 'MBLEX Study Areas',
        'study-areas-subtitle': 'Choose a content area to focus your study preparation',
        
        // Test Generator Card
        'test-title': 'Test Generator',
        'test-desc': 'Practice exams with MBLEX-style questions in English and Spanish',
        'test-btn': 'Take Practice Test',
        
        // Simulation Game Card
        'simulation-title': 'Simulation Game',
        'simulation-desc': 'Interactive massage therapy scenarios with real-world clinical situations',
        'simulation-btn': 'Start Simulation',
        
        // AI Tutor Card
        'ai-title': 'AI Tutor Assistant',
        'ai-desc': 'Get personalized help, practice questions, and instant feedback',
        'ai-btn': 'Launch AI Tutor'
    },
    es: {
        // Main screen titles
        'main-title': 'Plataforma de Preparación MBLEX',
        'main-subtitle': 'Domina tu examen de licencia de terapia de masaje',
        'welcome-back': 'Bienvenido de nuevo',
        'sign-out': 'Cerrar Sesión',
        
        // Study Area Card
        'study-title': 'Área de Estudio',
        'study-desc': 'Materiales de estudio completos organizados por temas MBLEX y sistemas corporales',
        'study-btn': 'Comenzar a Estudiar',
        
        // Study Screen Headers
        'study-areas-title': 'Áreas de Estudio MBLEX',
        'study-areas-subtitle': 'Elige un área de contenido para enfocar tu preparación de estudio',
        
        // Test Generator Card
        'test-title': 'Generador de Exámenes',
        'test-desc': 'Exámenes de práctica con preguntas estilo MBLEX en inglés y español',
        'test-btn': 'Tomar Examen de Práctica',
        
        // Simulation Game Card
        'simulation-title': 'Juego de Simulación',
        'simulation-desc': 'Escenarios interactivos de terapia de masaje con situaciones clínicas del mundo real',
        'simulation-btn': 'Iniciar Simulación',
        
        // AI Tutor Card
        'ai-title': 'Asistente Tutor IA',
        'ai-desc': 'Obtén ayuda personalizada, preguntas de práctica y retroalimentación instantánea',
        'ai-btn': 'Lanzar Tutor IA'
    }
};

// Current language state
let currentLanguage = window.secureStorage ? window.secureStorage.getItem('language', 'en') : 'en';

/**
 * Set the application language
 * @param {string} lang - Language code ('en' or 'es')
 */
function setLanguage(lang) {
    currentLanguage = lang;
    if (window.secureStorage) { window.secureStorage.setItem('language', lang); }
    
    // Update button states
    updateLanguageButtons(lang);
    
    // Apply translations
    applyTranslations(lang);
    
    // Fire custom event for other components to react
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    
    console.log(`Language switched to: ${lang === 'en' ? 'English' : 'Spanish'}`);
}

/**
 * Update language button states
 * @param {string} lang - Current language
 */
function updateLanguageButtons(lang) {
    const btnEnglish = document.getElementById('btnEnglish');
    const btnSpanish = document.getElementById('btnSpanish');
    
    if (btnEnglish && btnSpanish) {
        if (lang === 'en') {
            btnEnglish.classList.add('active');
            btnSpanish.classList.remove('active');
        } else {
            btnSpanish.classList.add('active');
            btnEnglish.classList.remove('active');
        }
    }
}

/**
 * Apply translations to all elements with data-translate attribute
 * @param {string} lang - Language to apply
 */
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = translations[lang][key];
        
        if (translation) {
            element.textContent = translation;
        } else {
            console.warn(`Translation missing for key: ${key} in language: ${lang}`);
        }
    });
}

/**
 * Get a specific translation
 * @param {string} key - Translation key
 * @param {string} lang - Language (optional, uses current if not specified)
 * @returns {string} - Translated text
 */
function getTranslation(key, lang = null) {
    const language = lang || currentLanguage;
    return translations[language][key] || key;
}

/**
 * Initialize language manager on page load
 */
function initializeLanguageManager() {
    // Apply saved language preference
    setLanguage(currentLanguage);
    
    console.log('Language Manager initialized with:', currentLanguage);
}

// Initialize when DOM is ready - DISABLED for browser translation
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeLanguageManager);
// } else {
//     // DOM is already loaded
//     initializeLanguageManager();
// }

// Clear previous language settings to prevent conflicts
if (window.secureStorage) { window.secureStorage.removeItem('language'); }

// Export for use in other modules if needed
window.LanguageManager = {
    setLanguage,
    getTranslation,
    getCurrentLanguage: () => currentLanguage,
    translations
};