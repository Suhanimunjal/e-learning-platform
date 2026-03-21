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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const otp_service_1 = require("../common/services/otp.service");
const email_service_1 = require("../common/services/email.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
const generate_ai_course_dto_1 = require("./dto/generate-ai-course.dto");
const admin_course_generation_service_1 = require("./services/admin-course-generation.service");
let AdminController = class AdminController {
    constructor(prisma, otpService, emailService, activityLogService, adminCourseGenerationService) {
        this.prisma = prisma;
        this.otpService = otpService;
        this.emailService = emailService;
        this.activityLogService = activityLogService;
        this.adminCourseGenerationService = adminCourseGenerationService;
    }
    async generateAiCourse(body, req) {
        return this.adminCourseGenerationService.startGeneration(body, req.user.id);
    }
    async getGenerationJob(jobId) {
        return this.adminCourseGenerationService.getJob(jobId);
    }
    async getActivityLogs(limit, offset) {
        return this.activityLogService.getRecentLogs(Number(limit) || 50, Number(offset) || 0);
    }
    async registerTeacher(body, req) {
        const { name, email, password } = body;
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, message: 'User with this email already exists' };
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = await this.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: client_1.Role.TEACHER,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        await this.activityLogService.log({
            action: 'TEACHER_CREATED',
            entityType: 'USER',
            entityId: teacher.id,
            userId: req.user.id,
            targetUserId: teacher.id,
            metadata: { email: teacher.email, name: teacher.name },
        });
        return {
            success: true,
            message: 'Teacher account created successfully',
            teacher: { id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role },
        };
    }
    async getPendingUsers() {
        return this.prisma.user.findMany({
            where: {
                status: client_1.UserStatus.PENDING_APPROVAL,
                role: client_1.Role.TEACHER,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                organization: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveUser(userId, req) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { status: client_1.UserStatus.ACTIVE },
            select: { id: true, email: true, name: true, status: true },
        });
        await this.emailService.sendTeacherApproved(user.email, user.name);
        await this.activityLogService.log({
            action: 'USER_APPROVED',
            entityType: 'USER',
            entityId: user.id,
            userId: req.user.id,
            targetUserId: user.id,
            metadata: { email: user.email, name: user.name },
        });
        return { success: true, user };
    }
    async rejectUser(userId, body, req) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { status: client_1.UserStatus.REJECTED, rejectionReason: body.reason },
            select: { id: true, email: true, name: true, status: true, rejectionReason: true },
        });
        await this.emailService.sendTeacherRejected(user.email, user.name, body.reason);
        await this.activityLogService.log({
            action: 'USER_REJECTED',
            entityType: 'USER',
            entityId: user.id,
            userId: req.user.id,
            targetUserId: user.id,
            metadata: { email: user.email, name: user.name, reason: body.reason },
        });
        return { success: true, user };
    }
    async getPendingCourses() {
        return this.prisma.course.findMany({
            where: { status: 'PENDING_APPROVAL' },
            include: {
                instructor: { select: { id: true, name: true, email: true } },
                _count: { select: { sections: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveCourse(courseId, req) {
        const course = await this.prisma.course.update({
            where: { id: courseId },
            data: { status: 'APPROVED', approvedBy: req.user.id },
            select: { id: true, title: true, status: true, instructorId: true },
        });
        await this.activityLogService.log({
            action: 'COURSE_APPROVED',
            entityType: 'COURSE',
            entityId: course.id,
            userId: req.user.id,
            targetUserId: course.instructorId,
            metadata: { title: course.title },
        });
        return { success: true, course };
    }
    async rejectCourse(courseId, body, req) {
        const course = await this.prisma.course.update({
            where: { id: courseId },
            data: { status: 'REJECTED', rejectionReason: body.reason },
            select: { id: true, title: true, status: true, rejectionReason: true, instructorId: true },
        });
        await this.activityLogService.log({
            action: 'COURSE_REJECTED',
            entityType: 'COURSE',
            entityId: course.id,
            userId: req.user.id,
            targetUserId: course.instructorId,
            metadata: { title: course.title, reason: body.reason },
        });
        return { success: true, course };
    }
    async getPendingEnrollments() {
        return this.prisma.enrollment.findMany({
            where: { accessStatus: 'PENDING' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true, instructorId: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveEnrollment(enrollmentId, req) {
        const enrollment = await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { accessStatus: 'APPROVED' },
        });
        const user = await this.prisma.user.findUnique({ where: { id: enrollment.userId } });
        const course = await this.prisma.course.findUnique({ where: { id: enrollment.courseId } });
        if (user && course) {
            await this.emailService.sendEnrollmentApproved(user.email, user.name, course.title);
        }
        await this.activityLogService.log({
            action: 'ENROLLMENT_APPROVED',
            entityType: 'ENROLLMENT',
            entityId: enrollment.id,
            userId: req.user.id,
            targetUserId: enrollment.userId,
            metadata: { courseTitle: course?.title },
        });
        return { success: true, enrollment };
    }
    async rejectEnrollment(enrollmentId, req) {
        const enrollment = await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { accessStatus: 'REJECTED' },
        });
        await this.activityLogService.log({
            action: 'ENROLLMENT_REJECTED',
            entityType: 'ENROLLMENT',
            entityId: enrollment.id,
            userId: req.user.id,
            targetUserId: enrollment.userId,
            metadata: {},
        });
        return { success: true, enrollment };
    }
    async getTeachers() {
        return this.prisma.user.findMany({
            where: { role: client_1.Role.TEACHER },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStats() {
        const [pendingApprovals, totalUsers, totalTeachers, totalStudents, totalCourses] = await Promise.all([
            this.prisma.user.count({ where: { status: client_1.UserStatus.PENDING_APPROVAL, role: client_1.Role.TEACHER } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: client_1.Role.TEACHER } }),
            this.prisma.user.count({ where: { role: client_1.Role.STUDENT } }),
            this.prisma.course.count(),
        ]);
        return {
            pendingApprovals,
            totalUsers,
            totalTeachers,
            totalStudents,
            totalCourses,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('courses/generate-ai'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_ai_course_dto_1.GenerateAiCourseDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateAiCourse", null);
__decorate([
    (0, common_1.Get)('courses/generation-jobs/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGenerationJob", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActivityLogs", null);
__decorate([
    (0, common_1.Post)('teachers/register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "registerTeacher", null);
__decorate([
    (0, common_1.Get)('users/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingUsers", null);
__decorate([
    (0, common_1.Post)('users/:userId/approve'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveUser", null);
__decorate([
    (0, common_1.Post)('users/:userId/reject'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectUser", null);
__decorate([
    (0, common_1.Get)('courses/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingCourses", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/approve'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveCourse", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/reject'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectCourse", null);
__decorate([
    (0, common_1.Get)('enrollments/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingEnrollments", null);
__decorate([
    (0, common_1.Post)('enrollments/:enrollmentId/approve'),
    __param(0, (0, common_1.Param)('enrollmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveEnrollment", null);
__decorate([
    (0, common_1.Post)('enrollments/:enrollmentId/reject'),
    __param(0, (0, common_1.Param)('enrollmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectEnrollment", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        otp_service_1.OtpService,
        email_service_1.EmailService,
        activity_log_service_1.ActivityLogService,
        admin_course_generation_service_1.AdminCourseGenerationService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map