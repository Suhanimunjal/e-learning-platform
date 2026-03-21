"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGeneratorEnhancedService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ContentGeneratorEnhancedService = class ContentGeneratorEnhancedService {
    constructor() {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
        }
    }
    async generateFullContent(topic, moduleTitle, difficulty = 'intermediate') {
        const prompt = this.buildContentPrompt(topic, moduleTitle, difficulty);
        try {
            const response = await axios_1.default.post(`${this.baseUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                throw new Error('Failed to generate content - no response from API');
            }
            let parsed;
            try {
                parsed = JSON.parse(content);
            }
            catch (parseError) {
                if (parseError instanceof SyntaxError) {
                    throw new Error(`Invalid JSON response from API: ${parseError.message}. Response was: ${content.substring(0, 200)}`);
                }
                throw parseError;
            }
            const requiredFields = ['topic', 'title', 'quiz', 'assignment'];
            const missingFields = requiredFields.filter(field => !(field in parsed));
            if (missingFields.length > 0) {
                throw new Error(`Invalid content structure - missing required fields: ${missingFields.join(', ')}`);
            }
            return parsed;
        }
        catch (error) {
            console.error('Content generation error:', error?.response?.data || error?.message || error);
            throw new Error(error?.response?.data?.error?.message || 'Failed to generate content with AI');
        }
    }
    async generateCourseOutline(courseName, difficulty, moduleCount) {
        const prompt = `Generate a course outline in strict JSON.

Course name: ${courseName}
Difficulty: ${difficulty}
Required modules: ${moduleCount}

Rules:
- Return at least ${moduleCount} modules.
- Each module must contain 2 to 3 lesson titles.
- Keep titles specific, practical, and progressively ordered.
- Output must be valid JSON only.

JSON shape:
{
  "courseTitle": "${courseName}",
  "difficulty": "${difficulty}",
  "modules": [
    {
      "title": "Module title",
      "description": "Short description",
      "lessons": ["Lesson 1", "Lesson 2", "Lesson 3"]
    }
  ]
}`;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json',
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                throw new Error('Failed to generate outline - no response from API');
            }
            const parsed = JSON.parse(content);
            if (!Array.isArray(parsed?.modules)) {
                throw new Error('Generated outline is missing modules array');
            }
            return parsed;
        }
        catch (error) {
            console.error('Course outline generation error:', error?.response?.data || error?.message || error);
            throw new Error(error?.response?.data?.error?.message || 'Failed to generate course outline with AI');
        }
    }
    buildContentPrompt(topic, moduleTitle, difficulty = 'intermediate') {
        return `You are an expert course creator building a COMPLETE lesson module.

Topic: ${topic}
${moduleTitle ? `Module Title: ${moduleTitle}` : ''}
Difficulty: ${difficulty}

Generate a detailed, structured lesson with the following sections (MINIMUM 800-1200 words total):

1. Introduction - Clear explanation, why it matters, learning objectives
2. Theory - Definitions, background, terminology, misconceptions
3. Core Concepts - Deep explanations with analogies
4. Real-World Examples - At least 2 practical examples with code if applicable
5. Practice/Lab - Guided exercises, independent tasks, challenge, mini-project
6. Quiz - 5 MCQs + 2 Short Answer questions with answers and explanations
7. Assignment - Real-world problem with rubric
8. Summary - Key points and takeaways
9. Common Mistakes - How to avoid and debug
10. Advanced Insights - Optimization, edge cases, best practices
11. Resources - Recommended learning materials
12. Next Preview - What comes next

Generate valid JSON with this exact structure (fill all fields with real, detailed content):
{
  "topic": "${topic}",
  "title": "module title",
  "introduction": {
    "whatIsIt": "2-3 sentence explanation",
    "whyImportant": "why it matters",
    "realWorldUse": "industry use",
    "learningObjectives": ["5 objectives"],
    "prerequisites": ["prerequisites"],
    "estimatedTime": "30-45 minutes"
  },
  "theory": {
    "definitions": [{"term": "x", "explanation": "y"}],
    "background": "background",
    "terminology": [{"term": "x", "meaning": "y"}],
    "misconceptions": ["misconceptions"]
  },
  "concepts": [{"title": "x", "explanation": "y", "analogy": "a", "realLifeMapping": "b"}],
  "examples": [{"level": "beginner", "title": "x", "description": "y", "code": "code", "explanation": "z", "output": "out"}],
  "practice": {
    "guidedExercise": {"title": "x", "instructions": ["s1", "s2"], "hints": ["h1"]},
    "independentTasks": [{"title": "x", "instructions": ["i1"], "hints": ["h1"]}],
    "challenge": {"title": "x", "instructions": ["c1"], "hints": ["h1"]},
    "miniProject": {"title": "x", "description": "y", "requirements": ["r1"], "evaluationCriteria": ["e1"]}
  },
  "quiz": {
    "questions": [
      {"question": "q", "type": "multiple_choice", "options": ["a","b","c","d"], "correctAnswer": "a", "explanation": "e", "difficulty": "medium"},
      {"question": "q", "type": "short_answer", "correctAnswer": "a", "explanation": "e", "difficulty": "medium"}
    ]
  },
  "assignment": {
    "problemStatement": "problem",
    "instructions": ["s1", "s2"],
    "expectedOutput": "output",
    "rubric": [{"criterion": "c", "points": 10, "description": "d"}]
  },
  "summary": {
    "keyPoints": ["p1", "p2"],
    "importantIdeas": ["i1"],
    "rememberPoints": ["r1"]
  },
  "mistakes": [{"mistake": "m", "correction": "c", "debuggingTip": "t"}],
  "advanced": {
    "optimizationTechniques": ["t1"],
    "edgeCases": ["e1"],
    "industryPractices": ["p1"]
  },
  "resources": [{"title": "t", "url": "https://example.com", "type": "documentation"}],
  "nextPreview": "preview of next module"
}

IMPORTANT: Make content DETAILED and REAL - no placeholders. Include working code examples for programming topics.`;
    }
    async generateIntroduction(topic) {
        const content = await this.generateFullContent(topic);
        return content.introduction;
    }
    async generateQuiz(topic) {
        const content = await this.generateFullContent(topic);
        return content.quiz;
    }
    async generateAssignment(topic) {
        const content = await this.generateFullContent(topic);
        return content.assignment;
    }
    convertToNarrativeText(content) {
        const parts = [];
        parts.push(`Introduction to ${content.title}`);
        parts.push(content.introduction.whatIsIt);
        parts.push(content.introduction.whyImportant);
        parts.push('\nKey Concepts:\n');
        content.concepts.forEach((concept, i) => {
            parts.push(`${i + 1}. ${concept.title}`);
            parts.push(concept.explanation);
        });
        parts.push('\nExamples:\n');
        content.examples.forEach((example, i) => {
            parts.push(`${i + 1}. ${example.title}`);
            parts.push(example.description);
            if (example.explanation) {
                parts.push(example.explanation);
            }
        });
        parts.push('\nSummary:\n');
        content.summary.keyPoints.forEach(point => {
            parts.push(`• ${point}`);
        });
        return parts.join('\n\n');
    }
};
exports.ContentGeneratorEnhancedService = ContentGeneratorEnhancedService;
exports.ContentGeneratorEnhancedService = ContentGeneratorEnhancedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContentGeneratorEnhancedService);
//# sourceMappingURL=content-generator-enhanced.service.js.map