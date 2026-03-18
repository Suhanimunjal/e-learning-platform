export declare class AnthropicService {
    private readonly logger;
    private anthropic;
    private isConfigured;
    constructor();
    private ensureConfigured;
    generateCourseOutline(topic: string): Promise<any>;
    generateLessonContent(moduleTitle: string, lessonTitle: string, description: string): Promise<any>;
    generateQuiz(lessonContent: string, lessonTitle: string): Promise<any>;
    generateFlashcards(lessonContent: string, lessonTitle: string): Promise<any>;
    private parseJSONResponse;
}
