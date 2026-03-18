import { AiService } from './services/ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generateOutline(req: any, body: {
        topic: string;
    }): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        tenantId: string | null;
    }>;
    generateLessons(req: any, courseId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        tenantId: string | null;
    }>;
    getJobStatus(jobId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        tenantId: string | null;
    }>;
    generateQuiz(req: any, moduleId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        tenantId: string | null;
    }>;
    generateFlashcards(req: any, moduleId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        tenantId: string | null;
    }>;
    generateAssignment(body: {
        topic: string;
        tone?: string;
    }): Promise<{
        success: boolean;
        data: {
            title: string;
            content: string;
            tone: string;
            topic: string;
        };
    }>;
    generateExamples(body: {
        topic: string;
        tone?: string;
    }): Promise<{
        success: boolean;
        data: {
            title: string;
            content: string;
            tone: string;
            topic: string;
        };
    }>;
    summarizeContent(body: {
        content: string;
        tone?: string;
    }): Promise<{
        success: boolean;
        data: {
            title: string;
            content: string;
            tone: string;
            originalLength: number;
        };
    }>;
    gradeSubmission(submissionId: string): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            aiScore: number;
            aiConfidence: number;
            feedback: string;
            gradedAt: string;
        };
    }>;
    getFeedback(submissionId: string): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            feedback: string;
            suggestions: string[];
        };
    }>;
    overrideGrade(submissionId: string, body: {
        score: number;
        feedback?: string;
    }): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            finalScore: number;
            teacherOverride: boolean;
            feedback: string;
            overriddenAt: string;
        };
    }>;
    getRecommendations(studentId: string): Promise<{
        success: boolean;
        data: {
            courseId: string;
            title: string;
            reason: string;
            matchScore: number;
        }[];
    }>;
    trackProgress(body: {
        studentId: string;
        topic: string;
        score: number;
    }): Promise<{
        success: boolean;
        data: {
            studentId: string;
            topic: string;
            score: number;
            trackedAt: string;
        };
    }>;
    translate(body: {
        text: string;
        targetLang: string;
        sourceLang?: string;
    }): Promise<{
        success: boolean;
        data: {
            original: string;
            translated: string;
            sourceLang: string;
            targetLang: string;
        };
    }>;
    detectLanguage(body: {
        text: string;
    }): Promise<{
        success: boolean;
        data: {
            language: string;
            confidence: number;
            code: string;
        };
    }>;
    search(query: string, filters: any): Promise<{
        success: boolean;
        data: {
            id: string;
            type: string;
            title: string;
            snippet: string;
            relevanceScore: number;
        }[];
        query: string;
        filters: any;
    }>;
    getSuggestions(query: string): Promise<{
        success: boolean;
        data: string[];
    }>;
    chat(body: {
        message: string;
        sessionId?: string;
        courseId?: string;
    }): Promise<{
        success: boolean;
        data: {
            message: string;
            response: string;
            sessionId: string;
            timestamp: string;
        };
    }>;
    getChatHistory(sessionId: string): Promise<{
        success: boolean;
        data: {
            role: string;
            content: string;
            timestamp: string;
        }[];
        sessionId: string;
    }>;
    createSession(body?: {
        courseId?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            courseId: string;
            createdAt: string;
        };
    }>;
}
