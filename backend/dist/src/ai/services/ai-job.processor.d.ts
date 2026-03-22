import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { OllamaService } from './ollama.service';
export declare class AiJobProcessor {
    private prisma;
    private ollamaService;
    private readonly logger;
    constructor(prisma: PrismaService, ollamaService: OllamaService);
    generateOutline(job: Job<{
        topic: string;
        jobId: string;
    }>): Promise<any>;
    generateLessons(job: Job<{
        courseId: string;
        jobId: string;
    }>): Promise<{
        success: boolean;
    }>;
    generateQuiz(job: Job<{
        moduleId: string;
        jobId: string;
    }>): Promise<{
        success: boolean;
        moduleId: string;
    }>;
    generateFlashcards(job: Job<{
        moduleId: string;
        jobId: string;
    }>): Promise<{
        success: boolean;
        moduleId: string;
    }>;
}
