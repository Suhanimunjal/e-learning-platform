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
var AiJobProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiJobProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const anthropic_service_1 = require("./anthropic.service");
let AiJobProcessor = AiJobProcessor_1 = class AiJobProcessor {
    constructor(prisma, anthropicService) {
        this.prisma = prisma;
        this.anthropicService = anthropicService;
        this.logger = new common_1.Logger(AiJobProcessor_1.name);
    }
    async generateOutline(job) {
        const { topic, jobId } = job.data;
        try {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });
            const outline = await this.anthropicService.generateCourseOutline(topic);
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    output: outline,
                },
            });
            return outline;
        }
        catch (error) {
            this.logger.error('Error in generate-outline job:', error);
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error.message,
                },
            });
            throw error;
        }
    }
    async generateLessons(job) {
        const { courseId, jobId } = job.data;
        try {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    sections: {
                        include: {
                            modules: true,
                        },
                    },
                },
            });
            if (!course) {
                throw new Error('Course not found');
            }
            for (const section of course.sections) {
                for (const module of section.modules) {
                    if (module.type === 'LESSON' && !module.textContent) {
                        const content = await this.anthropicService.generateLessonContent(section.title, module.title, module.title);
                        await this.prisma.module.update({
                            where: { id: module.id },
                            data: {
                                textContent: content.content,
                                duration: content.duration,
                            },
                        });
                    }
                }
            }
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    output: { message: 'Lessons generated successfully' },
                },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error('Error in generate-lessons job:', error);
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error.message,
                },
            });
            throw error;
        }
    }
    async generateQuiz(job) {
        const { moduleId, jobId } = job.data;
        try {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });
            const lessonModule = await this.prisma.module.findUnique({
                where: { id: moduleId },
                include: {
                    section: true,
                },
            });
            if (!lessonModule || lessonModule.type !== 'LESSON') {
                throw new Error('Lesson module not found');
            }
            if (!lessonModule.textContent) {
                throw new Error('Lesson content not generated yet');
            }
            const quizData = await this.anthropicService.generateQuiz(lessonModule.textContent, lessonModule.title);
            const quizModule = await this.prisma.module.create({
                data: {
                    title: `Quiz: ${lessonModule.title}`,
                    sectionId: lessonModule.sectionId,
                    type: 'QUIZ',
                    order: lessonModule.order + 1,
                },
            });
            const quiz = await this.prisma.quiz.create({
                data: {
                    moduleId: quizModule.id,
                    title: quizData.title,
                    description: quizData.description,
                    maxAttempts: 1,
                    passingScore: 50,
                },
            });
            for (const q of quizData.questions) {
                await this.prisma.question.create({
                    data: {
                        quizId: quiz.id,
                        type: q.type,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        points: 1,
                    },
                });
            }
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    output: { message: 'Quiz generated successfully', moduleId: quizModule.id },
                },
            });
            return { success: true, moduleId: quizModule.id };
        }
        catch (error) {
            this.logger.error('Error in generate-quiz job:', error);
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error.message,
                },
            });
            throw error;
        }
    }
    async generateFlashcards(job) {
        const { moduleId, jobId } = job.data;
        try {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });
            const lessonModule = await this.prisma.module.findUnique({
                where: { id: moduleId },
                include: {
                    section: true,
                },
            });
            if (!lessonModule || lessonModule.type !== 'LESSON') {
                throw new Error('Lesson module not found');
            }
            if (!lessonModule.textContent) {
                throw new Error('Lesson content not generated yet');
            }
            const flashcardsData = await this.anthropicService.generateFlashcards(lessonModule.textContent, lessonModule.title);
            const flashcardModule = await this.prisma.module.create({
                data: {
                    title: `Flashcards: ${lessonModule.title}`,
                    sectionId: lessonModule.sectionId,
                    type: 'LESSON',
                    order: lessonModule.order + 1,
                    content: flashcardsData,
                },
            });
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    output: { message: 'Flashcards generated successfully', moduleId: flashcardModule.id },
                },
            });
            return { success: true, moduleId: flashcardModule.id };
        }
        catch (error) {
            this.logger.error('Error in generate-flashcards job:', error);
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error.message,
                },
            });
            throw error;
        }
    }
};
exports.AiJobProcessor = AiJobProcessor;
__decorate([
    (0, bull_1.Process)('generate-outline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiJobProcessor.prototype, "generateOutline", null);
__decorate([
    (0, bull_1.Process)('generate-lessons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiJobProcessor.prototype, "generateLessons", null);
__decorate([
    (0, bull_1.Process)('generate-quiz'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiJobProcessor.prototype, "generateQuiz", null);
__decorate([
    (0, bull_1.Process)('generate-flashcards'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiJobProcessor.prototype, "generateFlashcards", null);
exports.AiJobProcessor = AiJobProcessor = AiJobProcessor_1 = __decorate([
    (0, bull_1.Processor)('ai-jobs'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        anthropic_service_1.AnthropicService])
], AiJobProcessor);
//# sourceMappingURL=ai-job.processor.js.map