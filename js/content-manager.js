/**
 * ContentManager Class
 * Handles loading and caching of study content from files
 */
class ContentManager {
    constructor() {
        this.cache = new Map();
        this.loadingStates = new Map();
        
        console.log('Content Manager initialized');
    }

    /**
     * Load reading content for a specific area
     */
    async getReadingContent(areaId) {
        // Check cache first
        if (this.cache.has(`reading_${areaId}`)) {
            console.log(`Loading ${areaId} reading content from cache`);
            return this.cache.get(`reading_${areaId}`);
        }

        // Check if already loading
        if (this.loadingStates.has(`reading_${areaId}`)) {
            return await this.loadingStates.get(`reading_${areaId}`);
        }

        // Start loading
        const loadingPromise = this.loadContent(areaId, 'reading');
        this.loadingStates.set(`reading_${areaId}`, loadingPromise);

        try {
            const content = await loadingPromise;
            
            // Cache the result
            this.cache.set(`reading_${areaId}`, content);
            
            // Clean up loading state
            this.loadingStates.delete(`reading_${areaId}`);
            
            return content;
        } catch (error) {
            // Clean up loading state on error
            this.loadingStates.delete(`reading_${areaId}`);
            throw error;
        }
    }

    /**
     * Load content from file
     */
    async loadContent(areaId, format) {
        const fileName = `${areaId}.md`;
        const filePath = `assets/content/${format}/${fileName}`;
        
        console.log(`Loading content from: ${filePath}`);
        
        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            if (!content || content.trim().length === 0) {
                throw new Error('Content file is empty');
            }
            
            console.log(`Successfully loaded ${filePath} (${content.length} characters)`);
            return content;
            
        } catch (error) {
            console.error(`Failed to load ${filePath}:`, error);
            
            // Return a fallback message
            return `# Content Loading Error\n\nSorry, we couldn't load the content for this section.\n\n**Error:** ${error.message}\n\nPlease try again later or contact support if the problem persists.`;
        }
    }

    /**
     * Process markdown content for display
     */
    processMarkdown(content) {
        // Basic markdown processing - RESTORE ORIGINAL LOGIC
        let processed = content
            // Headers first (before paragraph processing)
            .replace(/^# (.*$)/gm, '<div class="h1-wrapper"><h1 class="content-h1-centered">$1</h1></div>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            // Must-Know Tips - SIMPLE replacement that only affects the specific line
            .replace(/\*\*Must-Know Tips:\*\*/g, '<div class="pyramid-point"><h4>Must-Know Tips</h4><p>')
            // Bold (after Must-Know Tips processing)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Split into lines and process paragraphs more carefully
        let lines = processed.split('\n');
        let result = [];
        let currentParagraph = '';
        let insidePyramidPoint = false;

        for (let line of lines) {
            line = line.trim();

            // Check if line contains the start of pyramid point
            if (line.includes('<div class="pyramid-point"><h4>Must-Know Tips</h4><p>')) {
                // Finish any current paragraph first
                if (currentParagraph) {
                    result.push(`<p>${currentParagraph}</p>`);
                    currentParagraph = '';
                }
                insidePyramidPoint = true;
                // Extract the tips content from this line
                let tipsContent = line.replace('<div class="pyramid-point"><h4>Must-Know Tips</h4><p>', '');
                currentParagraph = tipsContent;
                continue;
            }

            // Skip empty lines
            if (line === '') {
                if (currentParagraph) {
                    if (insidePyramidPoint) {
                        // Close the pyramid point
                        result.push(`<div class="pyramid-point"><h4>Must-Know Tips</h4><p>${currentParagraph}</p></div>`);
                        insidePyramidPoint = false;
                    } else {
                        result.push(`<p>${currentParagraph}</p>`);
                    }
                    currentParagraph = '';
                }
                continue;
            }

            // If it's a header, add it directly
            if (line.startsWith('<h') || line.startsWith('<div class="h1-wrapper">')) {
                if (currentParagraph) {
                    if (insidePyramidPoint) {
                        result.push(`<div class="pyramid-point"><h4>Must-Know Tips</h4><p>${currentParagraph}</p></div>`);
                        insidePyramidPoint = false;
                    } else {
                        result.push(`<p>${currentParagraph}</p>`);
                    }
                    currentParagraph = '';
                }
                result.push(line);
                continue;
            }

            // Add to current paragraph
            if (currentParagraph) {
                currentParagraph += ' ' + line;
            } else {
                currentParagraph = line;
            }
        }

        // Add final paragraph if exists
        if (currentParagraph) {
            if (insidePyramidPoint) {
                result.push(`<div class="pyramid-point"><h4>Must-Know Tips</h4><p>${currentParagraph}</p></div>`);
            } else {
                result.push(`<p>${currentParagraph}</p>`);
            }
        }

        return result.join('\n');
    }

    /**
     * Clear cache (useful for development)
     */
    clearCache() {
        this.cache.clear();
        console.log('Content cache cleared');
    }

    /**
     * Get cache info for debugging
     */
    getCacheInfo() {
        return {
            cacheSize: this.cache.size,
            loadingCount: this.loadingStates.size,
            cachedItems: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
window.contentManager = new ContentManager();

// Clear cache on page reload during development
window.contentManager.clearCache();