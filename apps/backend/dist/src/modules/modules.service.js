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
let ModulesService = class ModulesService {
    constructor(prisma, analyticsTracking) {
        this.prisma = prisma;
        this.analyticsTracking = analyticsTracking;
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
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_tracking_service_1.AnalyticsTrackingService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map