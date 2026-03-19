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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const analytics_tracking_service_1 = require("../analytics/services/analytics-tracking.service");
const tts_service_1 = require("../ai/tts.service");
const content_generator_enhanced_service_1 = require("../ai/content-generator-enhanced.service");
const quiz_verification_service_1 = require("../ai/quiz-verification.service");
let ModulesService = class ModulesService {
    constructor(prisma, analyticsTracking, ttsService, contentGenerator, quizVerifier) {
        this.prisma = prisma;
        this.analyticsTracking = analyticsTracking;
        this.ttsService = ttsService;
        this.contentGenerator = contentGenerator;
        this.quizVerifier = quizVerifier;
    }
    async create(createModuleDto, user) {
        const section = await this.prisma.section.findUnique({
            where: { id: createModuleDto.sectionId },
            include: { course: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot create modules');
        }
        if (user.role === client_1.Role.TEACHER && section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only create modules for your own courses');
        }
        return this.prisma.module.create({
            data: createModuleDto,
        });
    }
    async findAll(sectionId, user) {
        const section = await this.prisma.section.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: section.courseId,
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You are not enrolled in this course');
            }
        }
        return this.prisma.module.findMany({
            where: { sectionId },
            orderBy: { order: 'asc' },
        });
    }
    async findOne(id, user) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: module.section.courseId,
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You are not enrolled in this course');
            }
        }
        if (user.role === client_1.Role.STUDENT) {
            this.analyticsTracking.trackEvent(user.id, analytics_tracking_service_1.AnalyticsEventType.MODULE_VIEWED, {
                courseId: module.section.courseId,
                moduleId: module.id,
            }).catch(err => console.error('Analytics tracking error:', err));
        }
        return module;
    }
    async update(id, updateModuleDto, user) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot update modules');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only update modules for your own courses');
        }
        return this.prisma.module.update({
            where: { id },
            data: updateModuleDto,
        });
    }
    async remove(id, user) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot delete modules');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete modules for your own courses');
        }
        return this.prisma.module.delete({ where: { id } });
    }
    async generateContent(moduleId, topic, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        await this.prisma.module.update({
            where: { id: moduleId },
            data: {
                topic,
                contentStatus: client_1.ContentStatus.GENERATING,
            },
        });
        try {
            const content = await this.contentGenerator.generateFullContent(topic, module.title);
            await this.prisma.module.update({
                where: { id: moduleId },
                data: {
                    generatedContent: content,
                    contentStatus: client_1.ContentStatus.GENERATED,
                    contentGeneratedAt: new Date(),
                },
            });
            return {
                status: 'GENERATED',
                content: content,
                audioUrl: null,
                videoUrl: null,
                quiz: content.quiz?.questions || [],
                assignment: content.assignment || null,
            };
        }
        catch (error) {
            console.error('Content generation error:', error);
            await this.prisma.module.update({
                where: { id: moduleId },
                data: {
                    contentStatus: client_1.ContentStatus.PENDING,
                },
            });
            const message = error?.message || 'Failed to generate content';
            throw new common_1.BadRequestException(message);
        }
    }
    async updateContent(moduleId, content, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        const existingContent = module.generatedContent || {};
        const updatedContent = { ...existingContent, ...content };
        return this.prisma.module.update({
            where: { id: moduleId },
            data: {
                generatedContent: updatedContent,
                contentStatus: client_1.ContentStatus.GENERATED,
            },
        });
    }
    async approveContent(moduleId, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        if (module.contentStatus !== client_1.ContentStatus.GENERATED) {
            throw new common_1.BadRequestException('Content must be generated before approval');
        }
        return this.prisma.module.update({
            where: { id: moduleId },
            data: {
                contentStatus: client_1.ContentStatus.APPROVED,
                videoStatus: client_1.VideoStatus.PENDING,
            },
        });
    }
    async getVideoStatus(moduleId, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        return {
            moduleId: module.id,
            topic: module.topic,
            content: module.generatedContent,
            contentStatus: module.contentStatus,
            videoStatus: module.videoStatus,
            audioUrl: module.audioUrl,
            videoUrl: module.videoUrl,
            transcript: module.transcript,
            retryCount: module.retryCount,
            canRetry: module.retryCount < 2,
            canGenerateVideo: module.contentStatus === client_1.ContentStatus.APPROVED,
            hasVideo: module.hasVideo,
        };
    }
    async generateVideo(moduleId, voiceId, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        if (module.contentStatus !== client_1.ContentStatus.APPROVED) {
            throw new common_1.BadRequestException('Content must be approved before video generation');
        }
        if (module.retryCount >= 2) {
            throw new common_1.BadRequestException('Maximum retry limit reached. Please regenerate content.');
        }
        const selectedVoice = voiceId
            ? this.ttsService.getVoiceById(voiceId)
            : this.ttsService.getAvailableVoices()[0];
        if (!selectedVoice) {
            throw new common_1.BadRequestException('Invalid voice selected');
        }
        await this.prisma.module.update({
            where: { id: moduleId },
            data: {
                videoStatus: client_1.VideoStatus.GENERATING,
                voiceId: selectedVoice.id,
            },
        });
        try {
            const content = module.generatedContent;
            const narrativeText = this.contentGenerator.convertToNarrativeText(content);
            const audioResult = await this.ttsService.generateAudio(narrativeText, {
                languageCode: selectedVoice.languageCode,
                name: selectedVoice.name,
                ssmlGender: selectedVoice.gender,
            });
            await this.prisma.module.update({
                where: { id: moduleId },
                data: {
                    audioUrl: audioResult.audioUrl,
                    transcript: audioResult.transcript,
                    videoUrl: audioResult.audioUrl,
                    videoStatus: client_1.VideoStatus.APPROVED,
                    videoGeneratedAt: new Date(),
                    hasVideo: true,
                },
            });
            return {
                status: 'COMPLETED',
                content: content,
                audioUrl: audioResult.audioUrl,
                videoUrl: audioResult.audioUrl,
                duration: audioResult.duration,
                transcript: audioResult.transcript,
                quiz: content.quiz?.questions || [],
                assignment: content.assignment || null,
            };
        }
        catch (error) {
            await this.prisma.module.update({
                where: { id: moduleId },
                data: {
                    videoStatus: client_1.VideoStatus.FAILED,
                },
            });
            throw error;
        }
    }
    async getVideoPreview(moduleId, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (!module.audioUrl) {
            throw new common_1.BadRequestException('Video not yet generated');
        }
        return {
            audioUrl: module.audioUrl,
            transcript: module.transcript,
        };
    }
    async approveVideo(moduleId, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: {
                            include: {
                                sections: {
                                    include: {
                                        modules: {
                                            orderBy: { order: 'asc' },
                                        },
                                    },
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        if (module.videoStatus !== client_1.VideoStatus.APPROVED) {
            throw new common_1.BadRequestException('Video must be generated before approval');
        }
        const allModules = module.section.course.sections.flatMap(s => s.modules);
        const currentIndex = allModules.findIndex(m => m.id === moduleId);
        const nextModule = allModules[currentIndex + 1];
        if (nextModule && nextModule.contentStatus === client_1.ContentStatus.PENDING) {
            await this.prisma.module.update({
                where: { id: nextModule.id },
                data: {
                    contentStatus: client_1.ContentStatus.PENDING,
                },
            });
        }
        return {
            status: 'APPROVED',
            moduleComplete: true,
            nextModuleUnlocked: !!nextModule,
            nextModuleId: nextModule?.id,
        };
    }
    async rejectVideo(moduleId, reason, user) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage your own course modules');
        }
        if (module.retryCount >= 2) {
            throw new common_1.BadRequestException('Maximum retry limit reached');
        }
        const newRetryCount = module.retryCount + 1;
        return this.prisma.module.update({
            where: { id: moduleId },
            data: {
                videoStatus: client_1.VideoStatus.PENDING,
                retryCount: newRetryCount,
                rejectionReason: reason,
                audioUrl: null,
                transcript: null,
            },
        });
    }
    getAvailableVoices() {
        return this.ttsService.getAvailableVoices();
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_tracking_service_1.AnalyticsTrackingService,
        tts_service_1.TTSService,
        content_generator_enhanced_service_1.ContentGeneratorEnhancedService,
        quiz_verification_service_1.QuizVerificationService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map