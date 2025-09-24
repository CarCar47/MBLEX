/**
 * Auth0 Authentication Implementation
 * Handles all authentication logic for the MBLEX app
 */

// Auth0 client instance
let auth0Client = null;

// Initialize Auth0 client
const initializeAuth0 = async () => {
    try {
        // Create Auth0 client with your configuration
        auth0Client = await auth0.createAuth0Client({
            domain: "YOUR-AUTH0-DOMAIN.auth0.com",
            clientId: "YOUR-AUTH0-CLIENT-ID",
            authorizationParams: {
                redirect_uri: window.location.origin
            },
            cacheLocation: 'localstorage',  // Store tokens in localStorage
            useRefreshTokens: true           // Enable refresh tokens for persistent sessions
        });
        
        console.log('Auth0 client initialized successfully');
        
        // Check if user is authenticated and update UI
        await updateAuthenticationState();
        
    } catch (error) {
        console.error('Auth0 initialization failed:', error);
        // Fallback to development mode if Auth0 fails
        developmentLogin();
    }
};

// Handle Auth0 callback after login
window.addEventListener('load', async () => {
    // Check if returning from Auth0 redirect
    if (location.search.includes("code=") && location.search.includes("state=")) {
        try {
            console.log('Processing Auth0 callback...');
            
            // Wait for auth0Client to be initialized
            if (!auth0Client) {
                await new Promise(resolve => {
                    const checkClient = setInterval(() => {
                        if (auth0Client) {
                            clearInterval(checkClient);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            // Handle the redirect callback
            await auth0Client.handleRedirectCallback();
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Update authentication state
            await updateAuthenticationState();
            
        } catch (error) {
            console.error('Callback handling failed:', error);
            window.history.replaceState({}, document.title, window.location.pathname);
            developmentLogin();
        }
    }
});

// Initialize Auth0 when script loads
// initializeAuth0(); // Temporarily disabled - using development bypass

// Immediate development bypass for testing
setTimeout(() => {
    developmentLogin();
}, 500);

/**
 * Updates authentication state and UI visibility
 */
const updateAuthenticationState = async () => {
    try {
        if (!auth0Client) {
            showLoginScreen();
            return;
        }
        
        const isAuthenticated = await auth0Client.isAuthenticated();
        
        if (isAuthenticated) {
            const user = await auth0Client.getUser();
            console.log('Authenticated user:', user);
            updateUIForUser(user);
            showMainApp();
            
            // Fire custom event for app initialization
            document.dispatchEvent(new CustomEvent('authenticationComplete', {
                detail: { user }
            }));
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Failed to update authentication state:', error);
        showLoginScreen();
    }
};

/**
 * Login function - redirects to Auth0
 */
const login = async () => {
    try {
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    } catch (error) {
        console.error('Login failed:', error);
        // If Auth0 fails, use development mode
        developmentLogin();
    }
};

/**
 * Logout function
 */
const logout = async () => {
    try {
        if (auth0Client) {
            await auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        } else {
            // Development mode logout
            window.secureStorage.removeItem('dev-user');
            location.reload();
        }
    } catch (error) {
        console.error('Logout failed:', error);
        // Fallback logout
        window.secureStorage.removeItem('dev-user');
        location.reload();
    }
};

/**
 * Update UI elements with user information
 */
const updateUIForUser = (user) => {
    // Update all elements with class 'user-name'
    document.querySelectorAll('.user-name').forEach(element => {
        element.textContent = user.name || user.email || 'MBLEX Student';
    });
    
    // Update all elements with class 'user-email'
    document.querySelectorAll('.user-email').forEach(element => {
        element.textContent = user.email || '';
    });
    
    // Update profile images
    document.querySelectorAll('.profile-image').forEach(img => {
        img.src = user.picture || 'assets/images/default-avatar.png';
    });
};

/**
 * Development bypass for local testing
 */
const developmentLogin = () => {
    console.log('Using development bypass for authentication');
    
    const mockUser = {
        name: 'MBLEX Student',
        email: 'student@mblex-prep.com',
        picture: 'assets/images/MBLEX logo app.png'
    };
    
    // Store in localStorage for persistence
    window.secureStorage.setItem('dev-user', mockUser);
    
    updateUIForUser(mockUser);
    showMainApp();
    
    // Fire custom event for app initialization
    document.dispatchEvent(new CustomEvent('authenticationComplete', {
        detail: { user: mockUser }
    }));
};

/**
 * Check if user is in development mode
 */
const isDevelopmentMode = () => {
    return window.secureStorage.getItem('dev-user', null) !== null;
};

/**
 * Get current user (works for both Auth0 and development mode)
 */
const getCurrentUser = async () => {
    if (isDevelopmentMode()) {
        return window.secureStorage.getItem('dev-user', null);
    } else if (auth0Client) {
        try {
            const isAuth = await auth0Client.isAuthenticated();
            if (isAuth) {
                return await auth0Client.getUser();
            }
        } catch (error) {
            console.error('Failed to get user:', error);
        }
    }
    return null;
};

/**
 * Show/hide screen functions
 */
const showLoginScreen = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('loginScreen').classList.add('active');
    updateAuthVisibility(false);
};

const showMainApp = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('mainStartScreen').classList.add('active');
    updateAuthVisibility(true);
    
    // Start background music for main screen
    if (window.audioManager) {
        window.audioManager.startMusicForSection('main');
    }
};

const showLoadingScreen = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('loadingScreen').classList.add('active');
};

/**
 * Update visibility of auth-dependent elements
 */
const updateAuthVisibility = (isAuthenticated) => {
    // Show elements for authenticated users
    document.querySelectorAll('.auth-visible').forEach(element => {
        element.classList.toggle('hidden', !isAuthenticated);
    });
    
    // Hide elements for authenticated users
    document.querySelectorAll('.auth-invisible').forEach(element => {
        element.classList.toggle('hidden', isAuthenticated);
    });
};

// Initialize loading screen immediately
showLoadingScreen();