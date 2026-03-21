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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("../common/services/activity-log.service");
let CoursesService = class CoursesService {
    constructor(prisma, activityLogService) {
        this.prisma = prisma;
        this.activityLogService = activityLogService;
    }
    async create(createCourseDto, user) {
        const data = {
            ...createCourseDto,
            instructorId: user.id,
        };
        if (user.role === client_1.Role.TEACHER || user.role === client_1.Role.MANAGER) {
            data.organizationId = user.organizationId;
        }
        const course = await this.prisma.course.create({
            data,
        });
        await this.activityLogService.log({
            action: 'COURSE_CREATED',
            entityType: 'COURSE',
            entityId: course.id,
            userId: user.id,
            targetUserId: user.id,
            metadata: { title: course.title },
        });
        return course;
    }
    async findAll(user) {
        const where = {};
        if (user) {
            if (user.role === client_1.Role.ADMIN) {
            }
            else if (user.role === client_1.Role.MANAGER) {
                where.organizationId = user.organizationId;
                where.status = 'APPROVED';
            }
            else if (user.role === client_1.Role.TEACHER) {
                where.instructorId = user.id;
            }
            else if (user.role === client_1.Role.STUDENT) {
                where.status = 'APPROVED';
                where.organizationId = user.organizationId;
            }
        }
        else {
            where.status = 'APPROVED';
        }
        return this.prisma.course.findMany({
            where,
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                sections: {
                    include: {
                        modules: true,
                    },
                },
            },
        });
    }
    async findOne(id, user) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                sections: {
                    include: {
                        modules: true,
                    },
                },
                enrollments: user ? {
                    where: { userId: user.id },
                } : false,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.status !== 'APPROVED') {
            if (!user) {
                throw new common_1.ForbiddenException('Please login to view this course');
            }
            const isInstructor = user && course.instructorId === user.id;
            const isAdmin = user && user.role === client_1.Role.ADMIN;
            if (user.role === client_1.Role.STUDENT && !isInstructor && !isAdmin) {
                throw new common_1.ForbiddenException('You do not have access to this course');
            }
        }
        const isEnrolled = user && course.enrollments && course.enrollments.length > 0;
        const isInstructor = user && course.instructorId === user.id;
        const isAdmin = user && user.role === client_1.Role.ADMIN;
        if (user && !isEnrolled && !isInstructor && !isAdmin && user.role === client_1.Role.STUDENT) {
            await this.activityLogService.log({
                action: 'COURSE_ACCESSED',
                entityType: 'COURSE',
                entityId: course.id,
                userId: user.id,
                targetUserId: course.instructorId,
                metadata: { title: course.title, previewOnly: true },
            });
            return {
                ...course,
                isEnrolled: false,
                previewOnly: true,
                message: 'Please enroll to access full course content',
            };
        }
        if (user) {
            await this.activityLogService.log({
                action: 'COURSE_ACCESSED',
                entityType: 'COURSE',
                entityId: course.id,
                userId: user.id,
                targetUserId: course.instructorId,
                metadata: { title: course.title, previewOnly: false },
            });
        }
        return {
            ...course,
            isEnrolled,
            isInstructor,
            isAdmin,
        };
    }
    async update(id, updateCourseDto, user) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot update courses');
        }
        if (user.role === client_1.Role.TEACHER && course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own courses');
        }
        return this.prisma.course.update({
            where: { id },
            data: updateCourseDto,
        });
    }
    async remove(id, user) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot delete courses');
        }
        if (user.role === client_1.Role.TEACHER && course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete your own courses');
        }
        return this.prisma.course.delete({ where: { id } });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map