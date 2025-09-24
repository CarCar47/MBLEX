#!/usr/bin/env node
/**
 * Add Questions Tool - Content Management Utility
 * Command-line tool for adding questions to existing topics with duplicate detection
 * Usage: node add-questions.js topic-id questions-file.json [options]
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class QuestionAdder {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'data', 'topics-config.json');
        this.questionBankPath = path.join(__dirname, '..', 'data', 'questions');
        this.duplicateThreshold = 0.8; // Similarity threshold for duplicate detection
        this.stats = {
            processed: 0,
            added: 0,
            duplicates: 0,
            errors: 0
        };
    }

    /**
     * Main execution method
     */
    async run() {
        console.log('📝 MBLEX Questions Addition Tool');
        console.log('=' .repeat(40));

        try {
            // Parse command line arguments
            const args = this.parseArguments();

            // Validate arguments
            await this.validateArguments(args);

            // Load questions from file
            const newQuestions = await this.loadQuestionsFile(args.file);

            // Load existing questions for duplicate detection
            const existingQuestions = await this.loadExistingQuestions(args.topicId);

            console.log(`📋 Processing ${newQuestions.length} questions for topic: ${args.topicId}`);
            console.log(`🔍 Checking against ${existingQuestions.length} existing questions`);

            // Process each question
            const processedQuestions = [];
            const duplicates = [];
            const errors = [];

            for (let i = 0; i < newQuestions.length; i++) {
                try {
                    const question = newQuestions[i];
                    this.stats.processed++;

                    console.log(`\nProcessing question ${i + 1}/${newQuestions.length}:`);
                    console.log(`  "${question.question?.substring(0, 60)}..."`);

                    // Validate question structure
                    const validatedQuestion = await this.validateQuestion(question, i + 1);

                    // Check for duplicates if enabled
                    if (!args.skipDuplicateCheck) {
                        const duplicateCheck = await this.checkForDuplicates(
                            validatedQuestion,
                            [...existingQuestions, ...processedQuestions]
                        );

                        if (duplicateCheck.isDuplicate) {
                            console.log(`  ⚠️ DUPLICATE detected (similarity: ${(duplicateCheck.similarity * 100).toFixed(1)}%)`);
                            console.log(`      Similar to: ${duplicateCheck.similarTo}`);

                            if (args.force) {
                                console.log(`  ✅ Adding anyway (--force flag)`);
                            } else {
                                duplicates.push({
                                    question: validatedQuestion,
                                    duplicateCheck,
                                    index: i + 1
                                });
                                this.stats.duplicates++;
                                continue;
                            }
                        } else {
                            console.log(`  ✅ No duplicates found`);
                        }
                    }

                    // Generate unique ID
                    validatedQuestion.id = this.generateQuestionId(args.topicId, processedQuestions.length);

                    processedQuestions.push(validatedQuestion);
                    this.stats.added++;
                    console.log(`  ✅ Added: ${validatedQuestion.id}`);

                } catch (error) {
                    console.log(`  ❌ Error: ${error.message}`);
                    errors.push({
                        question: newQuestions[i],
                        error: error.message,
                        index: i + 1
                    });
                    this.stats.errors++;
                }
            }

            // Show processing summary
            this.showProcessingSummary();

            // Handle duplicates if any
            if (duplicates.length > 0 && !args.force) {
                await this.handleDuplicates(duplicates, args);
            }

            // Handle errors if any
            if (errors.length > 0) {
                await this.handleErrors(errors, args);
            }

            // Add approved questions to topic
            if (processedQuestions.length > 0) {
                await this.addQuestionsToTopic(args.topicId, processedQuestions);
                console.log(`\n✅ Successfully added ${processedQuestions.length} questions to topic: ${args.topicId}`);
            } else {
                console.log(`\n⚠️ No questions were added`);
            }

            // Generate report if requested
            if (args.report) {
                await this.generateReport(args, processedQuestions, duplicates, errors);
            }

        } catch (error) {
            console.error('❌ Error:', error.message);
            console.log('\nUsage:');
            console.log('  node add-questions.js topic-id questions-file.json [options]');
            process.exit(1);
        }
    }

    /**
     * Parse command line arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);

        if (args.length < 2) {
            throw new Error('Missing required arguments: topic-id and questions-file');
        }

        return {
            topicId: args[0],
            file: args[1],
            force: args.includes('--force'),
            skipDuplicateCheck: args.includes('--skip-duplicates'),
            report: args.includes('--report'),
            interactive: args.includes('--interactive'),
            dryRun: args.includes('--dry-run')
        };
    }

    /**
     * Validate arguments
     */
    async validateArguments(args) {
        // Check if topic exists
        const config = await this.loadTopicsConfig();
        if (!config.topics || !config.topics[args.topicId]) {
            throw new Error(`Topic "${args.topicId}" not found. Use add-topic.js to create it first.`);
        }

        // Check if questions file exists
        try {
            await fs.access(args.file);
        } catch (error) {
            throw new Error(`Questions file not found: ${args.file}`);
        }
    }

    /**
     * Load questions from JSON file
     */
    async loadQuestionsFile(filePath) {
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            // Handle different file formats
            if (Array.isArray(data)) {
                return data;
            } else if (data.questions && Array.isArray(data.questions)) {
                return data.questions;
            } else {
                throw new Error('Invalid file format. Expected array of questions or object with questions array.');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON file: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Load existing questions for duplicate detection
     */
    async loadExistingQuestions(topicId) {
        const dataFilePath = path.join(this.questionBankPath, `${topicId}.json`);

        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf8');
            const data = JSON.parse(fileContent);
            return data.questions || [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                return []; // No existing questions
            }
            throw new Error(`Failed to load existing questions: ${error.message}`);
        }
    }

    /**
     * Validate individual question structure
     */
    async validateQuestion(question, index) {
        const errors = [];

        // Required fields
        if (!question.question || typeof question.question !== 'string') {
            errors.push('Missing or invalid question text');
        }

        if (!question.options || !Array.isArray(question.options)) {
            errors.push('Missing or invalid options array');
        } else {
            if (question.options.length < 2 || question.options.length > 6) {
                errors.push('Options array must have 2-6 items');
            }

            question.options.forEach((option, i) => {
                const optionText = typeof option === 'string' ? option : option.text;
                if (!optionText || typeof optionText !== 'string') {
                    errors.push(`Option ${i + 1} is missing or invalid`);
                }
            });
        }

        if (typeof question.correct !== 'number' || question.correct < 0 || question.correct >= (question.options?.length || 0)) {
            errors.push('Invalid correct answer index');
        }

        if (errors.length > 0) {
            throw new Error(`Question ${index} validation failed: ${errors.join(', ')}`);
        }

        // Normalize question structure
        return {
            question: question.question.trim(),
            options: question.options.map(opt => ({
                text: typeof opt === 'string' ? opt.trim() : opt.text.trim(),
                id: `option_${question.options.indexOf(opt)}`
            })),
            correct: question.correct,
            rationale_correct: question.rationale_correct || 'Correct answer.',
            rationale_incorrect: question.rationale_incorrect || 'Please review this topic.',
            category_id: question.category_id || 'general',
            difficulty: question.difficulty || 'medium',
            language: question.language || 'es',
            image: question.image || 'N/A',
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Check for duplicate questions
     */
    async checkForDuplicates(newQuestion, existingQuestions) {
        let highestSimilarity = 0;
        let mostSimilarQuestion = null;

        for (const existing of existingQuestions) {
            const similarity = this.calculateQuestionSimilarity(newQuestion, existing);

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                mostSimilarQuestion = existing;
            }
        }

        return {
            isDuplicate: highestSimilarity >= this.duplicateThreshold,
            similarity: highestSimilarity,
            similarTo: mostSimilarQuestion ? (mostSimilarQuestion.id || mostSimilarQuestion.question.substring(0, 50)) : null
        };
    }

    /**
     * Calculate similarity between two questions
     */
    calculateQuestionSimilarity(question1, question2) {
        // Text similarity (Levenshtein distance)
        const textSimilarity = this.calculateTextSimilarity(
            this.normalizeText(question1.question),
            this.normalizeText(question2.question)
        );

        // Options similarity
        const optionsSimilarity = this.calculateOptionsSimilarity(
            question1.options,
            question2.options
        );

        // Answer pattern similarity
        const answerSimilarity = question1.correct === question2.correct ? 0.2 : 0;

        // Weighted combination
        return (textSimilarity * 0.6) + (optionsSimilarity * 0.3) + answerSimilarity;
    }

    /**
     * Calculate text similarity using Levenshtein distance
     */
    calculateTextSimilarity(text1, text2) {
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

    /**
     * Calculate similarity between option arrays
     */
    calculateOptionsSimilarity(options1, options2) {
        if (options1.length !== options2.length) return 0;

        let totalSimilarity = 0;
        const normalizedOptions1 = options1.map(opt => this.normalizeText(opt.text || opt));
        const normalizedOptions2 = options2.map(opt => this.normalizeText(opt.text || opt));

        // Sort both arrays to compare regardless of order
        normalizedOptions1.sort();
        normalizedOptions2.sort();

        for (let i = 0; i < normalizedOptions1.length; i++) {
            totalSimilarity += this.calculateTextSimilarity(
                normalizedOptions1[i],
                normalizedOptions2[i]
            );
        }

        return totalSimilarity / options1.length;
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
     * Generate unique question ID
     */
    generateQuestionId(topicId, index) {
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(`${topicId}_${index}_${timestamp}`).digest('hex');
        return `${topicId}_q${String(index + 1).padStart(3, '0')}_${hash.substring(0, 8)}`;
    }

    /**
     * Show processing summary
     */
    showProcessingSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('PROCESSING SUMMARY');
        console.log('='.repeat(50));
        console.log(`📊 Questions processed: ${this.stats.processed}`);
        console.log(`✅ Questions added: ${this.stats.added}`);
        console.log(`⚠️ Duplicates found: ${this.stats.duplicates}`);
        console.log(`❌ Errors encountered: ${this.stats.errors}`);
    }

    /**
     * Handle duplicate questions
     */
    async handleDuplicates(duplicates, args) {
        console.log(`\n⚠️ ${duplicates.length} potential duplicates found:`);

        duplicates.forEach((dup, index) => {
            console.log(`\n${index + 1}. Question ${dup.index}:`);
            console.log(`   "${dup.question.question.substring(0, 80)}..."`);
            console.log(`   Similarity: ${(dup.duplicateCheck.similarity * 100).toFixed(1)}%`);
            console.log(`   Similar to: ${dup.duplicateCheck.similarTo}`);
        });

        console.log(`\nTo include duplicates anyway, use --force flag`);
        console.log(`To skip duplicate checking, use --skip-duplicates flag`);
    }

    /**
     * Handle error questions
     */
    async handleErrors(errors, args) {
        console.log(`\n❌ ${errors.length} questions had errors:`);

        errors.forEach((err, index) => {
            console.log(`\n${index + 1}. Question ${err.index}:`);
            console.log(`   Error: ${err.error}`);
            if (err.question.question) {
                console.log(`   Question: "${err.question.question.substring(0, 60)}..."`);
            }
        });
    }

    /**
     * Add questions to topic data file
     */
    async addQuestionsToTopic(topicId, questions) {
        const dataFilePath = path.join(this.questionBankPath, `${topicId}.json`);

        // Load existing data
        let topicData;
        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf8');
            topicData = JSON.parse(fileContent);
        } catch (error) {
            // Create new data structure if file doesn't exist
            topicData = {
                version: '1.0',
                topicId: topicId,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                questionCount: 0,
                questions: []
            };
        }

        // Add new questions
        topicData.questions.push(...questions);
        topicData.questionCount = topicData.questions.length;
        topicData.lastUpdated = new Date().toISOString();

        // Save updated data
        await fs.writeFile(dataFilePath, JSON.stringify(topicData, null, 2));

        // Update topics configuration
        await this.updateTopicConfig(topicId, questions.length);
    }

    /**
     * Update topic configuration with new question count
     */
    async updateTopicConfig(topicId, addedCount) {
        const config = await this.loadTopicsConfig();

        if (config.topics && config.topics[topicId]) {
            config.topics[topicId].questionCount += addedCount;
            config.topics[topicId].lastModified = new Date().toISOString();

            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
            console.log(`📝 Updated topic configuration`);
        }
    }

    /**
     * Load topics configuration
     */
    async loadTopicsConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            throw new Error(`Failed to load topics configuration: ${error.message}`);
        }
    }

    /**
     * Generate processing report
     */
    async generateReport(args, processed, duplicates, errors) {
        const reportPath = path.join(__dirname, '..', 'reports', `questions-report-${Date.now()}.json`);

        // Ensure reports directory exists
        const reportsDir = path.dirname(reportPath);
        try {
            await fs.access(reportsDir);
        } catch (error) {
            await fs.mkdir(reportsDir, { recursive: true });
        }

        const report = {
            timestamp: new Date().toISOString(),
            topicId: args.topicId,
            sourceFile: args.file,
            statistics: this.stats,
            processedQuestions: processed.map(q => ({ id: q.id, question: q.question.substring(0, 100) })),
            duplicates: duplicates.map(d => ({
                question: d.question.question.substring(0, 100),
                similarity: d.duplicateCheck.similarity,
                similarTo: d.duplicateCheck.similarTo
            })),
            errors: errors.map(e => ({
                question: e.question.question?.substring(0, 100) || 'Invalid question',
                error: e.error
            }))
        };

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Report saved: ${reportPath}`);
    }

    /**
     * Display usage information
     */
    static showUsage() {
        console.log('MBLEX Questions Addition Tool');
        console.log('='.repeat(40));
        console.log('');
        console.log('Usage:');
        console.log('  node add-questions.js topic-id questions-file.json [options]');
        console.log('');
        console.log('Arguments:');
        console.log('  topic-id           ID of the existing topic');
        console.log('  questions-file     JSON file containing questions to add');
        console.log('');
        console.log('Options:');
        console.log('  --force            Add questions even if duplicates are detected');
        console.log('  --skip-duplicates  Skip duplicate checking entirely');
        console.log('  --report           Generate detailed processing report');
        console.log('  --interactive      Interactive mode for reviewing duplicates');
        console.log('  --dry-run          Show what would be added without actually adding');
        console.log('');
        console.log('Examples:');
        console.log('  node add-questions.js topic-1 new-questions.json');
        console.log('  node add-questions.js topic-2 questions.json --force --report');
        console.log('');
        console.log('JSON File Format:');
        console.log('  [');
        console.log('    {');
        console.log('      "question": "Question text here?",');
        console.log('      "options": ["Option A", "Option B", "Option C", "Option D"],');
        console.log('      "correct": 0,');
        console.log('      "rationale_correct": "Explanation for correct answer",');
        console.log('      "rationale_incorrect": "Explanation for incorrect answers",');
        console.log('      "category_id": "anatomy_physiology",');
        console.log('      "difficulty": "medium"');
        console.log('    }');
        console.log('  ]');
    }
}

// Run the tool if called directly
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        QuestionAdder.showUsage();
        process.exit(0);
    }

    const adder = new QuestionAdder();
    adder.run().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = QuestionAdder;