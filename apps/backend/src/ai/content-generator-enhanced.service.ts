import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface StructuredContent {
  topic: string;
  title: string;
  introduction: IntroductionSection;
  theory: TheorySection;
  concepts: Concept[];
  examples: Example[];
  practice: PracticeSection;
  quiz: QuizSection;
  assignment: AssignmentSection;
  summary: SummarySection;
  mistakes: Mistake[];
  advanced: AdvancedSection;
  resources: Resource[];
  nextPreview: string;
}

export interface IntroductionSection {
  whatIsIt: string;
  whyImportant: string;
  realWorldUse: string;
  learningObjectives: string[];
  prerequisites: string[];
  estimatedTime: string;
}

export interface TheorySection {
  definitions: Definition[];
  background: string;
  terminology: Terminology[];
  misconceptions: string[];
}

export interface Definition {
  term: string;
  explanation: string;
}

export interface Terminology {
  term: string;
  meaning: string;
}

export interface Concept {
  title: string;
  explanation: string;
  analogy: string;
  realLifeMapping: string;
}

export interface Example {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  code?: string;
  explanation: string;
  output?: string;
}

export interface PracticeSection {
  guidedExercise: Exercise;
  independentTasks: Exercise[];
  challenge: Exercise;
  miniProject: Project;
}

export interface Exercise {
  title: string;
  instructions: string[];
  hints?: string[];
}

export interface Project {
  title: string;
  description: string;
  requirements: string[];
  evaluationCriteria: string[];
}

export interface QuizSection {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssignmentSection {
  problemStatement: string;
  instructions: string[];
  expectedOutput: string;
  rubric: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  points: number;
  description: string;
}

export interface SummarySection {
  keyPoints: string[];
  importantIdeas: string[];
  rememberPoints: string[];
}

export interface Mistake {
  mistake: string;
  correction: string;
  debuggingTip: string;
}

export interface AdvancedSection {
  optimizationTechniques: string[];
  edgeCases: string[];
  industryPractices: string[];
  securityConsiderations?: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'documentation' | 'tutorial' | 'video' | 'tool';
}

@Injectable()
export class ContentGeneratorEnhancedService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateFullContent(topic: string, moduleTitle?: string): Promise<StructuredContent> {
    const prompt = this.buildContentPrompt(topic, moduleTitle);

    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
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
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Failed to generate content');
      }

      return JSON.parse(content) as StructuredContent;
    } catch (error) {
      console.error('Content generation error:', error?.response?.data || error?.message || error);
      throw new Error(error?.response?.data?.error?.message || 'Failed to generate content with AI');
    }
  }

  private buildContentPrompt(topic: string, moduleTitle?: string): string {
    return `You are an expert course creator building a COMPLETE lesson module.

Topic: ${topic}
${moduleTitle ? `Module Title: ${moduleTitle}` : ''}

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

  async generateIntroduction(topic: string): Promise<IntroductionSection> {
    const content = await this.generateFullContent(topic);
    return content.introduction;
  }

  async generateQuiz(topic: string): Promise<QuizSection> {
    const content = await this.generateFullContent(topic);
    return content.quiz;
  }

  async generateAssignment(topic: string): Promise<AssignmentSection> {
    const content = await this.generateFullContent(topic);
    return content.assignment;
  }

  convertToNarrativeText(content: StructuredContent): string {
    const parts: string[] = [];

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
}
