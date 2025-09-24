#!/usr/bin/env node
/**
 * Add Topic Tool - Content Management Utility
 * Simple command-line tool for adding new topics to the quiz system
 * Usage: node add-topic.js "Topic Title" topic-id [description] [options]
 */

const fs = require('fs').promises;
const path = require('path');

class TopicAdder {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'data', 'topics-config.json');
        this.questionBankPath = path.join(__dirname, '..', 'data', 'questions');
    }

    /**
     * Main execution method
     */
    async run() {
        console.log('🚀 MBLEX Topic Addition Tool');
        console.log('=' .repeat(40));

        try {
            // Parse command line arguments
            const args = this.parseArguments();

            // Validate arguments
            await this.validateArguments(args);

            // Load existing configuration
            const config = await this.loadTopicsConfig();

            // Create new topic
            const newTopic = this.createTopicDefinition(args);

            // Add topic to configuration
            config.topics[args.id] = newTopic;

            // Create data file structure
            await this.createTopicDataFile(args.id);

            // Save updated configuration
            await this.saveTopicsConfig(config);

            // Update question bank manager topic list
            await this.updateQuestionBankManager(newTopic);

            console.log(`✅ Topic "${args.title}" added successfully!`);
            console.log(`   ID: ${args.id}`);
            console.log(`   Data file: ${args.id}.json`);
            console.log(`   Status: Ready for questions`);
            console.log('\nNext steps:');
            console.log(`   1. Add questions using: node add-questions.js ${args.id} questions.json`);
            console.log(`   2. Activate topic when ready`);

        } catch (error) {
            console.error('❌ Error:', error.message);
            console.log('\nUsage:');
            console.log('  node add-topic.js "Topic Title" topic-id [description] [options]');
            console.log('\nExample:');
            console.log('  node add-topic.js "Advanced Kinesiology" topic-2 "Advanced movement analysis"');
            process.exit(1);
        }
    }

    /**
     * Parse command line arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);

        if (args.length < 2) {
            throw new Error('Missing required arguments: title and id');
        }

        return {
            title: args[0],
            id: args[1],
            description: args[2] || `Study materials for ${args[0]}`,
            active: args.includes('--active'),
            language: this.extractOption(args, '--language', 'es'),
            difficulty: this.extractOption(args, '--difficulty', 'mixed'),
            categories: this.extractOption(args, '--categories', '').split(',').filter(c => c.trim())
        };
    }

    /**
     * Extract option value from arguments
     */
    extractOption(args, option, defaultValue) {
        const index = args.indexOf(option);
        return index !== -1 && index + 1 < args.length ? args[index + 1] : defaultValue;
    }

    /**
     * Validate arguments
     */
    async validateArguments(args) {
        // Validate topic ID format
        if (!/^[a-z0-9-]+$/.test(args.id)) {
            throw new Error('Topic ID must contain only lowercase letters, numbers, and hyphens');
        }

        // Check if topic already exists
        try {
            const config = await this.loadTopicsConfig();
            if (config.topics && config.topics[args.id]) {
                throw new Error(`Topic ID "${args.id}" already exists`);
            }
        } catch (error) {
            if (error.message.includes('already exists')) {
                throw error;
            }
            // Config file doesn't exist yet, which is fine
        }

        // Validate title
        if (args.title.length < 3 || args.title.length > 100) {
            throw new Error('Topic title must be between 3 and 100 characters');
        }

        // Validate language
        if (!['en', 'es'].includes(args.language)) {
            throw new Error('Language must be "en" or "es"');
        }

        // Validate difficulty
        if (!['easy', 'medium', 'hard', 'mixed'].includes(args.difficulty)) {
            throw new Error('Difficulty must be "easy", "medium", "hard", or "mixed"');
        }
    }

    /**
     * Load existing topics configuration
     */
    async loadTopicsConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Create default config if file doesn't exist
                return {
                    version: '1.0',
                    lastUpdated: new Date().toISOString(),
                    topics: {}
                };
            }
            throw new Error(`Failed to load topics configuration: ${error.message}`);
        }
    }

    /**
     * Create topic definition object
     */
    createTopicDefinition(args) {
        return {
            id: args.id,
            title: args.title,
            description: args.description,
            questionCount: 0,
            isActive: args.active,
            dataFile: `${args.id}.json`,
            categories: args.categories.length > 0 ? args.categories : ['general'],
            language: args.language,
            difficulty: args.difficulty,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0',
            author: process.env.USER || 'system',
            metadata: {
                estimatedStudyTime: 0,
                prerequisites: [],
                learningObjectives: [],
                tags: []
            }
        };
    }

    /**
     * Create data file for the new topic
     */
    async createTopicDataFile(topicId) {
        // Ensure questions directory exists
        await this.ensureDirectoryExists(this.questionBankPath);

        const dataFilePath = path.join(this.questionBankPath, `${topicId}.json`);

        // Create empty question structure
        const questionData = {
            version: '1.0',
            topicId: topicId,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            questionCount: 0,
            questions: []
        };

        await fs.writeFile(dataFilePath, JSON.stringify(questionData, null, 2));
        console.log(`📁 Created data file: ${dataFilePath}`);
    }

    /**
     * Ensure directory exists
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (error) {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
    }

    /**
     * Save topics configuration
     */
    async saveTopicsConfig(config) {
        config.lastUpdated = new Date().toISOString();
        config.topicCount = Object.keys(config.topics).length;

        // Ensure data directory exists
        const dataDir = path.dirname(this.configPath);
        await this.ensureDirectoryExists(dataDir);

        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
        console.log(`💾 Updated topics configuration: ${this.configPath}`);
    }

    /**
     * Update question bank manager topic list
     */
    async updateQuestionBankManager(newTopic) {
        const managerPath = path.join(__dirname, '..', 'js', 'question-bank-manager.js');

        try {
            let managerContent = await fs.readFile(managerPath, 'utf8');

            // Find the topics Map definition
            const topicsMapRegex = /this\.topics = new Map\(\[([^]+?)\]\);/;
            const match = managerContent.match(topicsMapRegex);

            if (match) {
                const existingTopics = match[1];

                // Generate new topic entry
                const newTopicEntry = `            ['${newTopic.id}', {
                id: '${newTopic.id}',
                title: '${newTopic.title}',
                description: '${newTopic.description}',
                questionCount: ${newTopic.questionCount},
                isActive: ${newTopic.isActive},
                dataFile: '${newTopic.dataFile}',
                categories: [${newTopic.categories.map(c => `'${c}'`).join(', ')}],
                language: '${newTopic.language}',
                difficulty: '${newTopic.difficulty}',
                createdAt: '${newTopic.createdAt}'
            }]`;

                // Insert new topic entry
                const updatedTopics = existingTopics.trim().endsWith(',')
                    ? `${existingTopics}\n${newTopicEntry}`
                    : `${existingTopics},\n${newTopicEntry}`;

                const updatedContent = managerContent.replace(
                    topicsMapRegex,
                    `this.topics = new Map([\n${updatedTopics}\n        ]);`
                );

                await fs.writeFile(managerPath, updatedContent);
                console.log(`📝 Updated question bank manager with new topic`);
            } else {
                console.warn('⚠️ Could not automatically update question bank manager');
                console.log('   Please manually add the topic to the topics Map in question-bank-manager.js');
            }
        } catch (error) {
            console.warn(`⚠️ Could not update question bank manager: ${error.message}`);
            console.log('   Please manually add the topic to the topics Map in question-bank-manager.js');
        }
    }

    /**
     * Display usage information
     */
    static showUsage() {
        console.log('MBLEX Topic Addition Tool');
        console.log('='.repeat(40));
        console.log('');
        console.log('Usage:');
        console.log('  node add-topic.js "Topic Title" topic-id [description] [options]');
        console.log('');
        console.log('Arguments:');
        console.log('  Topic Title    The display name for the topic (in quotes)');
        console.log('  topic-id       Unique identifier (lowercase, hyphens allowed)');
        console.log('  description    Optional description of the topic');
        console.log('');
        console.log('Options:');
        console.log('  --active              Mark topic as active immediately');
        console.log('  --language en|es      Set language (default: es)');
        console.log('  --difficulty easy|medium|hard|mixed  Set difficulty (default: mixed)');
        console.log('  --categories cat1,cat2  Comma-separated categories');
        console.log('');
        console.log('Examples:');
        console.log('  node add-topic.js "Advanced Kinesiology" topic-2');
        console.log('  node add-topic.js "Clinical Assessment" topic-3 "Advanced clinical evaluation" --active');
        console.log('  node add-topic.js "Pathology Review" topic-4 "Disease conditions" --categories pathology,contraindications');
    }
}

// Run the tool if called directly
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        TopicAdder.showUsage();
        process.exit(0);
    }

    const adder = new TopicAdder();
    adder.run().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = TopicAdder;