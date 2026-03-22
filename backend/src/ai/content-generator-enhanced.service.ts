import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from './services/ollama.service';

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
  private readonly logger = new Logger(ContentGeneratorEnhancedService.name);

  constructor(private ollamaService: OllamaService) {}

  async generateFullContent(
    topic: string,
    moduleTitle?: string,
    difficulty: string = 'intermediate',
  ): Promise<StructuredContent> {
    const prompt = this.buildContentPrompt(topic, moduleTitle, difficulty);

    try {
      const response = await this.ollamaService.generateStructuredResponse(prompt);
      
      const content = response.rawText || JSON.stringify(response);
      
      let parsed: StructuredContent;
      try {
        if (typeof response === 'object' && response !== null) {
          parsed = response as StructuredContent;
        } else {
          parsed = JSON.parse(content);
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI response as JSON, returning structured fallback');
        return this.getFallbackContent(topic);
      }

      const requiredFields = ['topic', 'title', 'quiz', 'assignment'];
      const missingFields = requiredFields.filter(field => !(field in parsed));
      if (missingFields.length > 0) {
        this.logger.warn(`Missing fields: ${missingFields.join(', ')}, using fallback`);
        return this.getFallbackContent(topic);
      }

      return parsed;
    } catch (error) {
      this.logger.error('Content generation error:', error);
      return this.getFallbackContent(topic);
    }
  }

  async generateCourseOutline(courseName: string, difficulty: string, moduleCount: number): Promise<any> {
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
      const response = await this.ollamaService.generateStructuredResponse(prompt);
      
      if (response.modules && Array.isArray(response.modules)) {
        return response;
      }
      
      const content = typeof response === 'string' ? response : JSON.stringify(response);
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed?.modules)) {
        throw new Error('Generated outline is missing modules array');
      }
      return parsed;
    } catch (error) {
      this.logger.error('Course outline generation error:', error);
      return {
        courseTitle: courseName,
        difficulty,
        modules: this.getFallbackModules(moduleCount),
      };
    }
  }

  private buildContentPrompt(topic: string, moduleTitle?: string, difficulty: string = 'intermediate'): string {
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

  private getFallbackContent(topic: string): StructuredContent {
    return {
      topic,
      title: `Introduction to ${topic}`,
      introduction: {
        whatIsIt: `This module covers the fundamental concepts of ${topic}.`,
        whyImportant: `Understanding ${topic} is essential for building practical skills.`,
        realWorldUse: `${topic} is used extensively in industry applications.`,
        learningObjectives: [`Understand ${topic} fundamentals`, 'Apply concepts practically', 'Build working examples'],
        prerequisites: ['Basic knowledge'],
        estimatedTime: '30-45 minutes',
      },
      theory: {
        definitions: [{ term: topic, explanation: 'Core concept definition' }],
        background: 'Background information',
        terminology: [{ term: 'Key Term', meaning: 'Definition' }],
        misconceptions: ['Common misconception'],
      },
      concepts: [{ title: 'Core Concept', explanation: 'Detailed explanation', analogy: 'Like a real-world analogy', realLifeMapping: 'Practical application' }],
      examples: [{ level: 'beginner', title: 'Example 1', description: 'Description', explanation: 'How it works', code: '// code example', output: 'output' }],
      practice: {
        guidedExercise: { title: 'Guided Practice', instructions: ['Step 1', 'Step 2'], hints: ['Hint 1'] },
        independentTasks: [{ title: 'Task 1', instructions: ['Instructions'] }],
        challenge: { title: 'Challenge', instructions: ['Challenge steps'] },
        miniProject: { title: 'Mini Project', description: 'Build something', requirements: ['Req 1'], evaluationCriteria: ['Criteria 1'] },
      },
      quiz: {
        questions: [{ question: 'Sample question?', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: 'Explanation', difficulty: 'easy' }],
      },
      assignment: {
        problemStatement: 'Assignment problem',
        instructions: ['Step 1', 'Step 2'],
        expectedOutput: 'Expected output',
        rubric: [{ criterion: 'Completion', points: 10, description: 'All steps completed' }],
      },
      summary: {
        keyPoints: [`Learned about ${topic}`],
        importantIdeas: ['Key takeaway'],
        rememberPoints: ['Remember this'],
      },
      mistakes: [{ mistake: 'Common mistake', correction: 'Correct approach', debuggingTip: 'How to debug' }],
      advanced: {
        optimizationTechniques: ['Optimization tip'],
        edgeCases: ['Edge case handling'],
        industryPractices: ['Industry standard'],
      },
      resources: [{ title: 'Resource', url: 'https://example.com', type: 'documentation' }],
      nextPreview: 'Next topic preview',
    };
  }

  private getFallbackModules(count: number): any[] {
    const modules = [];
    for (let i = 1; i <= count; i++) {
      modules.push({
        title: `Module ${i}`,
        description: `Module ${i} description`,
        lessons: [`Lesson ${i}.1`, `Lesson ${i}.2`, `Lesson ${i}.3`],
      });
    }
    return modules;
  }
}