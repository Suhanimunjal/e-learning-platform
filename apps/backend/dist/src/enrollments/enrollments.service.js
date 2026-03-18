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
let EnrollmentsService = class EnrollmentsService {
    constructor(prisma, analyticsTracking) {
        this.prisma = prisma;
        this.analyticsTracking = analyticsTracking;
    }
    async enroll(courseId, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId: user.id,
                courseId: courseId,
            },
        });
        if (existingEnrollment) {
            throw new common_1.ConflictException('You are already enrolled in this course');
        }
        const enrollment = await this.prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courseId,
            },
        });
        this.analyticsTracking.trackEvent(user.id, analytics_tracking_service_1.AnalyticsEventType.COURSE_ENROLLED, {
            courseId: courseId,
        }).catch(err => console.error('Analytics tracking error:', err));
        return enrollment;
    }
    async getMyCourses(user) {
        return this.prisma.enrollment.findMany({
            where: { userId: user.id },
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
            where: { courseId },
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
        analytics_tracking_service_1.AnalyticsTrackingService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map