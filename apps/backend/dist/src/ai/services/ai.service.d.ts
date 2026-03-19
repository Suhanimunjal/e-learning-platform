import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AiService {
    private prisma;
    private aiQueue;
    private readonly logger;
    constructor(prisma: PrismaService, aiQueue: Queue);
    generateCourseOutline(topic: string, userId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        retryCount: number;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    generateLessons(courseId: string, userId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        retryCount: number;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    getJobStatus(jobId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        retryCount: number;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    generateQuiz(moduleId: string, userId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        retryCount: number;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    generateFlashcards(moduleId: string, userId: string): Promise<{
        error: string | null;
        id: string;
        version: string;
        updatedAt: Date;
        createdAt: Date;
        type: string;
        retryCount: number;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    generateAssignment(topic: string, tone: string): Promise<{
        success: boolean;
        data: {
            title: string;
            content: string;
            tone: string;
            topic: string;
        };
    }>;
    generateExamples(topic: string, tone: string): Promise<{
        success: boolean;
        data: {
            title: string;
            content: string;
            tone: string;
            topic: string;
        };
    }>;
    summarizeContent(content: string, tone: string): Promise<{
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
    getGradingFeedback(submissionId: string): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            feedback: string;
            suggestions: string[];
        };
    }>;
    overrideGrade(submissionId: string, score: number, feedback?: string): Promise<{
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
    trackProgress(studentId: string, topic: string, score: number): Promise<{
        success: boolean;
        data: {
            studentId: string;
            topic: string;
            score: number;
            trackedAt: string;
        };
    }>;
    translateText(text: string, targetLang: string, sourceLang?: string): Promise<{
        success: boolean;
        data: {
            original: string;
            translated: string;
            sourceLang: string;
            targetLang: string;
        };
    }>;
    detectLanguage(text: string): Promise<{
        success: boolean;
        data: {
            language: string;
            confidence: number;
            code: string;
        };
    }>;
    search(query: string, filters?: any): Promise<{
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
    getSearchSuggestions(query: string): Promise<{
        success: boolean;
        data: string[];
    }>;
    chat(message: string, sessionId?: string, courseId?: string): Promise<{
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
    createChatSession(courseId?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            courseId: string;
            createdAt: string;
        };
    }>;
}
