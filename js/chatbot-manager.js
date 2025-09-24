/**
 * AI Chatbot Integration
 * Manages chatbot functionality and communication for MBLEX preparation
 */
class ChatbotManager {
    constructor() {
        this.iframe = null;
        this.isFullscreen = false;
        this.chatbotUrl = 'https://www.chatbase.co/chatbot-iframe/JSnFdxR-Yqctl2QMqQZb0';
        
        this.init();
    }

    init() {
        this.iframe = document.getElementById('chatbotIframe');
        this.setupEventListeners();
        this.loadChatbot();
        console.log('Chatbot Manager initialized');
    }

    setupEventListeners() {
        // Fullscreen toggle
        document.getElementById('fullscreenButton')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Refresh chatbot
        document.getElementById('refreshChatbot')?.addEventListener('click', () => {
            this.refreshChatbot();
        });

        // Help button
        document.getElementById('helpButton')?.addEventListener('click', () => {
            this.showHelpModal();
        });

        // Listen for messages from iframe
        window.addEventListener('message', (event) => {
            this.handleChatbotMessage(event);
        });

        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });

        // Handle escape key to exit fullscreen
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }

    /**
     * Load chatbot iframe
     */
    loadChatbot() {
        if (this.iframe) {
            this.iframe.src = this.chatbotUrl;
        }
    }

    /**
     * Refresh chatbot
     */
    refreshChatbot() {
        if (this.iframe) {
            this.iframe.src = this.iframe.src;
            this.showToast('Chatbot refreshed', 2000, 'success');
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const container = document.getElementById('chatbotFrame');
        
        if (!this.isFullscreen) {
            this.enterFullscreen(container);
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * Enter fullscreen mode
     */
    enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    handleFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement;
        
        const button = document.getElementById('fullscreenButton');
        if (button) {
            button.innerHTML = this.isFullscreen ? 
                '🔙 Exit Fullscreen' : '📱 Fullscreen';
        }

        // Add/remove fullscreen class for styling
        const container = document.getElementById('chatbotFrame');
        if (container) {
            container.classList.toggle('fullscreen-active', this.isFullscreen);
        }
    }

    /**
     * Send message to chatbot
     */
    sendMessage(message) {
        if (this.iframe && this.iframe.contentWindow) {
            try {
                this.iframe.contentWindow.postMessage({
                    type: 'userMessage',
                    message: message
                }, '*');
            } catch (error) {
                console.error('Failed to send message to chatbot:', error);
            }
        }
    }

    /**
     * Handle messages from chatbot
     */
    handleChatbotMessage(event) {
        // Security: Verify origin if needed
        // if (event.origin !== 'https://www.chatbase.co') return;
        
        const data = event.data;
        
        switch (data.type) {
            case 'chatbotReady':
                console.log('Chatbot is ready');
                this.onChatbotReady();
                break;
            
            case 'chatbotResponse':
                console.log('Chatbot response:', data.message);
                this.onChatbotResponse(data.message);
                break;
            
            case 'chatbotError':
                console.error('Chatbot error:', data.error);
                this.onChatbotError(data.error);
                break;
                
            case 'resize':
                this.handleResize(data);
                break;
        }
    }

    onChatbotReady() {
        // Chatbot is ready, enable features
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            btn.disabled = false;
        });

        // Remove loading state if any
        const chatbotFrame = document.getElementById('chatbotFrame');
        if (chatbotFrame) {
            chatbotFrame.classList.remove('loading');
        }

        // Show success message
        this.showToast('AI Tutor ready!', 2000, 'success');
    }

    onChatbotResponse(message) {
        // Handle chatbot responses if needed
        // Could be used for analytics, logging, etc.
    }

    onChatbotError(error) {
        console.error('Chatbot error:', error);
        this.showToast('Chatbot error occurred. Try refreshing.', 3000, 'error');
    }

    handleResize(data) {
        // Handle dynamic resizing if the chatbot requests it
        if (data.height && this.iframe) {
            this.iframe.style.height = data.height + 'px';
        }
    }

    /**
     * Show help modal
     */
    showHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, duration = 3000, type = 'info') {
        // Check if showToast is available globally, otherwise create simple version
        if (window.showToast) {
            window.showToast(message, duration, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            
            // Simple fallback toast
            const toast = document.createElement('div');
            toast.className = 'simple-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
                color: white;
                padding: 1rem;
                border-radius: 4px;
                z-index: 10000;
                max-width: 300px;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, duration);
        }
    }

    /**
     * Get chatbot status
     */
    getStatus() {
        return {
            loaded: !!this.iframe,
            url: this.chatbotUrl,
            fullscreen: this.isFullscreen
        };
    }

    /**
     * Destroy chatbot manager
     */
    destroy() {
        if (this.iframe) {
            this.iframe.src = 'about:blank';
        }
        this.iframe = null;
        console.log('Chatbot Manager destroyed');
    }
}

/**
 * Send prompt to chatbot from quick buttons
 */
function sendPromptToChatbot(prompt) {
    if (window.chatbotManager) {
        window.chatbotManager.sendMessage(prompt);
        
        // Focus on chatbot iframe after sending prompt
        const iframe = document.getElementById('chatbotIframe');
        if (iframe) {
            iframe.focus();
        }
    } else {
        console.error('Chatbot manager not initialized');
    }
}

// Create global instance
window.chatbotManager = new ChatbotManager();

/**
 * Global function to close help modal
 */
function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close modal when clicking outside of it
document.addEventListener('click', function(event) {
    const modal = document.getElementById('helpModal');
    if (modal && event.target === modal) {
        closeHelpModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('helpModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeHelpModal();
        }
    }
});