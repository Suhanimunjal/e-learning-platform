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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../prisma/prisma.service");
const content_generator_enhanced_service_1 = require("../content-generator-enhanced.service");
const anthropic_service_1 = require("./anthropic.service");
const tts_service_1 = require("../tts.service");
let AiService = AiService_1 = class AiService {
    constructor(prisma, aiQueue, contentGenerator, anthropicService, ttsService) {
        this.prisma = prisma;
        this.aiQueue = aiQueue;
        this.contentGenerator = contentGenerator;
        this.anthropicService = anthropicService;
        this.ttsService = ttsService;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async generateCourseOutline(topic, userId) {
        const job = await this.prisma.aIGenerationJob.create({
            data: {
                type: 'course',
                status: 'pending',
                input: { topic },
                version: 'claude-3-5-sonnet',
                tenantId: userId,
            },
        });
        await this.aiQueue.add('generate-outline', { topic, jobId: job.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        return job;
    }
    async generateLessons(courseId, userId) {
        const job = await this.prisma.aIGenerationJob.create({
            data: {
                type: 'lesson',
                status: 'pending',
                input: { courseId },
                version: 'claude-3-5-sonnet',
                tenantId: userId,
            },
        });
        await this.aiQueue.add('generate-lessons', { courseId, jobId: job.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        return job;
    }
    async getJobStatus(jobId) {
        return this.prisma.aIGenerationJob.findUnique({ where: { id: jobId } });
    }
    async generateQuiz(moduleId, userId) {
        const job = await this.prisma.aIGenerationJob.create({
            data: {
                type: 'quiz',
                status: 'pending',
                input: { moduleId },
                version: 'claude-3-5-sonnet',
                tenantId: userId,
            },
        });
        await this.aiQueue.add('generate-quiz', { moduleId, jobId: job.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        return job;
    }
    async generateFlashcards(moduleId, userId) {
        const job = await this.prisma.aIGenerationJob.create({
            data: {
                type: 'flashcards',
                status: 'pending',
                input: { moduleId },
                version: 'claude-3-5-sonnet',
                tenantId: userId,
            },
        });
        await this.aiQueue.add('generate-flashcards', { moduleId, jobId: job.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        return job;
    }
    async generateAssignment(topic, tone) {
        const content = await this.contentGenerator.generateFullContent(topic);
        return {
            success: true,
            data: {
                title: content.title,
                content: content.assignment.problemStatement,
                instructions: content.assignment.instructions,
                rubric: content.assignment.rubric,
                expectedOutput: content.assignment.expectedOutput,
                tone,
                topic,
            },
        };
    }
    async generateExamples(topic, tone) {
        const content = await this.contentGenerator.generateFullContent(topic);
        return {
            success: true,
            data: {
                title: `Code Examples: ${topic}`,
                examples: content.examples,
                tone,
                topic,
            },
        };
    }
    async summarizeContent(contentText, tone) {
        const summaryPrompt = `Summarize the following content in a ${tone} tone. Provide a clear and concise summary with key points.

Content to summarize:
${contentText}

Return JSON with this structure:
{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point1", "point2", "point3"],
  "mainTakeaway": "one sentence conclusion"
}`;
        try {
            const response = await this.anthropicService.generateStructuredResponse(summaryPrompt);
            return {
                success: true,
                data: {
                    summary: response.summary || contentText.substring(0, 500),
                    keyPoints: response.keyPoints || [],
                    mainTakeaway: response.mainTakeaway || '',
                    tone,
                    originalLength: contentText.length,
                },
            };
        }
        catch (error) {
            this.logger.error('Summarize content failed:', error);
            throw new common_1.BadRequestException('Failed to summarize content');
        }
    }
    async gradeSubmission(submissionId) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assignment: true },
        });
        if (!submission) {
            throw new common_1.BadRequestException('Submission not found');
        }
        const studentAnswer = submission.textContent || '';
        const assignmentTitle = submission.assignment?.title || 'Assignment';
        const maxPoints = submission.assignment?.maxPoints || 100;
        const gradingPrompt = `Grade this student submission for: ${assignmentTitle}

Student's Answer:
${studentAnswer}

Assignment Maximum Points: ${maxPoints}

Provide a detailed grading response in JSON format:
{
  "aiScore": number (0-${maxPoints}),
  "aiConfidence": number (0-100),
  "feedback": "detailed feedback on the answer",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "detailedComments": "line by line or section by section analysis"
}`;
        try {
            const gradingResult = await this.anthropicService.generateStructuredResponse(gradingPrompt);
            await this.prisma.submission.update({
                where: { id: submissionId },
                data: {
                    grade: gradingResult.aiScore,
                    feedback: gradingResult.feedback,
                    gradedAt: new Date(),
                },
            });
            return {
                success: true,
                data: {
                    submissionId,
                    aiScore: gradingResult.aiScore,
                    aiConfidence: gradingResult.aiConfidence,
                    feedback: gradingResult.feedback,
                    gradedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Grading failed:', error);
            throw new common_1.BadRequestException('Failed to grade submission');
        }
    }
    async getGradingFeedback(submissionId) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
        });
        if (!submission) {
            throw new common_1.BadRequestException('Submission not found');
        }
        if (!submission.feedback) {
            return {
                success: true,
                data: {
                    submissionId,
                    feedback: 'No feedback available yet. Please wait for grading to complete.',
                    suggestions: [],
                },
            };
        }
        return {
            success: true,
            data: {
                submissionId,
                feedback: submission.feedback,
                grade: submission.grade,
                suggestions: [
                    'Review the feedback above',
                    'Revise your answer based on the comments',
                    'Schedule office hours for additional help',
                ],
            },
        };
    }
    async overrideGrade(submissionId, score, feedback) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assignment: true },
        });
        if (!submission) {
            throw new common_1.BadRequestException('Submission not found');
        }
        const maxPoints = submission.assignment?.maxPoints || 100;
        if (score < 0 || score > maxPoints) {
            throw new common_1.BadRequestException(`Score must be between 0 and ${maxPoints}`);
        }
        const updated = await this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                grade: score,
                feedback: feedback || submission.feedback,
                gradedAt: new Date(),
            },
        });
        return {
            success: true,
            data: {
                submissionId,
                finalScore: updated.grade,
                teacherOverride: true,
                feedback: updated.feedback,
                overriddenAt: updated.gradedAt?.toISOString(),
            },
        };
    }
    async getRecommendations(studentId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId: studentId },
            include: {
                course: {
                    include: {
                        sections: {
                            include: {
                                modules: {
                                    include: {
                                        progresses: {
                                            where: { userId: studentId },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!enrollments.length) {
            return {
                success: true,
                data: [],
            };
        }
        const completedModuleIds = new Set();
        const moduleScores = [];
        for (const enrollment of enrollments) {
            for (const section of enrollment.course.sections || []) {
                for (const mod of section.modules || []) {
                    const progress = mod.progresses[0];
                    if (progress?.completed) {
                        completedModuleIds.add(mod.id);
                    }
                    if (progress?.courseProgress !== undefined) {
                        moduleScores.push({ moduleId: mod.id, score: progress.courseProgress });
                    }
                }
            }
        }
        const avgScore = moduleScores.length > 0
            ? moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length
            : 0;
        const recommendedCourses = await this.prisma.course.findMany({
            where: {
                published: true,
                id: { notIn: enrollments.map(e => e.courseId) },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
        const recommendations = recommendedCourses.map(course => {
            let matchScore = 50;
            let reason = 'New course available';
            if (avgScore >= 70) {
                matchScore = 85;
                reason = 'Great progress overall - explore new topics';
            }
            else if (avgScore >= 50) {
                matchScore = 75;
                reason = 'Building on your current knowledge level';
            }
            else {
                matchScore = 65;
                reason = 'Strengthen your foundations with this course';
            }
            return {
                courseId: course.id,
                title: course.title,
                reason,
                matchScore,
            };
        });
        return {
            success: true,
            data: recommendations,
        };
    }
    async trackProgress(studentId, topic, score) {
        if (score < 0 || score > 100) {
            throw new common_1.BadRequestException('Score must be between 0 and 100');
        }
        const modules = await this.prisma.module.findMany({
            where: {
                OR: [
                    { title: { contains: topic } },
                    { textContent: { contains: topic } },
                ],
            },
            take: 1,
        });
        if (modules.length > 0) {
            const existingProgress = await this.prisma.progress.findFirst({
                where: {
                    userId: studentId,
                    moduleId: modules[0].id,
                },
            });
            if (existingProgress) {
                await this.prisma.progress.update({
                    where: { id: existingProgress.id },
                    data: {
                        courseProgress: score,
                        completed: score >= 70,
                        lastAccessed: new Date(),
                    },
                });
            }
            else {
                await this.prisma.progress.create({
                    data: {
                        userId: studentId,
                        moduleId: modules[0].id,
                        courseProgress: score,
                        completed: score >= 70,
                    },
                });
            }
        }
        return {
            success: true,
            data: {
                studentId,
                topic,
                score,
                trackedAt: new Date().toISOString(),
            },
        };
    }
    async translateText(text, targetLang, sourceLang) {
        if (!text || text.trim().length === 0) {
            throw new common_1.BadRequestException('Text is required for translation');
        }
        const prompt = `Translate the following text${sourceLang ? ` from ${sourceLang}` : ''} to ${targetLang}.

Text to translate:
${text}

Return JSON:
{
  "original": "original text",
  "translated": "translated text",
  "sourceLang": "${sourceLang || 'auto-detected'}",
  "targetLang": "${targetLang}"
}`;
        try {
            const result = await this.anthropicService.generateStructuredResponse(prompt);
            return {
                success: true,
                data: {
                    original: text,
                    translated: result.translated || text,
                    sourceLang: result.sourceLang || sourceLang || 'unknown',
                    targetLang,
                },
            };
        }
        catch (error) {
            this.logger.error('Translation failed:', error);
            throw new common_1.BadRequestException('Failed to translate text');
        }
    }
    async detectLanguage(text) {
        if (!text || text.trim().length === 0) {
            throw new common_1.BadRequestException('Text is required for language detection');
        }
        const prompt = `Detect the language of the following text. Return only the language name and confidence score.

Text: ${text.substring(0, 500)}

Return JSON:
{
  "language": "language name",
  "confidence": 0.95,
  "code": "ISO 639-1 code"
}`;
        try {
            const result = await this.anthropicService.generateStructuredResponse(prompt);
            return {
                success: true,
                data: {
                    language: result.language || 'Unknown',
                    confidence: result.confidence || 0.5,
                    code: result.code || 'unknown',
                },
            };
        }
        catch (error) {
            this.logger.error('Language detection failed:', error);
            throw new common_1.BadRequestException('Failed to detect language');
        }
    }
    async search(query, filters) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const courses = await this.prisma.course.findMany({
            where: {
                published: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                sections: {
                    include: {
                        modules: {
                            where: {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { textContent: { contains: query, mode: 'insensitive' } },
                                ],
                            },
                        },
                    },
                },
            },
            take: 20,
        });
        const results = [];
        for (const course of courses) {
            results.push({
                id: course.id,
                type: 'course',
                title: course.title,
                snippet: course.description.substring(0, 200),
                relevanceScore: 90,
            });
            for (const section of course.sections) {
                for (const mod of section.modules) {
                    results.push({
                        id: mod.id,
                        type: mod.type.toLowerCase(),
                        title: mod.title,
                        snippet: mod.textContent?.substring(0, 200) || '',
                        relevanceScore: 85,
                    });
                }
            }
        }
        return {
            success: true,
            data: results,
            query,
            filters: filters || {},
        };
    }
    async getSearchSuggestions(query) {
        if (!query || query.trim().length < 2) {
            return { success: true, data: [] };
        }
        const courses = await this.prisma.course.findMany({
            where: {
                published: true,
                title: { contains: query, mode: 'insensitive' },
            },
            select: { title: true },
            take: 5,
        });
        const suggestions = courses.map(c => c.title);
        if (suggestions.length < 5) {
            suggestions.push(`${query} tutorial`);
            suggestions.push(`${query} examples`);
            suggestions.push(`learn ${query}`);
            suggestions.push(`${query} for beginners`);
        }
        return { success: true, data: suggestions.slice(0, 5) };
    }
    async chat(message, sessionId, courseId) {
        if (!message || message.trim().length === 0) {
            throw new common_1.BadRequestException('Message is required');
        }
        let context = '';
        if (courseId) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    sections: {
                        include: {
                            modules: {
                                take: 5,
                                orderBy: { order: 'asc' },
                            },
                        },
                    },
                },
            });
            if (course) {
                context = `The user is asking about the course "${course.title}". `;
                context += `Course description: ${course.description}. `;
                context += `Available modules: ${course.sections.flatMap(s => s.modules).map(m => m.title).join(', ')}.`;
            }
        }
        const prompt = `${context}

User question: ${message}

Provide a helpful response as a course assistant. If the question is about course content, provide accurate information. If you don't know, say so.

Return JSON:
{
  "response": "your helpful response",
  "suggestions": ["related question 1", "related question 2"]
}`;
        try {
            const result = await this.anthropicService.generateStructuredResponse(prompt);
            return {
                success: true,
                data: {
                    message,
                    response: result.response || 'I can help you with your learning questions.',
                    sessionId: sessionId || `session-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Chat failed:', error);
            throw new common_1.BadRequestException('Failed to generate response');
        }
    }
    async getChatHistory(sessionId) {
        return {
            success: true,
            data: [],
            sessionId,
        };
    }
    async createChatSession(courseId) {
        return {
            success: true,
            data: {
                id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                courseId,
                createdAt: new Date().toISOString(),
            },
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('ai-jobs')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, content_generator_enhanced_service_1.ContentGeneratorEnhancedService,
        anthropic_service_1.AnthropicService,
        tts_service_1.TTSService])
], AiService);
//# sourceMappingURL=ai.service.js.map