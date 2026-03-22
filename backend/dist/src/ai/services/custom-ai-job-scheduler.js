"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomAiJobScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAiJobScheduler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const content_generator_enhanced_service_1 = require("../content-generator-enhanced.service");
const ollama_service_1 = require("./ollama.service");
let CustomAiJobScheduler = CustomAiJobScheduler_1 = class CustomAiJobScheduler {
    constructor(prisma, contentGenerator, ollamaService) {
        this.prisma = prisma;
        this.contentGenerator = contentGenerator;
        this.ollamaService = ollamaService;
        this.logger = new common_1.Logger(CustomAiJobScheduler_1.name);
        this.jobs = new Map();
        this.processing = false;
        this.logger.log('Custom AI Job Scheduler initialized (Redis-free mode)');
    }
    async addJob(type, data) {
        const job = {
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
        setImmediate(() => this.processNextJob());
        return job;
    }
    async processNextJob() {
        if (this.processing)
            return;
        const pendingJob = Array.from(this.jobs.values()).find(j => j.status === 'pending');
        if (!pendingJob)
            return;
        this.processing = true;
        pendingJob.status = 'processing';
        pendingJob.updatedAt = new Date();
        try {
            await this.processJob(pendingJob);
            pendingJob.status = 'completed';
            pendingJob.updatedAt = new Date();
            this.logger.log(`AI job completed: ${pendingJob.type} (${pendingJob.id})`);
        }
        catch (error) {
            this.logger.error(`AI job failed: ${pendingJob.type} (${pendingJob.id})`, error);
            pendingJob.attempts++;
            if (pendingJob.attempts < 3) {
                pendingJob.status = 'pending';
                setTimeout(() => this.processNextJob(), Math.pow(2, pendingJob.attempts) * 1000);
            }
            else {
                pendingJob.status = 'failed';
            }
        }
        this.processing = false;
        setImmediate(() => this.processNextJob());
    }
    async processJob(job) {
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
                        output: content,
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
                        output: content,
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
                        output: { quiz: quizSection },
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
                        output: { flashcards },
                    },
                });
                break;
            }
            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    }
    async getJobStatus(jobId) {
        return this.jobs.get(jobId) || null;
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down AI job scheduler');
    }
};
exports.CustomAiJobScheduler = CustomAiJobScheduler;
exports.CustomAiJobScheduler = CustomAiJobScheduler = CustomAiJobScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        content_generator_enhanced_service_1.ContentGeneratorEnhancedService,
        ollama_service_1.OllamaService])
], CustomAiJobScheduler);
//# sourceMappingURL=custom-ai-job-scheduler.js.map