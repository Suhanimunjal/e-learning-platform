import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentGeneratorEnhancedService } from '../content-generator-enhanced.service';
import { OllamaService } from './ollama.service';
export interface AIJob {
    id: string;
    type: 'generate-outline' | 'generate-lessons' | 'generate-quiz' | 'generate-flashcards';
    data: any;
    attempts: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
export declare class CustomAiJobScheduler implements OnModuleDestroy {
    private prisma;
    private contentGenerator;
    private ollamaService;
    private readonly logger;
    private jobs;
    private processing;
    constructor(prisma: PrismaService, contentGenerator: ContentGeneratorEnhancedService, ollamaService: OllamaService);
    addJob(type: AIJob['type'], data: any): Promise<AIJob>;
    private processNextJob;
    private processJob;
    getJobStatus(jobId: string): Promise<AIJob | null>;
    onModuleDestroy(): Promise<void>;
}
