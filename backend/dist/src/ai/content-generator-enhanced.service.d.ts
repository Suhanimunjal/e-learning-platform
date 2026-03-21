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
export declare class ContentGeneratorEnhancedService {
    private readonly apiKey;
    private readonly baseUrl;
    constructor();
    generateFullContent(topic: string, moduleTitle?: string, difficulty?: string): Promise<StructuredContent>;
    generateCourseOutline(courseName: string, difficulty: string, moduleCount: number): Promise<any>;
    private buildContentPrompt;
    generateIntroduction(topic: string): Promise<IntroductionSection>;
    generateQuiz(topic: string): Promise<QuizSection>;
    generateAssignment(topic: string): Promise<AssignmentSection>;
    convertToNarrativeText(content: StructuredContent): string;
}
