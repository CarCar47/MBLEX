/**
 * Google Translate Element Integration
 * Based on proven approach from Google Translate fix documentation
 */

/**
 * Core function to trigger page translation
 * @param {string} language - Language code ('en' or 'es')
 * @param {number} retryCount - Current retry attempt (default: 0)
 * @param {number} maxRetries - Maximum retry attempts (default: 5)
 */
function translatePage(language, retryCount = 0, maxRetries = 5) {
    console.log(`translatePage called with language: ${language}, attempt: ${retryCount + 1}`);
    
    // Check if Google Translate is available
    if (typeof google === 'undefined' || !google.translate) {
        console.error('Google Translate API not loaded yet');
        if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff up to 10s
            console.log(`Retrying in ${delay}ms...`);
            setTimeout(() => translatePage(language, retryCount + 1, maxRetries), delay);
        } else {
            console.error('Failed to load Google Translate API after maximum retries');
            showTranslationError('Google Translate failed to load. Please refresh the page.');
        }
        return;
    }
    
    // Debug: Check what elements exist
    var container = document.getElementById('google_translate_element');
    console.log('Container exists:', !!container);
    
    // Try to find the Google Translate select element first
    var select = document.querySelector('select.goog-te-combo');
    console.log('Select element found:', !!select);
    
    // If no select, try to find the Google Translate menu trigger
    var menuTrigger = document.querySelector('.goog-te-gadget-simple a');
    var gadget = document.querySelector('.goog-te-gadget');
    
    console.log('Menu trigger found:', !!menuTrigger);
    console.log('Gadget found:', !!gadget);
    
    if (menuTrigger) {
        console.log('Menu trigger element:', menuTrigger);
        console.log('Menu trigger text:', menuTrigger.textContent);
    }
    
    if (select) {
        // Traditional select-based approach
        console.log('Using select-based translation');
        console.log('Current select value:', select.value);
        console.log('Available options:', Array.from(select.options).map(opt => `${opt.value}:${opt.text}`));
        
        var validOption = Array.from(select.options).find(opt => opt.value === language);
        if (!validOption) {
            console.error(`Language '${language}' not available in Google Translate options`);
            return;
        }
        
        select.value = language;
        console.log('Set select value to:', language);
        
        var changeEvent = new Event('change', { bubbles: true });
        var inputEvent = new Event('input', { bubbles: true });
        
        select.dispatchEvent(changeEvent);
        select.dispatchEvent(inputEvent);
        
        console.log('Translation triggered for language:', language);
        
    } else if (menuTrigger && gadget) {
        // Menu-based approach for modern Google Translate widget
        console.log('Using menu-based translation approach');
        
        // For this widget structure, we need to use the URL-based approach
        // since clicking the widget opens a complex dropdown menu
        console.log('Using URL-based approach for widget translation');
        changeLanguageByURL(language);
        
    } else {
        console.warn('Google Translate select element not found.');
        
        if (retryCount < maxRetries) {
            const delay = Math.min(500 * Math.pow(1.5, retryCount), 5000); // Progressive delay up to 5s
            console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => translatePage(language, retryCount + 1, maxRetries), delay);
        } else {
            console.error('Google Translate select element not found after maximum retries');
            showTranslationError('Translation system not ready. Please wait a moment and try again.');
        }
    }
}

/**
 * Button labels removed - Google Translate widget handles all translation UI
 */

/**
 * Fallback method: Change language by modifying URL hash
 * @param {string} language - Language code ('en' or 'es')
 */
function changeLanguageByURL(language) {
    console.log('Using URL-based translation fallback for:', language);
    
    // Google Translate uses URL hash to control translations
    const currentUrl = window.location.href.split('#')[0];
    
    if (language === 'es') {
        // Force translation to Spanish
        window.location.href = currentUrl + '#googtrans(en|es)';
    } else {
        // Return to English (original)
        window.location.href = currentUrl + '#googtrans(es|en)';
        // Or simply reload without hash
        setTimeout(() => {
            if (window.location.hash.includes('googtrans')) {
                window.location.href = currentUrl;
            }
        }, 100);
    }
    
    console.log('URL-based translation applied for:', language);
}

/**
 * Translation to English
 */
function translateToEnglish() {
    translatePage('en');
}

/**
 * Translation to Spanish
 */
function translateToSpanish() {
    translatePage('es');
}

/**
 * Display translation error message to user
 * @param {string} message - Error message to display
 */
function showTranslationError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('translation-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'translation-error';
        errorDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Check Google Translate widget status
 */
function checkGoogleTranslateStatus() {
    const container = document.getElementById('google_translate_element');
    const select = document.querySelector('select.goog-te-combo');
    const menuTrigger = document.querySelector('.goog-te-gadget-simple a');
    const gadget = document.querySelector('.goog-te-gadget');
    
    const status = {
        scriptLoaded: typeof google !== 'undefined' && !!google.translate,
        containerExists: !!container,
        selectExists: !!select,
        menuTriggerExists: !!menuTrigger,
        gadgetExists: !!gadget,
        widgetReady: !!(select || (menuTrigger && gadget)),
        containerContent: container ? container.innerHTML.substring(0, 200) + '...' : 'No container',
        allSelects: document.querySelectorAll('select').length,
        googElements: document.querySelectorAll('[class*="goog"]').length
    };
    
    console.log('Google Translate Status:', status);
    
    // Debug container contents if it exists but neither select nor menu found
    if (container && !status.widgetReady) {
        console.log('Container HTML:', container.innerHTML);
        console.log('All elements with goog classes:', Array.from(document.querySelectorAll('[class*="goog"]')).map(el => el.className));
    }
    
    return status;
}

/**
 * Initialize translation system
 * Wait for page load to ensure Google Translate Element is ready
 */
function initializeTranslationSystem() {
    console.log('Initializing Google Translate Element integration...');
    
    // Check initial status
    checkGoogleTranslateStatus();
    
    // Translation buttons have been removed - Google Translate widget handles translation
    
    // Monitor Google Translate widget loading
    let checkCount = 0;
    const maxChecks = 20; // Check for 20 seconds
    
    const checkInterval = setInterval(() => {
        checkCount++;
        const status = checkGoogleTranslateStatus();
        
        if (status.widgetReady) {
            console.log('Google Translate widget fully loaded (select or menu-based)');
            clearInterval(checkInterval);
        } else if (checkCount >= maxChecks) {
            console.error('Google Translate widget failed to load after 20 seconds');
            clearInterval(checkInterval);
        }
    }, 1000);
}

// Global variable to track if Google Translate is ready
let googleTranslateReady = false;

// Listen for the custom event from HTML initialization
document.addEventListener('googleTranslateReady', function(e) {
    console.log('Received googleTranslateReady event:', e.detail);
    googleTranslateReady = true;
    // Initialize immediately since we know Google Translate is ready
    initializeTranslationSystem();
});

// Fallback initialization methods
window.addEventListener('load', function() {
    // Give Google Translate Element time to initialize, but only if not already ready
    setTimeout(function() {
        if (!googleTranslateReady) {
            console.log('Fallback initialization after window load');
            initializeTranslationSystem();
        }
    }, 5000);
});

// Also initialize on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', function() {
    // Shorter delay for DOM ready, but only if not already ready
    setTimeout(function() {
        if (!googleTranslateReady) {
            console.log('Fallback initialization after DOM ready');
            initializeTranslationSystem();
        }
    }, 2000);
});

console.log('Google Translate Element integration script loaded');