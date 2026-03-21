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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_tracking_service_1 = require("../analytics/services/analytics-tracking.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
let EnrollmentsService = class EnrollmentsService {
    constructor(prisma, analyticsTracking, activityLogService) {
        this.prisma = prisma;
        this.analyticsTracking = analyticsTracking;
        this.activityLogService = activityLogService;
    }
    async enroll(courseId, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.status !== 'APPROVED') {
            throw new common_1.ForbiddenException('This course is not available for enrollment yet');
        }
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId: user.id,
                courseId: courseId,
            },
        });
        if (existingEnrollment) {
            if (existingEnrollment.accessStatus === 'APPROVED') {
                throw new common_1.ConflictException('You are already enrolled in this course');
            }
            if (existingEnrollment.accessStatus === 'PENDING') {
                throw new common_1.ConflictException('Your enrollment request is pending approval');
            }
        }
        const enrollment = await this.prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courseId,
                accessStatus: 'PENDING',
            },
        });
        await this.activityLogService.log({
            action: 'ENROLLMENT_REQUESTED',
            entityType: 'ENROLLMENT',
            entityId: enrollment.id,
            userId: user.id,
            targetUserId: course.instructorId,
            metadata: { courseTitle: course.title },
        });
        return {
            ...enrollment,
            message: 'Enrollment request submitted. Waiting for teacher approval.',
        };
    }
    async getMyCourses(user) {
        return this.prisma.enrollment.findMany({
            where: {
                userId: user.id,
                accessStatus: 'APPROVED',
            },
            include: {
                course: {
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
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPendingEnrollments(userId) {
        const courses = await this.prisma.course.findMany({
            where: { instructorId: userId },
            select: { id: true },
        });
        const courseIds = courses.map(c => c.id);
        return this.prisma.enrollment.findMany({
            where: {
                courseId: { in: courseIds },
                accessStatus: 'PENDING',
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveEnrollment(enrollmentId, teacherId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { course: true },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.course.instructorId !== teacherId) {
            throw new common_1.ForbiddenException('You can only approve enrollments for your own courses');
        }
        const updated = await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { accessStatus: 'APPROVED' },
        });
        await this.activityLogService.log({
            action: 'ENROLLMENT_APPROVED',
            entityType: 'ENROLLMENT',
            entityId: enrollment.id,
            userId: teacherId,
            targetUserId: enrollment.userId,
            metadata: { courseTitle: enrollment.course.title },
        });
        return updated;
    }
    async rejectEnrollment(enrollmentId, teacherId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { course: true },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.course.instructorId !== teacherId) {
            throw new common_1.ForbiddenException('You can only reject enrollments for your own courses');
        }
        const updated = await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { accessStatus: 'REJECTED' },
        });
        await this.activityLogService.log({
            action: 'ENROLLMENT_REJECTED',
            entityType: 'ENROLLMENT',
            entityId: enrollment.id,
            userId: teacherId,
            targetUserId: enrollment.userId,
            metadata: { courseTitle: enrollment.course.title },
        });
        return updated;
    }
    async getCourseStudents(courseId, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === 'STUDENT') {
            throw new common_1.ForbiddenException('Students cannot view course students');
        }
        if (user.role === 'TEACHER' && course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only view students for your own courses');
        }
        return this.prisma.enrollment.findMany({
            where: {
                courseId,
                accessStatus: 'APPROVED',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_tracking_service_1.AnalyticsTrackingService,
        activity_log_service_1.ActivityLogService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map