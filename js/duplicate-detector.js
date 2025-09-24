/**
 * Duplicate Detection System - 2025 AI-Powered Implementation
 * Advanced algorithms for detecting duplicate questions and content
 * Implements fuzzy matching, semantic analysis, and manual review workflows
 */

class DuplicateDetector {
    constructor() {
        this.algorithms = {
            textSimilarity: new TextSimilarityAnalyzer(),
            semanticAnalysis: new SemanticAnalyzer(),
            structuralComparison: new StructuralComparator()
        };

        // Detection thresholds
        this.thresholds = {
            exactMatch: 1.0,
            highSimilarity: 0.85,
            moderateSimilarity: 0.65,
            lowSimilarity: 0.45
        };

        // Cache for performance
        this.analysisCache = new Map();
        this.questionFingerprints = new Map();

        // Manual review queue
        this.reviewQueue = [];

        this.init();
    }

    /**
     * Initialize duplicate detection system
     */
    async init() {
        console.log('🔍 Duplicate Detection System initializing...');

        try {
            // Load existing question fingerprints
            await this.loadQuestionFingerprints();

            // Initialize algorithms
            await this.initializeAlgorithms();

            // Load manual review queue
            await this.loadReviewQueue();

            console.log('✅ Duplicate Detection System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Duplicate Detection System:', error);
            throw error;
        }
    }

    /**
     * Initialize detection algorithms
     */
    async initializeAlgorithms() {
        await Promise.all([
            this.algorithms.textSimilarity.init(),
            this.algorithms.semanticAnalysis.init(),
            this.algorithms.structuralComparison.init()
        ]);

        console.log('🧠 Detection algorithms initialized');
    }

    /**
     * Load existing question fingerprints for comparison
     */
    async loadQuestionFingerprints() {
        try {
            const fingerprints = window.secureStorage.getItem('question-fingerprints', {});

            if (fingerprints && Object.keys(fingerprints).length > 0) {
                this.questionFingerprints = new Map(Object.entries(fingerprints));
                console.log(`📋 Loaded ${this.questionFingerprints.size} question fingerprints`);
            } else {
                // Generate fingerprints from existing questions
                await this.generateExistingFingerprints();
            }
        } catch (error) {
            console.warn('⚠️ Failed to load question fingerprints:', error.message);
            await this.generateExistingFingerprints();
        }
    }

    /**
     * Generate fingerprints for existing questions
     */
    async generateExistingFingerprints() {
        console.log('🔄 Generating fingerprints for existing questions...');

        try {
            const activeTopics = window.questionBankManager.getActiveTopics();

            for (const topic of activeTopics) {
                const questions = await window.questionBankManager.loadTopicQuestions(topic.id);

                for (const question of questions) {
                    const fingerprint = await this.generateQuestionFingerprint(question);
                    this.questionFingerprints.set(question.id, fingerprint);
                }
            }

            // Save fingerprints
            this.saveQuestionFingerprints();

            console.log(`✅ Generated ${this.questionFingerprints.size} question fingerprints`);
        } catch (error) {
            console.error('❌ Failed to generate existing fingerprints:', error);
        }
    }

    /**
     * Generate a unique fingerprint for a question
     */
    async generateQuestionFingerprint(question) {
        // Create multiple hash types for comprehensive comparison
        const fingerprint = {
            id: question.id,
            textHash: this.algorithms.textSimilarity.generateHash(question.question),
            semanticHash: await this.algorithms.semanticAnalysis.generateHash(question.question),
            structuralHash: this.algorithms.structuralComparison.generateHash(question),
            optionsHash: this.generateOptionsHash(question.options),
            answerPattern: this.generateAnswerPattern(question),
            keywords: await this.extractKeywords(question.question),
            createdAt: new Date().toISOString()
        };

        return fingerprint;
    }

    /**
     * Generate hash for answer options
     */
    generateOptionsHash(options) {
        const normalizedOptions = options.map(option =>
            this.normalizeText(typeof option === 'string' ? option : option.text)
        ).sort();

        return this.algorithms.textSimilarity.generateHash(normalizedOptions.join('|'));
    }

    /**
     * Generate answer pattern (relative position and characteristics)
     */
    generateAnswerPattern(question) {
        const pattern = {
            correctIndex: question.correct,
            optionCount: question.options.length,
            optionLengths: question.options.map(opt =>
                (typeof opt === 'string' ? opt : opt.text).length
            ),
            hasNumbers: question.options.some(opt =>
                /\d/.test(typeof opt === 'string' ? opt : opt.text)
            ),
            hasSpecialChars: question.options.some(opt =>
                /[^a-zA-Z0-9\s]/.test(typeof opt === 'string' ? opt : opt.text)
            )
        };

        return pattern;
    }

    /**
     * Extract keywords from question text
     */
    async extractKeywords(text) {
        const normalized = this.normalizeText(text);
        const words = normalized.split(/\s+/);

        // Filter out common words and extract meaningful keywords
        const stopWords = new Set([
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo',
            'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las',
            'una', 'sus', 'fue', 'ser', 'han', 'son', 'está', 'está', 'tienen'
        ]);

        const keywords = words
            .filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
            .map(word => word.toLowerCase())
            .filter((word, index, array) => array.indexOf(word) === index)
            .slice(0, 10); // Top 10 keywords

        return keywords;
    }

    /**
     * Normalize text for comparison
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Check for duplicates when adding a new question
     */
    async checkForDuplicates(newQuestion, options = {}) {
        console.log('🔍 Checking for duplicates:', newQuestion.id || 'New Question');

        const startTime = performance.now();

        try {
            // Generate fingerprint for new question
            const newFingerprint = await this.generateQuestionFingerprint(newQuestion);

            // Compare against existing questions
            const duplicateResults = await this.compareAgainstExisting(newFingerprint, newQuestion);

            // Analyze results and create report
            const report = this.createDuplicateReport(duplicateResults, newQuestion, newFingerprint);

            // Log performance
            const analysisTime = performance.now() - startTime;
            console.log(`🔍 Duplicate analysis completed in ${analysisTime.toFixed(2)}ms`);

            return report;

        } catch (error) {
            console.error('❌ Failed to check for duplicates:', error);
            return {
                status: 'error',
                error: error.message,
                duplicates: [],
                recommendations: ['Manual review required due to analysis error']
            };
        }
    }

    /**
     * Compare new question fingerprint against existing ones
     */
    async compareAgainstExisting(newFingerprint, newQuestion) {
        const comparisons = [];

        // Check cache first
        const cacheKey = newFingerprint.textHash;
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        for (const [existingId, existingFingerprint] of this.questionFingerprints) {
            if (existingId === newQuestion.id) continue; // Skip self-comparison

            const similarity = await this.calculateSimilarity(newFingerprint, existingFingerprint);

            if (similarity.overallScore >= this.thresholds.lowSimilarity) {
                comparisons.push({
                    questionId: existingId,
                    similarity,
                    fingerprint: existingFingerprint
                });
            }
        }

        // Sort by overall similarity score
        comparisons.sort((a, b) => b.similarity.overallScore - a.similarity.overallScore);

        // Cache results
        this.analysisCache.set(cacheKey, comparisons);

        return comparisons;
    }

    /**
     * Calculate comprehensive similarity between two question fingerprints
     */
    async calculateSimilarity(fingerprint1, fingerprint2) {
        const similarity = {
            textSimilarity: 0,
            semanticSimilarity: 0,
            structuralSimilarity: 0,
            optionsSimilarity: 0,
            keywordSimilarity: 0,
            answerPatternSimilarity: 0,
            overallScore: 0,
            details: {}
        };

        // Text similarity (Levenshtein distance based)
        similarity.textSimilarity = this.algorithms.textSimilarity.compare(
            fingerprint1.textHash,
            fingerprint2.textHash
        );

        // Semantic similarity
        similarity.semanticSimilarity = await this.algorithms.semanticAnalysis.compare(
            fingerprint1.semanticHash,
            fingerprint2.semanticHash
        );

        // Structural similarity
        similarity.structuralSimilarity = this.algorithms.structuralComparison.compare(
            fingerprint1.structuralHash,
            fingerprint2.structuralHash
        );

        // Options similarity
        similarity.optionsSimilarity = this.algorithms.textSimilarity.compare(
            fingerprint1.optionsHash,
            fingerprint2.optionsHash
        );

        // Keywords similarity
        similarity.keywordSimilarity = this.calculateKeywordSimilarity(
            fingerprint1.keywords,
            fingerprint2.keywords
        );

        // Answer pattern similarity
        similarity.answerPatternSimilarity = this.calculateAnswerPatternSimilarity(
            fingerprint1.answerPattern,
            fingerprint2.answerPattern
        );

        // Calculate weighted overall score
        const weights = {
            text: 0.3,
            semantic: 0.25,
            structural: 0.15,
            options: 0.15,
            keywords: 0.1,
            answerPattern: 0.05
        };

        similarity.overallScore =
            similarity.textSimilarity * weights.text +
            similarity.semanticSimilarity * weights.semantic +
            similarity.structuralSimilarity * weights.structural +
            similarity.optionsSimilarity * weights.options +
            similarity.keywordSimilarity * weights.keywords +
            similarity.answerPatternSimilarity * weights.answerPattern;

        return similarity;
    }

    /**
     * Calculate keyword similarity using Jaccard index
     */
    calculateKeywordSimilarity(keywords1, keywords2) {
        if (!keywords1.length || !keywords2.length) return 0;

        const set1 = new Set(keywords1);
        const set2 = new Set(keywords2);

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Calculate answer pattern similarity
     */
    calculateAnswerPatternSimilarity(pattern1, pattern2) {
        let similarity = 0;
        let factors = 0;

        // Correct answer position
        if (pattern1.correctIndex === pattern2.correctIndex) {
            similarity += 0.4;
        }
        factors += 0.4;

        // Option count
        if (pattern1.optionCount === pattern2.optionCount) {
            similarity += 0.2;
        }
        factors += 0.2;

        // Option length patterns
        const lengthCorrelation = this.calculateArrayCorrelation(
            pattern1.optionLengths,
            pattern2.optionLengths
        );
        similarity += lengthCorrelation * 0.2;
        factors += 0.2;

        // Special characteristics
        if (pattern1.hasNumbers === pattern2.hasNumbers) {
            similarity += 0.1;
        }
        factors += 0.1;

        if (pattern1.hasSpecialChars === pattern2.hasSpecialChars) {
            similarity += 0.1;
        }
        factors += 0.1;

        return factors > 0 ? similarity / factors : 0;
    }

    /**
     * Calculate correlation between two arrays
     */
    calculateArrayCorrelation(arr1, arr2) {
        if (arr1.length !== arr2.length) return 0;

        let correlation = 0;
        for (let i = 0; i < arr1.length; i++) {
            const diff = Math.abs(arr1[i] - arr2[i]);
            const maxVal = Math.max(arr1[i], arr2[i]);
            correlation += maxVal > 0 ? (1 - diff / maxVal) : 1;
        }

        return correlation / arr1.length;
    }

    /**
     * Create comprehensive duplicate report
     */
    createDuplicateReport(duplicateResults, newQuestion, newFingerprint) {
        const report = {
            status: 'clear', // clear, warning, blocked
            duplicates: [],
            recommendations: [],
            confidence: 1.0,
            analysisDetails: {
                questionsAnalyzed: this.questionFingerprints.size,
                potentialDuplicates: duplicateResults.length,
                analysisTime: new Date().toISOString()
            }
        };

        // Analyze results
        for (const result of duplicateResults) {
            const duplicateInfo = {
                questionId: result.questionId,
                similarity: result.similarity,
                classification: this.classifySimilarity(result.similarity.overallScore),
                reasons: this.generateSimilarityReasons(result.similarity)
            };

            report.duplicates.push(duplicateInfo);

            // Determine overall status
            if (result.similarity.overallScore >= this.thresholds.exactMatch) {
                report.status = 'blocked';
                report.recommendations.push(`Exact duplicate detected: ${result.questionId}`);
            } else if (result.similarity.overallScore >= this.thresholds.highSimilarity) {
                if (report.status !== 'blocked') {
                    report.status = 'warning';
                }
                report.recommendations.push(`High similarity to ${result.questionId} - manual review recommended`);
            } else if (result.similarity.overallScore >= this.thresholds.moderateSimilarity) {
                if (report.status === 'clear') {
                    report.status = 'warning';
                }
                report.recommendations.push(`Moderate similarity to ${result.questionId} - consider reviewing`);
            }
        }

        // Add to manual review queue if needed
        if (report.status === 'warning' || report.status === 'blocked') {
            this.addToReviewQueue({
                newQuestion,
                fingerprint: newFingerprint,
                report: structuredClone(report),
                addedAt: new Date().toISOString()
            });
        }

        return report;
    }

    /**
     * Classify similarity score
     */
    classifySimilarity(score) {
        if (score >= this.thresholds.exactMatch) return 'exact';
        if (score >= this.thresholds.highSimilarity) return 'high';
        if (score >= this.thresholds.moderateSimilarity) return 'moderate';
        if (score >= this.thresholds.lowSimilarity) return 'low';
        return 'none';
    }

    /**
     * Generate human-readable similarity reasons
     */
    generateSimilarityReasons(similarity) {
        const reasons = [];

        if (similarity.textSimilarity > 0.8) {
            reasons.push('Very similar question text');
        } else if (similarity.textSimilarity > 0.6) {
            reasons.push('Similar question text');
        }

        if (similarity.semanticSimilarity > 0.8) {
            reasons.push('Similar meaning and context');
        }

        if (similarity.optionsSimilarity > 0.7) {
            reasons.push('Similar answer options');
        }

        if (similarity.keywordSimilarity > 0.6) {
            reasons.push('Overlapping keywords');
        }

        if (similarity.answerPatternSimilarity > 0.8) {
            reasons.push('Similar answer structure');
        }

        if (reasons.length === 0) {
            reasons.push('Structural similarities detected');
        }

        return reasons;
    }

    /**
     * Add question to manual review queue
     */
    addToReviewQueue(reviewItem) {
        this.reviewQueue.push(reviewItem);

        // Keep queue manageable (last 100 items)
        if (this.reviewQueue.length > 100) {
            this.reviewQueue = this.reviewQueue.slice(-100);
        }

        this.saveReviewQueue();
        console.log('📋 Added item to manual review queue');
    }

    /**
     * Get manual review queue
     */
    getReviewQueue() {
        return [...this.reviewQueue];
    }

    /**
     * Approve question after manual review
     */
    approveQuestion(questionId, reviewerNotes = '') {
        // Remove from review queue
        this.reviewQueue = this.reviewQueue.filter(item =>
            item.newQuestion.id !== questionId
        );

        // Add to approved list
        const approval = {
            questionId,
            reviewerNotes,
            approvedAt: new Date().toISOString(),
            reviewer: 'manual'
        };

        this.saveApproval(approval);
        this.saveReviewQueue();

        console.log(`✅ Question approved: ${questionId}`);
    }

    /**
     * Reject question after manual review
     */
    rejectQuestion(questionId, rejectionReason) {
        // Remove from review queue
        this.reviewQueue = this.reviewQueue.filter(item =>
            item.newQuestion.id !== questionId
        );

        // Add to rejected list
        const rejection = {
            questionId,
            rejectionReason,
            rejectedAt: new Date().toISOString(),
            reviewer: 'manual'
        };

        this.saveRejection(rejection);
        this.saveReviewQueue();

        console.log(`❌ Question rejected: ${questionId}`);
    }

    /**
     * Add approved question to fingerprint database
     */
    addApprovedQuestion(question) {
        return new Promise(async (resolve, reject) => {
            try {
                const fingerprint = await this.generateQuestionFingerprint(question);
                this.questionFingerprints.set(question.id, fingerprint);
                this.saveQuestionFingerprints();

                console.log(`✅ Added question to fingerprint database: ${question.id}`);
                resolve(fingerprint);
            } catch (error) {
                console.error(`❌ Failed to add question fingerprint: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Save question fingerprints to storage
     */
    saveQuestionFingerprints() {
        try {
            const fingerprintsObj = Object.fromEntries(this.questionFingerprints);
            window.secureStorage.setItem('question-fingerprints', fingerprintsObj);
            console.log('💾 Question fingerprints saved');
        } catch (error) {
            console.error('❌ Failed to save question fingerprints:', error.message);
        }
    }

    /**
     * Load review queue from storage
     */
    async loadReviewQueue() {
        try {
            const queue = window.secureStorage.getItem('duplicate-review-queue', []);
            this.reviewQueue = queue;
            console.log(`📋 Loaded ${queue.length} items in review queue`);
        } catch (error) {
            console.warn('⚠️ Failed to load review queue:', error.message);
            this.reviewQueue = [];
        }
    }

    /**
     * Save review queue to storage
     */
    saveReviewQueue() {
        try {
            window.secureStorage.setItem('duplicate-review-queue', this.reviewQueue);
        } catch (error) {
            console.error('❌ Failed to save review queue:', error.message);
        }
    }

    /**
     * Save approval record
     */
    saveApproval(approval) {
        try {
            const approvals = window.secureStorage.getItem('question-approvals', []);
            approvals.push(approval);
            window.secureStorage.setItem('question-approvals', approvals.slice(-500));
        } catch (error) {
            console.error('❌ Failed to save approval:', error.message);
        }
    }

    /**
     * Save rejection record
     */
    saveRejection(rejection) {
        try {
            const rejections = window.secureStorage.getItem('question-rejections', []);
            rejections.push(rejection);
            window.secureStorage.setItem('question-rejections', rejections.slice(-500));
        } catch (error) {
            console.error('❌ Failed to save rejection:', error.message);
        }
    }

    /**
     * Get system statistics
     */
    getStatistics() {
        return {
            totalFingerprints: this.questionFingerprints.size,
            reviewQueueSize: this.reviewQueue.length,
            cacheSize: this.analysisCache.size,
            thresholds: this.thresholds,
            algorithmsStatus: {
                textSimilarity: this.algorithms.textSimilarity.isReady(),
                semanticAnalysis: this.algorithms.semanticAnalysis.isReady(),
                structuralComparison: this.algorithms.structuralComparison.isReady()
            }
        };
    }

    /**
     * Clear all caches and reset system
     */
    clearCaches() {
        this.analysisCache.clear();
        console.log('🧹 Analysis cache cleared');
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.clearCaches();
        this.saveQuestionFingerprints();
        this.saveReviewQueue();
        console.log('🧹 Duplicate detector cleanup completed');
    }
}

/* =============================================================================
   Text Similarity Analyzer
   ============================================================================= */

class TextSimilarityAnalyzer {
    constructor() {
        this.ready = false;
    }

    async init() {
        this.ready = true;
        console.log('📝 Text Similarity Analyzer initialized');
    }

    /**
     * Generate text hash using simple hash function
     */
    generateHash(text) {
        let hash = 0;
        if (text.length === 0) return hash.toString();

        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return hash.toString();
    }

    /**
     * Compare two text strings using Levenshtein distance
     */
    compare(text1, text2) {
        if (text1 === text2) return 1.0;

        const matrix = [];
        const n = text1.length;
        const m = text2.length;

        if (n === 0) return m === 0 ? 1.0 : 0.0;
        if (m === 0) return 0.0;

        // Initialize matrix
        for (let i = 0; i <= n; i++) {
            matrix[i] = [];
            matrix[i][0] = i;
        }

        for (let j = 0; j <= m; j++) {
            matrix[0][j] = j;
        }

        // Calculate distances
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cost = text1[i - 1] === text2[j - 1] ? 0 : 1;

                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const maxLength = Math.max(n, m);
        return maxLength > 0 ? (maxLength - matrix[n][m]) / maxLength : 1.0;
    }

    isReady() {
        return this.ready;
    }
}

/* =============================================================================
   Semantic Analyzer (Simplified)
   ============================================================================= */

class SemanticAnalyzer {
    constructor() {
        this.ready = false;
    }

    async init() {
        this.ready = true;
        console.log('🧠 Semantic Analyzer initialized');
    }

    /**
     * Generate semantic hash (simplified implementation)
     */
    async generateHash(text) {
        // Extract key concepts and generate semantic fingerprint
        const concepts = this.extractConcepts(text);
        return this.generateConceptHash(concepts);
    }

    /**
     * Extract key concepts from text
     */
    extractConcepts(text) {
        const medicalTerms = [
            'músculo', 'hueso', 'nervio', 'arteria', 'vena', 'ligamento', 'tendón',
            'masaje', 'terapia', 'tratamiento', 'dolor', 'inflamación', 'lesión',
            'anatomía', 'fisiología', 'kinesiología', 'diagnóstico', 'evaluación'
        ];

        const concepts = [];
        const normalized = text.toLowerCase();

        medicalTerms.forEach(term => {
            if (normalized.includes(term)) {
                concepts.push(term);
            }
        });

        return concepts;
    }

    /**
     * Generate hash from concepts
     */
    generateConceptHash(concepts) {
        return concepts.sort().join('|');
    }

    /**
     * Compare semantic hashes
     */
    async compare(hash1, hash2) {
        const concepts1 = new Set(hash1.split('|').filter(c => c));
        const concepts2 = new Set(hash2.split('|').filter(c => c));

        if (concepts1.size === 0 && concepts2.size === 0) return 1.0;
        if (concepts1.size === 0 || concepts2.size === 0) return 0.0;

        const intersection = new Set([...concepts1].filter(x => concepts2.has(x)));
        const union = new Set([...concepts1, ...concepts2]);

        return intersection.size / union.size;
    }

    isReady() {
        return this.ready;
    }
}

/* =============================================================================
   Structural Comparator
   ============================================================================= */

class StructuralComparator {
    constructor() {
        this.ready = false;
    }

    async init() {
        this.ready = true;
        console.log('🏗️ Structural Comparator initialized');
    }

    /**
     * Generate structural hash
     */
    generateHash(question) {
        const structure = {
            questionLength: question.question.length,
            optionCount: question.options.length,
            hasImage: question.image && question.image !== 'N/A',
            difficulty: question.difficulty || 'medium',
            category: question.category_id || 'general',
            language: question.language || 'es'
        };

        return JSON.stringify(structure);
    }

    /**
     * Compare structural hashes
     */
    compare(hash1, hash2) {
        try {
            const structure1 = JSON.parse(hash1);
            const structure2 = JSON.parse(hash2);

            let similarity = 0;
            let factors = 0;

            // Compare each structural element
            const weights = {
                questionLength: 0.2,
                optionCount: 0.3,
                hasImage: 0.1,
                difficulty: 0.2,
                category: 0.15,
                language: 0.05
            };

            Object.keys(weights).forEach(key => {
                if (structure1[key] === structure2[key]) {
                    similarity += weights[key];
                } else if (key === 'questionLength') {
                    // Normalize length difference
                    const diff = Math.abs(structure1[key] - structure2[key]);
                    const maxLength = Math.max(structure1[key], structure2[key]);
                    const lengthSimilarity = maxLength > 0 ? (1 - diff / maxLength) : 1;
                    similarity += lengthSimilarity * weights[key];
                }
                factors += weights[key];
            });

            return factors > 0 ? similarity / factors : 0;
        } catch (error) {
            return 0;
        }
    }

    isReady() {
        return this.ready;
    }
}

// Create global instance
window.duplicateDetector = new DuplicateDetector();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateDetector;
}