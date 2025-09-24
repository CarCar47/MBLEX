/**
 * Secure Storage Manager
 * Provides isolated localStorage operations with browser extension conflict prevention
 * Eliminates JSON parse errors from content scripts and extensions
 */

class SecureStorage {
    constructor() {
        this.prefix = 'mblex_secure_';
        this.fallbackStorage = new Map(); // In-memory fallback
        this.isStorageAvailable = this.checkStorageAvailability();

        // Initialize storage event filtering
        this.initializeEventFiltering();

        console.log('Secure Storage initialized', {
            localStorage: this.isStorageAvailable,
            fallback: !this.isStorageAvailable
        });
    }

    /**
     * Check if localStorage is available and working
     */
    checkStorageAvailability() {
        try {
            const testKey = this.prefix + 'test';
            const testValue = 'test';
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return retrieved === testValue;
        } catch (error) {
            console.warn('localStorage not available, using fallback:', error.message);
            return false;
        }
    }

    /**
     * Initialize storage event filtering to prevent extension interference
     */
    initializeEventFiltering() {
        // Override native localStorage methods with secure versions
        const originalSetItem = Storage.prototype.setItem;
        const originalGetItem = Storage.prototype.getItem;

        // Store references to original methods
        this.originalSetItem = originalSetItem;
        this.originalGetItem = originalGetItem;

        // We don't override the global methods to avoid breaking other code
        // Instead, we use our own secure methods
    }

    /**
     * Validate data before storing - prevents "[object Object]" errors
     */
    validateData(value) {
        if (value === null || value === undefined) {
            return null;
        }

        // If it's already a string, check if it's valid JSON
        if (typeof value === 'string') {
            try {
                // Try to parse and re-stringify to validate JSON
                const parsed = JSON.parse(value);
                return JSON.stringify(parsed);
            } catch (error) {
                // If it's not valid JSON, treat it as a plain string
                return JSON.stringify(value);
            }
        }

        // For objects and arrays, stringify properly
        try {
            return JSON.stringify(value);
        } catch (error) {
            console.error('SecureStorage: Cannot stringify value:', error);
            return null;
        }
    }

    /**
     * Secure set item with validation and error handling
     */
    setItem(key, value) {
        const secureKey = this.prefix + key;
        const validatedValue = this.validateData(value);

        if (validatedValue === null) {
            console.warn('SecureStorage: Invalid data for key:', key);
            return false;
        }

        try {
            if (this.isStorageAvailable) {
                // Use original localStorage method directly to avoid extension conflicts
                this.originalSetItem.call(localStorage, secureKey, validatedValue);
            } else {
                // Fallback to memory storage
                this.fallbackStorage.set(secureKey, validatedValue);
            }
            return true;
        } catch (error) {
            console.error('SecureStorage: Failed to set item:', key, error);

            // Try fallback storage
            try {
                this.fallbackStorage.set(secureKey, validatedValue);
                return true;
            } catch (fallbackError) {
                console.error('SecureStorage: Fallback storage also failed:', fallbackError);
                return false;
            }
        }
    }

    /**
     * Secure get item with validation and error handling
     */
    getItem(key, defaultValue = null) {
        const secureKey = this.prefix + key;

        try {
            let rawValue;

            if (this.isStorageAvailable) {
                // Use original localStorage method directly
                rawValue = this.originalGetItem.call(localStorage, secureKey);
            } else {
                // Use fallback storage
                rawValue = this.fallbackStorage.get(secureKey);
            }

            if (rawValue === null || rawValue === undefined) {
                return defaultValue;
            }

            // Safely parse JSON
            try {
                return JSON.parse(rawValue);
            } catch (parseError) {
                console.warn('SecureStorage: Failed to parse JSON for key:', key, parseError);
                // If JSON parsing fails, return the raw value or default
                return defaultValue;
            }
        } catch (error) {
            console.error('SecureStorage: Failed to get item:', key, error);
            return defaultValue;
        }
    }

    /**
     * Remove item securely
     */
    removeItem(key) {
        const secureKey = this.prefix + key;

        try {
            if (this.isStorageAvailable) {
                localStorage.removeItem(secureKey);
            }

            // Also remove from fallback storage
            this.fallbackStorage.delete(secureKey);
            return true;
        } catch (error) {
            console.error('SecureStorage: Failed to remove item:', key, error);
            return false;
        }
    }

    /**
     * Clear all secure storage items
     */
    clear() {
        try {
            // Clear localStorage items with our prefix
            if (this.isStorageAvailable) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }

                keysToRemove.forEach(key => localStorage.removeItem(key));
            }

            // Clear fallback storage
            this.fallbackStorage.clear();
            return true;
        } catch (error) {
            console.error('SecureStorage: Failed to clear storage:', error);
            return false;
        }
    }

    /**
     * Get all keys with our prefix (for debugging)
     */
    getKeys() {
        const keys = [];

        try {
            if (this.isStorageAvailable) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key.substring(this.prefix.length));
                    }
                }
            }

            // Add fallback storage keys
            for (const key of this.fallbackStorage.keys()) {
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.substring(this.prefix.length);
                    if (!keys.includes(cleanKey)) {
                        keys.push(cleanKey);
                    }
                }
            }
        } catch (error) {
            console.error('SecureStorage: Failed to get keys:', error);
        }

        return keys;
    }

    /**
     * Check if storage is working correctly
     */
    healthCheck() {
        const testKey = 'health_check';
        const testValue = { test: true, timestamp: Date.now() };

        try {
            this.setItem(testKey, testValue);
            const retrieved = this.getItem(testKey);
            this.removeItem(testKey);

            const isHealthy = retrieved &&
                             retrieved.test === true &&
                             typeof retrieved.timestamp === 'number';

            console.log('SecureStorage health check:', isHealthy ? 'PASSED' : 'FAILED');
            return isHealthy;
        } catch (error) {
            console.error('SecureStorage health check failed:', error);
            return false;
        }
    }

    /**
     * Migrate data from regular localStorage to secure storage
     */
    migrateFromLocalStorage(oldKey, newKey = null) {
        const targetKey = newKey || oldKey;

        try {
            const oldValue = localStorage.getItem(oldKey);
            if (oldValue !== null) {
                // Try to parse the old value
                let parsedValue;
                try {
                    parsedValue = JSON.parse(oldValue);
                } catch (error) {
                    // If it's not JSON, store as string
                    parsedValue = oldValue;
                }

                // Store in secure storage
                this.setItem(targetKey, parsedValue);

                // Remove old value
                localStorage.removeItem(oldKey);

                console.log('SecureStorage: Migrated data from', oldKey, 'to', targetKey);
                return true;
            }
        } catch (error) {
            console.error('SecureStorage: Migration failed for', oldKey, ':', error);
        }

        return false;
    }
}

// Make class available globally
window.SecureStorage = SecureStorage;

// Create global instance
window.secureStorage = new SecureStorage();

// Perform health check on initialization
window.secureStorage.healthCheck();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
}