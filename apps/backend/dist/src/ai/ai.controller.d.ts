import { AiService } from './services/ai.service';
import { GenerateAssignmentDto, GenerateExamplesDto, SummarizeContentDto, TranslateTextDto, DetectLanguageDto, ChatDto } from './dto/ai-content.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generateOutline(req: any, body: {
        topic: string;
    }): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
    }>;
    generateLessons(req: any, courseId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
    }>;
    getJobStatus(jobId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
    }>;
    generateQuiz(req: any, moduleId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
    }>;
    generateFlashcards(req: any, moduleId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
    }>;
    generateAssignment(dto: GenerateAssignmentDto): Promise<any>;
    generateExamples(dto: GenerateExamplesDto): Promise<any>;
    summarizeContent(dto: SummarizeContentDto): Promise<any>;
    gradeSubmission(submissionId: string): Promise<any>;
    getFeedback(submissionId: string): Promise<any>;
    overrideGrade(submissionId: string, body: {
        score: number;
        feedback?: string;
    }): Promise<any>;
    getRecommendations(studentId: string): Promise<any>;
    trackProgress(body: {
        studentId: string;
        topic: string;
        score: number;
    }): Promise<any>;
    translate(dto: TranslateTextDto): Promise<any>;
    detectLanguage(dto: DetectLanguageDto): Promise<any>;
    search(query: string, filters: any): Promise<any>;
    getSuggestions(query: string): Promise<any>;
    chat(dto: ChatDto): Promise<any>;
    getChatHistory(sessionId: string): Promise<any>;
    createSession(body?: {
        courseId?: string;
    }): Promise<any>;
}
