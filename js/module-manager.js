/**
 * Module Manager - Advanced Module Loading State Management
 * Handles ES6 module loading, state tracking, and readiness promises
 * Implements 2025 best practices for module loading performance
 */
class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.loadingPromises = new Map();
        this.retryCount = new Map();
        this.maxRetries = 3;
        this.baseRetryDelay = 500; // milliseconds

        // Critical modules for quiz functionality
        this.criticalModules = [
            'question-bank',
            'new-quiz-generator'
        ];

        console.log('🔧 Module Manager initialized');
        this.init();
    }

    init() {
        // Initialize module states
        this.criticalModules.forEach(moduleName => {
            this.modules.set(moduleName, {
                loaded: false,
                error: null,
                loadTime: null,
                instance: null
            });
        });

        // Set up performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Register a module as loaded
     */
    registerModule(moduleName, moduleInstance = null) {
        const moduleState = this.modules.get(moduleName);
        if (moduleState) {
            moduleState.loaded = true;
            moduleState.loadTime = performance.now();
            moduleState.instance = moduleInstance;
            moduleState.error = null;

            console.log(`✅ Module '${moduleName}' registered successfully`);

            // Resolve any waiting promises
            const promise = this.loadingPromises.get(moduleName);
            if (promise && promise.resolve) {
                promise.resolve(moduleInstance);
            }
        }
    }

    /**
     * Register a module loading error
     */
    registerModuleError(moduleName, error) {
        const moduleState = this.modules.get(moduleName);
        if (moduleState) {
            moduleState.error = error;
            console.error(`❌ Module '${moduleName}' failed to load:`, error);

            // Reject any waiting promises
            const promise = this.loadingPromises.get(moduleName);
            if (promise && promise.reject) {
                promise.reject(error);
            }
        }
    }

    /**
     * Get readiness promise for a specific module
     */
    getModuleReadyPromise(moduleName) {
        const moduleState = this.modules.get(moduleName);

        if (!moduleState) {
            return Promise.reject(new Error(`Unknown module: ${moduleName}`));
        }

        // If already loaded, return resolved promise
        if (moduleState.loaded) {
            return Promise.resolve(moduleState.instance);
        }

        // If has error, return rejected promise
        if (moduleState.error) {
            return Promise.reject(moduleState.error);
        }

        // Check if promise already exists
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName).promise;
        }

        // Create new promise
        let resolveFunc, rejectFunc;
        const promise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        this.loadingPromises.set(moduleName, {
            promise,
            resolve: resolveFunc,
            reject: rejectFunc
        });

        // Set timeout for module loading
        setTimeout(() => {
            if (!moduleState.loaded && !moduleState.error) {
                const timeoutError = new Error(`Module '${moduleName}' loading timeout`);
                this.registerModuleError(moduleName, timeoutError);
            }
        }, 10000); // 10 second timeout

        return promise;
    }

    /**
     * Get readiness promise for all critical modules
     */
    getAllCriticalModulesReady() {
        const promises = this.criticalModules.map(moduleName =>
            this.getModuleReadyPromise(moduleName)
        );

        return Promise.allSettled(promises).then(results => {
            const failedModules = [];
            const successfulModules = [];

            results.forEach((result, index) => {
                const moduleName = this.criticalModules[index];
                if (result.status === 'rejected') {
                    failedModules.push({
                        name: moduleName,
                        error: result.reason
                    });
                } else {
                    successfulModules.push({
                        name: moduleName,
                        instance: result.value
                    });
                }
            });

            return {
                allSuccessful: failedModules.length === 0,
                successful: successfulModules,
                failed: failedModules,
                totalModules: this.criticalModules.length
            };
        });
    }

    /**
     * Retry loading a failed module with exponential backoff
     */
    async retryModule(moduleName) {
        const currentRetries = this.retryCount.get(moduleName) || 0;

        if (currentRetries >= this.maxRetries) {
            throw new Error(`Module '${moduleName}' exceeded maximum retry attempts`);
        }

        this.retryCount.set(moduleName, currentRetries + 1);

        // Exponential backoff delay
        const delay = this.baseRetryDelay * Math.pow(2, currentRetries);
        console.log(`🔄 Retrying module '${moduleName}' in ${delay}ms (attempt ${currentRetries + 1})`);

        await new Promise(resolve => setTimeout(resolve, delay));

        // Clear error state and create new promise
        const moduleState = this.modules.get(moduleName);
        if (moduleState) {
            moduleState.error = null;
        }

        // Remove old promise
        this.loadingPromises.delete(moduleName);

        // Return new ready promise
        return this.getModuleReadyPromise(moduleName);
    }

    /**
     * Check if a specific module is loaded
     */
    isModuleLoaded(moduleName) {
        const moduleState = this.modules.get(moduleName);
        return moduleState ? moduleState.loaded : false;
    }

    /**
     * Check if all critical modules are loaded
     */
    areAllCriticalModulesLoaded() {
        return this.criticalModules.every(moduleName => this.isModuleLoaded(moduleName));
    }

    /**
     * Get module loading progress (0-100)
     */
    getLoadingProgress() {
        const loadedCount = this.criticalModules.filter(moduleName =>
            this.isModuleLoaded(moduleName)
        ).length;

        return Math.round((loadedCount / this.criticalModules.length) * 100);
    }

    /**
     * Get detailed module status for debugging
     */
    getModuleStatus() {
        const status = {};

        this.modules.forEach((moduleState, moduleName) => {
            status[moduleName] = {
                loaded: moduleState.loaded,
                hasError: !!moduleState.error,
                error: moduleState.error?.message,
                loadTime: moduleState.loadTime,
                retryCount: this.retryCount.get(moduleName) || 0
            };
        });

        return {
            modules: status,
            overallProgress: this.getLoadingProgress(),
            allCriticalLoaded: this.areAllCriticalModulesLoaded()
        };
    }

    /**
     * Setup performance monitoring for module loading
     */
    setupPerformanceMonitoring() {
        // Monitor module loading performance
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.name.includes('js/') && entry.name.includes('quiz')) {
                            console.log(`📊 Module loading performance: ${entry.name} - ${entry.duration}ms`);
                        }
                    });
                });
                observer.observe({ entryTypes: ['navigation', 'resource'] });
            } catch (e) {
                console.log('Performance monitoring not available');
            }
        }
    }

    /**
     * Force reload all modules (for development/error recovery)
     */
    async forceReloadModules() {
        console.log('🔄 Force reloading all modules...');

        // Clear all states
        this.modules.forEach((moduleState, moduleName) => {
            moduleState.loaded = false;
            moduleState.error = null;
            moduleState.instance = null;
        });
        this.loadingPromises.clear();
        this.retryCount.clear();

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }

        // Try to reload quiz generator if it exists
        if (window.quizGenerator) {
            delete window.quizGenerator;
        }

        return this.getAllCriticalModulesReady();
    }
}

// Create global instance
window.moduleManager = new ModuleManager();

// Convenience methods for other scripts
window.moduleManager.waitForQuizGenerator = () => {
    return window.moduleManager.getModuleReadyPromise('new-quiz-generator');
};

window.moduleManager.waitForQuestionBank = () => {
    return window.moduleManager.getModuleReadyPromise('question-bank');
};

console.log('🚀 Module Manager ready for ES6 module coordination');