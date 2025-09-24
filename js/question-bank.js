// Import all question modules
import { apkQuestions } from './questions/apk-questions.js';
import { applicationMassageQuestions } from './questions/application-massage.js';
import { assessmentDiagnosisQuestions } from './questions/assessment-diagnosis.js';
import { ethicsBusinessLegalQuestions } from './questions/ethics-business-legal.js';
import { miscMassageQuestions } from './questions/misc-massage.js';
import { pathologyQuestions } from './questions/pathology.js';

// Topic mapping from category IDs to user-friendly names
export const categoryMapping = {
    'anatomy_physiology_kinesiology_massage': 'Anatomy, Physiology & Kinesiology',
    'application_of_massage': 'Application of Massage Therapy',
    'assessment_diagnosis_massage': 'Assessment & Diagnosis',
    'professionalism_ethics_business_legal': 'Ethics, Business & Legal',
    'random_miscellaneous_therapeutic_massage': 'Miscellaneous Massage Topics',
    'pathology_massage': 'Pathology & Contraindications'
};

// Question file information for processing
export const questionSets = [
    { questions: apkQuestions, name: 'APK Questions' },
    { questions: applicationMassageQuestions, name: 'Application Massage' },
    { questions: assessmentDiagnosisQuestions, name: 'Assessment Diagnosis' },
    { questions: ethicsBusinessLegalQuestions, name: 'Ethics Business Legal' },
    { questions: miscMassageQuestions, name: 'Miscellaneous Massage' },
    { questions: pathologyQuestions, name: 'Pathology' }
];

// Process and combine all questions
export function getAllQuestions() {
    const questionBank = [];
    let totalLoaded = 0;

    console.log('📚 Loading embedded question modules...');

    for (const questionSet of questionSets) {
        try {
            console.log(`Loading ${questionSet.name}...`);

            // Convert questions to quiz generator format
            const processedQuestions = questionSet.questions.map(q => ({
                id: q.id,
                topic: categoryMapping[q.category_id] || q.category_id,
                stem: q.question,
                choices: q.options,
                answer: q.correct,
                rationale: q.feedback,
                category_id: q.category_id
            }));

            questionBank.push(...processedQuestions);
            totalLoaded += processedQuestions.length;
            console.log(`✅ Loaded ${processedQuestions.length} questions from ${questionSet.name}`);

        } catch (error) {
            console.error(`❌ Failed to load ${questionSet.name}:`, error);
        }
    }

    console.log(`🎯 Total questions loaded: ${totalLoaded}`);
    console.log(`📂 Available topics: ${[...new Set(questionBank.map(q => q.topic))].length}`);

    return questionBank;
}

// Get unique topics from all questions
export function getAllTopics() {
    const questions = getAllQuestions();
    return [...new Set(questions.map(q => q.topic))];
}