export declare const AI_CONFIG: {
    anthropic: {
        apiKey: string;
        model: string;
    };
    prompts: {
        courseOutline: (topic: string) => string;
        lessonContent: (moduleTitle: string, lessonTitle: string, description: string) => string;
        quiz: (lessonContent: string, lessonTitle: string) => string;
        flashcards: (lessonContent: string, lessonTitle: string) => string;
    };
};
