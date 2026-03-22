import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
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

@Injectable()
export class CustomAiJobScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(CustomAiJobScheduler.name);
  private jobs: Map<string, AIJob> = new Map();
  private processing = false;

  constructor(
    private prisma: PrismaService,
    private contentGenerator: ContentGeneratorEnhancedService,
    private ollamaService: OllamaService,
  ) {
    this.logger.log('Custom AI Job Scheduler initialized (Redis-free mode)');
  }

  async addJob(type: AIJob['type'], data: any): Promise<AIJob> {
    const job: AIJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      data,
      attempts: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    this.logger.log(`AI job added: ${type} (${job.id})`);

    // Process asynchronously
    setImmediate(() => this.processNextJob());

    return job;
  }

  private async processNextJob(): Promise<void> {
    if (this.processing) return;
    
    const pendingJob = Array.from(this.jobs.values()).find(j => j.status === 'pending');
    if (!pendingJob) return;

    this.processing = true;
    pendingJob.status = 'processing';
    pendingJob.updatedAt = new Date();

    try {
      await this.processJob(pendingJob);
      pendingJob.status = 'completed';
      pendingJob.updatedAt = new Date();
      this.logger.log(`AI job completed: ${pendingJob.type} (${pendingJob.id})`);
    } catch (error) {
      this.logger.error(`AI job failed: ${pendingJob.type} (${pendingJob.id})`, error);
      pendingJob.attempts++;
      
      if (pendingJob.attempts < 3) {
        pendingJob.status = 'pending';
        // Retry with exponential backoff
        setTimeout(() => this.processNextJob(), Math.pow(2, pendingJob.attempts) * 1000);
      } else {
        pendingJob.status = 'failed';
      }
    }

    this.processing = false;
    
    // Process next job if any
    setImmediate(() => this.processNextJob());
  }

  private async processJob(job: AIJob): Promise<void> {
    const { type, data } = job;

    switch (type) {
      case 'generate-outline': {
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: { status: 'processing' },
        });

        const content = await this.contentGenerator.generateFullContent(data.topic);
        
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: {
            status: 'completed',
            output: content as any,
          },
        });
        break;
      }

      case 'generate-lessons': {
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: { status: 'processing' },
        });

        const content = await this.contentGenerator.generateFullContent(data.topic || 'Introduction');
        
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: {
            status: 'completed',
            output: content as any,
          },
        });
        break;
      }

      case 'generate-quiz': {
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: { status: 'processing' },
        });

        const quizSection = await this.contentGenerator.generateQuiz(data.topic || 'General Knowledge');
        
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: {
            status: 'completed',
            output: { quiz: quizSection } as any,
          },
        });
        break;
      }

      case 'generate-flashcards': {
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: { status: 'processing' },
        });

        const flashcards = await this.ollamaService.generateResponse('Generate flashcards about: ' + (data.topic || 'General'));
        
        await this.prisma.aIGenerationJob.update({
          where: { id: data.jobId },
          data: {
            status: 'completed',
            output: { flashcards } as any,
          },
        });
        break;
      }

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  async getJobStatus(jobId: string): Promise<AIJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down AI job scheduler');
  }
}
