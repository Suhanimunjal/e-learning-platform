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
exports.AdminCourseGenerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const content_generator_enhanced_service_1 = require("../../ai/content-generator-enhanced.service");
const activity_log_service_1 = require("../../common/services/activity-log.service");
let AdminCourseGenerationService = class AdminCourseGenerationService {
    constructor(prisma, contentGenerator, activityLogService) {
        this.prisma = prisma;
        this.contentGenerator = contentGenerator;
        this.activityLogService = activityLogService;
    }
    async startGeneration(input, adminUserId) {
        const courseName = input.courseName?.trim();
        const difficulty = input.difficulty?.trim();
        if (!courseName) {
            throw new common_1.BadRequestException('courseName is required');
        }
        if (!difficulty) {
            throw new common_1.BadRequestException('difficulty is required');
        }
        if (!Number.isInteger(input.moduleCount) || input.moduleCount < 10) {
            throw new common_1.BadRequestException('moduleCount must be an integer greater than or equal to 10');
        }
        const job = await this.prisma.aIGenerationJob.create({
            data: {
                type: 'course-generation',
                status: 'pending',
                input: {
                    courseName,
                    difficulty,
                    moduleCount: input.moduleCount,
                },
                output: {
                    progress: {
                        totalModules: input.moduleCount,
                        generatedModules: 0,
                        percent: 0,
                    },
                },
                version: 'gemini-2.0-flash',
                tenantId: adminUserId,
            },
        });
        void this.executeGeneration(job.id, courseName, difficulty, input.moduleCount, adminUserId);
        return {
            jobId: job.id,
            status: job.status,
        };
    }
    async getJob(jobId) {
        const job = await this.prisma.aIGenerationJob.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new common_1.BadRequestException('Generation job not found');
        }
        return job;
    }
    async executeGeneration(jobId, courseName, difficulty, moduleCount, adminUserId) {
        let courseId;
        try {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: { status: 'running' },
            });
            const outline = await this.contentGenerator.generateCourseOutline(courseName, difficulty, moduleCount);
            const modules = this.normalizeModules(outline, moduleCount);
            if (modules.length < moduleCount) {
                throw new Error(`Generated outline has ${modules.length} modules, but ${moduleCount} are required.`);
            }
            const slug = await this.generateUniqueCourseSlug(courseName);
            const course = await this.prisma.course.create({
                data: {
                    title: courseName,
                    slug,
                    description: `AI-generated ${difficulty} level course for ${courseName}`,
                    instructorId: adminUserId,
                    status: 'PENDING_APPROVAL',
                },
            });
            courseId = course.id;
            await this.activityLogService.log({
                action: 'COURSE_CREATED',
                entityType: 'COURSE',
                entityId: course.id,
                userId: adminUserId,
                targetUserId: adminUserId,
                metadata: {
                    title: course.title,
                    generatedBy: 'AI',
                    difficulty,
                    moduleCount,
                    jobId,
                },
            });
            let generatedModules = 0;
            for (let idx = 0; idx < moduleCount; idx += 1) {
                const modulePlan = modules[idx];
                const section = await this.prisma.section.create({
                    data: {
                        courseId: course.id,
                        title: `Module ${idx + 1}: ${modulePlan.title}`,
                        order: idx,
                    },
                });
                const module = await this.prisma.module.create({
                    data: {
                        sectionId: section.id,
                        title: modulePlan.title,
                        type: 'LESSON',
                        order: 0,
                        topic: modulePlan.lessons.join(', '),
                        contentStatus: 'GENERATING',
                    },
                });
                const generatedContent = await this.contentGenerator.generateFullContent(`${courseName}: ${modulePlan.title}. Lessons: ${modulePlan.lessons.join(', ')}`, modulePlan.title, difficulty);
                await this.prisma.module.update({
                    where: { id: module.id },
                    data: {
                        generatedContent: generatedContent,
                        contentStatus: 'GENERATED',
                        contentGeneratedAt: new Date(),
                    },
                });
                generatedModules += 1;
                const percent = Math.round((generatedModules / moduleCount) * 100);
                await this.prisma.aIGenerationJob.update({
                    where: { id: jobId },
                    data: {
                        output: {
                            courseId: course.id,
                            progress: {
                                totalModules: moduleCount,
                                generatedModules,
                                percent,
                            },
                        },
                    },
                });
            }
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    output: {
                        courseId,
                        progress: {
                            totalModules: moduleCount,
                            generatedModules: moduleCount,
                            percent: 100,
                        },
                        completedAt: new Date().toISOString(),
                    },
                },
            });
        }
        catch (error) {
            await this.prisma.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Course generation failed',
                    output: {
                        courseId,
                        failedAt: new Date().toISOString(),
                    },
                },
            });
        }
    }
    normalizeModules(rawOutline, moduleCount) {
        const modulesCandidate = rawOutline?.modules || rawOutline?.course?.modules || [];
        if (!Array.isArray(modulesCandidate)) {
            return [];
        }
        const normalized = modulesCandidate
            .map((module, index) => {
            const title = String(module?.title || module?.module_title || module?.name || `Module ${index + 1}`).trim();
            const lessonsRaw = module?.lessons || module?.topics || [];
            const lessons = Array.isArray(lessonsRaw)
                ? lessonsRaw
                    .map((lesson, lessonIndex) => String(lesson?.title || lesson?.lesson_title || lesson || `Lesson ${lessonIndex + 1}`).trim())
                    .filter(Boolean)
                : [];
            return {
                title,
                description: module?.description ? String(module.description) : undefined,
                lessons,
            };
        })
            .filter((module) => module.title.length > 0);
        return normalized.slice(0, moduleCount);
    }
    async generateUniqueCourseSlug(courseName) {
        const base = this.toSlug(courseName) || 'ai-course';
        let slug = base;
        let suffix = 1;
        while (await this.prisma.course.findUnique({ where: { slug } })) {
            slug = `${base}-${suffix}`;
            suffix += 1;
        }
        return slug;
    }
    toSlug(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
};
exports.AdminCourseGenerationService = AdminCourseGenerationService;
exports.AdminCourseGenerationService = AdminCourseGenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        content_generator_enhanced_service_1.ContentGeneratorEnhancedService,
        activity_log_service_1.ActivityLogService])
], AdminCourseGenerationService);
//# sourceMappingURL=admin-course-generation.service.js.map