/**
 * MBLEX Massage Therapy Simulation Scenarios
 * Professional massage therapy practice scenarios for licensure exam preparation
 * Focus: Contraindications, ethics, legal issues, and client-therapist interactions
 */

const SIMULATION_SCENARIOS = [
    {
        id: 'contraindication_intake',
        title: 'Identifying and Responding to Contraindications During Intake',
        difficulty: 'intermediate',
        category: 'contraindications',
        estimatedTime: '8-10 minutes',
        tags: ['assessment', 'safety', 'pathology', 'intake'],
        
        patient: {
            name: 'Sarah Johnson',
            age: 45,
            gender: 'Female',
            occupation: 'Office Worker',
            photo: 'assets/images/patients/sarah-johnson.jpg',
            chiefComplaint: 'Chronic shoulder tension due to desk work stress',
            presentation: 'Patient appears flushed with occasional cough, mentions feeling unwell',
            history: [
                'Desk job for 10+ years',
                'Previous massage therapy treatments',
                'No known allergies'
            ],
            currentSymptoms: [
                'Low-grade fever (started yesterday)',
                'Sore throat',
                'General fatigue',
                'Occasional cough'
            ]
        },
        
        vitals: {
            temperature: '100.2°F (elevated)',
            appearance: 'Flushed, tired',
            voice: 'Slightly hoarse',
            energy: 'Low, lethargic'
        },
        
        learningObjectives: [
            'Recognize absolute contraindications during intake',
            'Apply proper assessment protocols for illness',
            'Demonstrate professional referral procedures',
            'Understand infection control principles'
        ],
        
        correctIntervention: 'Recognize systemic infection as absolute contraindication, cancel session, advise medical consultation, reschedule after clearance',
        
        steps: [
            {
                id: 'step_1',
                title: 'Initial Assessment Response',
                context: 'Sarah mentions fever, sore throat, and fatigue that started yesterday. She appears flushed and coughs occasionally.',
                question: 'What is the first action you should take upon hearing Sarah\'s symptoms?',
                choices: [
                    {
                        id: 'A',
                        text: 'Suggest herbal tea to soothe her throat before starting.',
                        correct: false,
                        rationale: 'Incorrect. Suggesting remedies exceeds your scope of practice and ignores the contraindication. As a massage therapist, you cannot recommend treatments for illness.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Proceed with a light session but avoid deep pressure.',
                        correct: false,
                        rationale: 'Incorrect. Any massage is contraindicated during potential infections to prevent spreading illness and compromising the immune system.',
                        points: 0
                    },
                    {
                        id: 'C',
                        text: 'Immediately assess for additional signs like swollen lymph nodes or chills.',
                        correct: true,
                        rationale: 'Excellent choice! Assessing for additional symptoms helps confirm if it\'s an acute infection, aligning with pathology guidelines to rule out contraindications early in the process.',
                        points: 10
                    },
                    {
                        id: 'D',
                        text: 'Document the symptoms and continue if she signs a waiver.',
                        correct: false,
                        rationale: 'Incorrect. Waivers don\'t override safety protocols when contraindications exist. Professional assessment and client safety must come first.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_2',
                title: 'Contraindication Confirmation',
                context: 'Your assessment confirms symptoms consistent with a systemic infection: elevated temperature, fatigue, and respiratory symptoms.',
                question: 'After confirming symptoms suggest an infection, what should you do next?',
                choices: [
                    {
                        id: 'A',
                        text: 'Offer to massage her feet only, as it\'s away from the affected area.',
                        correct: false,
                        rationale: 'Incorrect. Local avoidance doesn\'t address systemic risks. Infections affect the entire body and massage can compromise immune function.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Advise her to see a doctor and cancel the session immediately.',
                        correct: true,
                        rationale: 'Excellent! This prioritizes client safety by referring to appropriate medical care and avoiding treatment during acute illness, following professional standards.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Ask about her vaccination history to decide.',
                        correct: false,
                        rationale: 'Incorrect. Vaccination details aren\'t relevant for immediate contraindication decisions. Current symptoms take precedence over vaccination status.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Apply a hot pack to her shoulders to test response.',
                        correct: false,
                        rationale: 'Incorrect. Heat application could worsen infection symptoms and doesn\'t address the fundamental contraindication for massage during illness.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_3',
                title: 'Return Protocol',
                context: 'Sarah recovers from her illness and contacts you to reschedule her massage appointment.',
                question: 'When Sarah recovers and returns, what final step ensures safe treatment?',
                choices: [
                    {
                        id: 'A',
                        text: 'Require a physician\'s release confirming she\'s no longer contagious.',
                        correct: true,
                        rationale: 'Excellent! Obtaining medical clearance verifies complete recovery and adheres to professional standards for post-contraindication care and client safety.',
                        points: 10
                    },
                    {
                        id: 'B',
                        text: 'Perform the full session without revisiting the issue.',
                        correct: false,
                        rationale: 'Incorrect. Ignoring previous contraindication history risks recurrence and doesn\'t follow proper documentation and safety protocols.',
                        points: 0
                    },
                    {
                        id: 'C',
                        text: 'Use aromatherapy to boost her immune system.',
                        correct: false,
                        rationale: 'Incorrect. Making claims about boosting immunity is outside the scope of practice without proper training and certification in aromatherapy.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Have her fill out a new intake form but proceed anyway.',
                        correct: false,
                        rationale: 'Incorrect. A new intake form alone isn\'t sufficient without medical verification that the contraindication has been resolved.',
                        points: 0
                    }
                ]
            }
        ]
    },

    {
        id: 'ethical_boundaries',
        title: 'Maintaining Ethical Boundaries in Client Interactions',
        difficulty: 'intermediate',
        category: 'ethics',
        estimatedTime: '6-8 minutes',
        tags: ['boundaries', 'ethics', 'professionalism', 'transference'],
        
        patient: {
            name: 'Michael Lee',
            age: 32,
            gender: 'Male',
            occupation: 'Fitness Enthusiast',
            photo: 'assets/images/patients/michael-lee.jpg',
            chiefComplaint: 'Lower back pain from gym workouts',
            presentation: 'Friendly, talkative client sharing personal information',
            history: [
                'Regular gym attendance',
                'Previous massage therapy',
                'Recently divorced'
            ],
            currentConcerns: [
                'Lower back muscle tension',
                'Stress from life changes',
                'Seeking emotional support'
            ]
        },
        
        vitals: {
            physicalState: 'Healthy, fit individual',
            mentalState: 'Emotionally vulnerable',
            communication: 'Oversharing personal details',
            boundaries: 'Testing professional limits'
        },
        
        learningObjectives: [
            'Recognize transference and boundary crossing',
            'Maintain professional therapeutic boundaries',
            'Apply appropriate communication techniques',
            'Handle dual relationship situations'
        ],
        
        correctIntervention: 'Recognize transference, reinforce professional boundaries, redirect conversation, document interaction, and refer if necessary',
        
        steps: [
            {
                id: 'step_1',
                title: 'Personal Question Response',
                context: 'Michael starts sharing details about his recent divorce and asks about your relationship status during the massage.',
                question: 'What is your initial response to Michael\'s personal questions?',
                choices: [
                    {
                        id: 'A',
                        text: 'Share a bit about your life to build rapport.',
                        correct: false,
                        rationale: 'Incorrect. Sharing personal information risks countertransference and compromises professional boundaries, potentially leading to dual relationships.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Politely redirect to his back pain and treatment goals.',
                        correct: true,
                        rationale: 'Excellent! This maintains professional boundaries by focusing on therapeutic topics, preventing dual relationships while remaining respectful.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Ignore it and continue massaging silently.',
                        correct: false,
                        rationale: 'Incorrect. Silence doesn\'t address the boundary crossing and may be perceived as rude or uncomfortable by the client.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Ask him more about his divorce to empathize.',
                        correct: false,
                        rationale: 'Incorrect. Delving deeper into personal matters encourages inappropriate disclosure and moves away from therapeutic focus.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_2',
                title: 'Social Invitation Response',
                context: 'Michael persists and suggests meeting for coffee after the session to "continue the conversation."',
                question: 'How should you respond to his coffee invitation?',
                choices: [
                    {
                        id: 'A',
                        text: 'Agree but specify it\'s professional only.',
                        correct: false,
                        rationale: 'Incorrect. Any agreement blurs professional lines. There\'s no such thing as "professional only" social meetings between therapist and client.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Firmly state that social interactions are outside professional boundaries.',
                        correct: true,
                        rationale: 'Excellent! Clear communication reinforces ethical boundaries and educates the client about professional standards while remaining respectful.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'End the session early without explanation.',
                        correct: false,
                        rationale: 'Incorrect. Abrupt ending without explanation lacks professionalism and doesn\'t educate the client about appropriate boundaries.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Suggest he finds another therapist immediately.',
                        correct: false,
                        rationale: 'Incorrect. Referral is a later step if boundary issues persist. First attempt clear communication about professional standards.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_3',
                title: 'Documentation and Follow-up',
                context: 'You\'ve addressed the boundary issue professionally and the session continues appropriately.',
                question: 'What final action should you take to wrap up this situation ethically?',
                choices: [
                    {
                        id: 'A',
                        text: 'Document the interaction in notes and monitor future sessions.',
                        correct: true,
                        rationale: 'Excellent! Documentation protects both parties, ensures continuity in ethical practice, and provides a record if issues persist.',
                        points: 10
                    },
                    {
                        id: 'B',
                        text: 'Give him your personal contact for follow-up.',
                        correct: false,
                        rationale: 'Incorrect. This directly violates the boundaries you just established and creates inappropriate dual relationships.',
                        points: 0
                    },
                    {
                        id: 'C',
                        text: 'Apologize for any misunderstanding.',
                        correct: false,
                        rationale: 'Incorrect. No apology is needed for upholding professional ethics and boundaries. Apologizing may suggest you did something wrong.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Offer a discount for the discomfort.',
                        correct: false,
                        rationale: 'Incorrect. Offering discounts could imply fault in maintaining boundaries and may inadvertently reward boundary-testing behavior.',
                        points: 0
                    }
                ]
            }
        ]
    },

    {
        id: 'scope_of_practice',
        title: 'Handling Informed Consent and Scope of Practice Violations',
        difficulty: 'advanced',
        category: 'legal_scope',
        estimatedTime: '8-12 minutes',
        tags: ['scope', 'diagnosis', 'consent', 'referral'],
        
        patient: {
            name: 'Elena Ramirez',
            age: 58,
            gender: 'Female',
            occupation: 'Retired Teacher',
            photo: 'assets/images/patients/elena-ramirez.jpg',
            chiefComplaint: 'Knee pain after a fall',
            presentation: 'Anxious about undiagnosed pain, seeking answers',
            history: [
                'Recent fall at home',
                'No medical evaluation yet',
                'Previous arthritis concerns'
            ],
            currentSymptoms: [
                'Knee pain and stiffness',
                'Difficulty with stairs',
                'Swelling around joint'
            ]
        },
        
        vitals: {
            mobility: 'Limited due to knee discomfort',
            swelling: 'Mild edema around knee joint',
            painLevel: '6/10 with movement',
            concern: 'High anxiety about potential diagnosis'
        },
        
        learningObjectives: [
            'Understand scope of practice limitations',
            'Properly obtain informed consent',
            'Avoid unauthorized medical diagnosis',
            'Make appropriate referrals to healthcare providers'
        ],
        
        correctIntervention: 'Explain scope limitations, obtain proper informed consent, avoid diagnosing, refer to physician for evaluation',
        
        steps: [
            {
                id: 'step_1',
                title: 'Diagnosis Request Response',
                context: 'Elena asks if her knee pain is from arthritis and requests your professional opinion on what\'s causing her symptoms.',
                question: 'How should you respond to her request for a diagnosis?',
                choices: [
                    {
                        id: 'A',
                        text: 'Palpate the knee and suggest it\'s likely arthritis.',
                        correct: false,
                        rationale: 'Incorrect. Providing a diagnosis violates scope of practice regulations and constitutes unauthorized practice of medicine.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Explain that diagnosing is outside your scope of practice.',
                        correct: true,
                        rationale: 'Excellent! This upholds legal scope of practice and prevents unauthorized medical diagnosis while educating the client about professional boundaries.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Recommend over-the-counter pain relief.',
                        correct: false,
                        rationale: 'Incorrect. Recommending medications exceeds scope of practice and could interfere with potential medical treatments.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Proceed with massage to assess the problem further.',
                        correct: false,
                        rationale: 'Incorrect. Assessment without proper consent and while client expects diagnosis risks legal and ethical issues.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_2',
                title: 'Informed Consent Process',
                context: 'You\'ve explained your scope limitations. Elena still wants massage therapy for her knee area.',
                question: 'How should you handle the informed consent process for this session?',
                choices: [
                    {
                        id: 'A',
                        text: 'Have her verbally agree and start the session.',
                        correct: false,
                        rationale: 'Incorrect. Verbal consent alone isn\'t sufficient for documentation and legal protection, especially with potential injury involved.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Provide a written form outlining benefits, risks, and limitations.',
                        correct: true,
                        rationale: 'Excellent! Written informed consent ensures client understanding, provides legal protection, and documents acknowledgment of scope limitations.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Skip the consent process since she\'s eager to begin.',
                        correct: false,
                        rationale: 'Incorrect. Informed consent is always required before treatment, regardless of client eagerness or apparent understanding.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Ask her to sign consent forms after the session.',
                        correct: false,
                        rationale: 'Incorrect. Informed consent must be obtained before treatment begins, not afterward, to be legally and ethically valid.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_3',
                title: 'Professional Referral',
                context: 'The session is complete. Elena still expresses concern about her undiagnosed knee pain.',
                question: 'What referral action should you take regarding her ongoing concerns?',
                choices: [
                    {
                        id: 'A',
                        text: 'Suggest she sees a doctor for proper diagnosis and evaluation.',
                        correct: true,
                        rationale: 'Excellent! Referral to appropriate medical professionals ensures comprehensive care and stays within your scope of practice.',
                        points: 10
                    },
                    {
                        id: 'B',
                        text: 'Offer to book her next massage appointment.',
                        correct: false,
                        rationale: 'Incorrect. This doesn\'t address the undiagnosed medical issue and could delay necessary medical intervention.',
                        points: 0
                    },
                    {
                        id: 'C',
                        text: 'Prescribe specific home exercises for her knee.',
                        correct: false,
                        rationale: 'Incorrect. Prescribing exercises exceeds scope of practice without proper training and assessment by qualified professionals.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Ignore the issue if her pain improved during the session.',
                        correct: false,
                        rationale: 'Incorrect. Temporary improvement doesn\'t negate the need for proper medical evaluation of an undiagnosed injury.',
                        points: 0
                    }
                ]
            }
        ]
    },

    {
        id: 'emergency_management',
        title: 'Managing Acute Symptoms or Emergencies During a Session',
        difficulty: 'advanced',
        category: 'emergency',
        estimatedTime: '6-10 minutes',
        tags: ['emergency', 'assessment', 'safety', 'protocol'],
        
        patient: {
            name: 'David Thompson',
            age: 40,
            gender: 'Male',
            occupation: 'Executive',
            photo: 'assets/images/patients/david-thompson.jpg',
            chiefComplaint: 'Upper back tension from work stress',
            presentation: 'Initially comfortable, then develops acute symptoms',
            history: [
                'High-stress job',
                'Occasional headaches',
                'No known cardiac issues'
            ],
            acuteSymptoms: [
                'Sudden dizziness',
                'Nausea',
                'Chest tightness',
                'Shortness of breath'
            ]
        },
        
        vitals: {
            consciousness: 'Alert but distressed',
            breathing: 'Shallow, rapid',
            skin: 'Pale, diaphoretic',
            position: 'Prone on massage table'
        },
        
        learningObjectives: [
            'Recognize emergency symptoms during treatment',
            'Apply immediate response protocols',
            'Assess severity of acute conditions',
            'Execute proper emergency procedures'
        ],
        
        correctIntervention: 'Stop session immediately, assess for emergency signs, provide immediate aid, reposition safely, and call for medical help',
        
        steps: [
            {
                id: 'step_1',
                title: 'Immediate Response to Acute Symptoms',
                context: 'Midway through the session, David suddenly complains of dizziness, nausea, and chest tightness.',
                question: 'What is your immediate response to these acute symptoms?',
                choices: [
                    {
                        id: 'A',
                        text: 'Continue with lighter pressure to see if symptoms pass.',
                        correct: false,
                        rationale: 'Incorrect. Continuing treatment when acute symptoms appear risks worsening the condition and delays appropriate intervention.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Stop the massage immediately and help him sit up slowly.',
                        correct: true,
                        rationale: 'Excellent! Stopping treatment and repositioning prioritizes safety, prevents further symptoms, and allows proper assessment of severity.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Apply specific pressure points for nausea relief.',
                        correct: false,
                        rationale: 'Incorrect. Acupressure techniques aren\'t appropriate for potential emergencies and could delay necessary medical intervention.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Instruct him to breathe deeply and try to relax.',
                        correct: false,
                        rationale: 'Incorrect. While breathing techniques can help, they don\'t address the acute nature of symptoms that may indicate a medical emergency.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_2',
                title: 'Assessment and Monitoring',
                context: 'You\'ve helped David to a sitting position. He\'s still experiencing symptoms but is alert and responsive.',
                question: 'What should you do next to properly assess the situation?',
                choices: [
                    {
                        id: 'A',
                        text: 'Resume the massage if he reports feeling slightly better.',
                        correct: false,
                        rationale: 'Incorrect. Acute symptoms indicate session termination regardless of temporary improvement. Safety protocols must be followed.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Monitor his condition and ask about relevant medical history.',
                        correct: true,
                        rationale: 'Excellent! Monitoring vital signs and reviewing medical history helps determine if this is a medical emergency requiring immediate intervention.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Offer water and suggest he leave early to rest.',
                        correct: false,
                        rationale: 'Incorrect. This approach skips proper assessment and may not be appropriate if symptoms indicate a serious medical condition.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Call a friend or family member to pick him up.',
                        correct: false,
                        rationale: 'Incorrect. Professional emergency response protocols should be followed first before involving personal contacts.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_3',
                title: 'Emergency Protocol Decision',
                context: 'David\'s symptoms persist: chest tightness continues, he\'s pale and sweating, with ongoing dizziness.',
                question: 'Given the persistence of symptoms, what final step should you take?',
                choices: [
                    {
                        id: 'A',
                        text: 'Suggest he drives home carefully to rest and recover.',
                        correct: false,
                        rationale: 'Incorrect. Driving with persistent symptoms is extremely dangerous and could result in accidents or delayed medical care.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Call emergency services immediately for professional evaluation.',
                        correct: true,
                        rationale: 'Excellent! Escalating to emergency professionals ensures client safety in potential cardiac or other serious emergencies requiring immediate medical attention.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Document the incident and reschedule for next week.',
                        correct: false,
                        rationale: 'Incorrect. Documentation is important but doesn\'t address the immediate need for medical evaluation of acute symptoms.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Apply ice packs to his chest to relieve tightness.',
                        correct: false,
                        rationale: 'Incorrect. Ice application isn\'t indicated for chest symptoms without proper diagnosis and could delay appropriate emergency care.',
                        points: 0
                    }
                ]
            }
        ]
    },

    {
        id: 'documentation_privacy',
        title: 'Navigating Legal and Professional Documentation Issues',
        difficulty: 'intermediate',
        category: 'legal_documentation',
        estimatedTime: '7-9 minutes',
        tags: ['documentation', 'privacy', 'HIPAA', 'insurance'],
        
        patient: {
            name: 'Lisa Chen',
            age: 28,
            gender: 'Female',
            occupation: 'Marketing Professional',
            photo: 'assets/images/patients/lisa-chen.jpg',
            chiefComplaint: 'Neck stiffness following motor vehicle accident',
            presentation: 'Professional, concerned about privacy and insurance',
            history: [
                'Recent motor vehicle accident',
                'No previous massage therapy',
                'Active insurance claim'
            ],
            concerns: [
                'Persistent neck stiffness',
                'Insurance documentation needs',
                'Privacy of personal information'
            ]
        },
        
        vitals: {
            mobility: 'Limited neck rotation',
            painLevel: '5/10 with movement',
            muscleTension: 'Significant cervical spasms',
            documentation: 'Insurance requires detailed records'
        },
        
        learningObjectives: [
            'Maintain client confidentiality standards',
            'Create appropriate SOAP documentation',
            'Handle insurance documentation requests',
            'Manage privacy breaches appropriately'
        ],
        
        correctIntervention: 'Ensure confidentiality, create accurate SOAP notes, comply with legal documentation requirements while protecting privacy',
        
        steps: [
            {
                id: 'step_1',
                title: 'Privacy Breach Management',
                context: 'During intake, Lisa shares confidential accident details, and you notice a colleague overhearing from nearby.',
                question: 'What should you do first when you notice the privacy breach?',
                choices: [
                    {
                        id: 'A',
                        text: 'Ignore it since it was accidental and minor.',
                        correct: false,
                        rationale: 'Incorrect. All privacy breaches must be addressed immediately, regardless of intent. Confidentiality is fundamental to professional practice.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Move to a private area and apologize for the breach.',
                        correct: true,
                        rationale: 'Excellent! This upholds HIPAA-like confidentiality standards, corrects the breach immediately, and demonstrates professional responsibility.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Ask the colleague to join the conversation.',
                        correct: false,
                        rationale: 'Incorrect. This would worsen the privacy violation by intentionally involving unauthorized personnel in confidential information.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Share the notes with the colleague later for input.',
                        correct: false,
                        rationale: 'Incorrect. Sharing confidential client information with unauthorized colleagues violates professional ethics and privacy laws.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_2',
                title: 'Insurance Documentation Request',
                context: 'Lisa requests copies of her session notes for her insurance claim related to the accident.',
                question: 'How should you handle her request for documentation?',
                choices: [
                    {
                        id: 'A',
                        text: 'Provide complete notes including all personal details shared.',
                        correct: false,
                        rationale: 'Incorrect. Full notes may contain information not relevant to insurance and could compromise privacy beyond what\'s necessary.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Prepare professional SOAP notes focused on treatment only.',
                        correct: true,
                        rationale: 'Excellent! Redacted SOAP notes comply with legal requirements while protecting confidentiality by including only treatment-relevant information.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Refuse to provide any notes as they are private.',
                        correct: false,
                        rationale: 'Incorrect. Clients have legal rights to their treatment records, and proper documentation is required for insurance claims.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Charge an additional fee for copying services.',
                        correct: false,
                        rationale: 'Incorrect. While fees may be appropriate, the focus should be on proper documentation format and privacy protection first.',
                        points: 0
                    }
                ]
            },
            {
                id: 'step_3',
                title: 'Documentation and Incident Recording',
                context: 'You\'ve provided appropriate documentation to Lisa and resolved the privacy breach from earlier.',
                question: 'What final documentation step should you complete?',
                choices: [
                    {
                        id: 'A',
                        text: 'File the notes without any additional review or notation.',
                        correct: false,
                        rationale: 'Incorrect. Proper review and incident documentation are necessary for legal accountability and quality assurance.',
                        points: 0
                    },
                    {
                        id: 'B',
                        text: 'Document the privacy incident and corrective actions taken.',
                        correct: true,
                        rationale: 'Excellent! Documenting incidents and responses ensures legal accountability, professional integrity, and helps prevent future breaches.',
                        points: 10
                    },
                    {
                        id: 'C',
                        text: 'Delete all notes after providing copies to insurance.',
                        correct: false,
                        rationale: 'Incorrect. Deleting records violates retention requirements and professional standards for maintaining client documentation.',
                        points: 0
                    },
                    {
                        id: 'D',
                        text: 'Send documentation directly to insurance company.',
                        correct: false,
                        rationale: 'Incorrect. Direct communication with insurance requires explicit client authorization and may bypass client control over their information.',
                        points: 0
                    }
                ]
            }
        ]
    }
];

// Export scenarios for use in simulation game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SIMULATION_SCENARIOS };
} else if (typeof window !== 'undefined') {
    window.SIMULATION_SCENARIOS = SIMULATION_SCENARIOS;
}