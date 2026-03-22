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
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    constructor(prisma, otpService, emailService, activityLogService, adminCourseGenerationService) {
        this.prisma = prisma;
        this.otpService = otpService;
        this.emailService = emailService;
        this.activityLogService = activityLogService;
        this.adminCourseGenerationService = adminCourseGenerationService;
    }
    async notify(userId, type, title, message) {
        await this.prisma.notification.create({ data: { userId, type, title, message } });
    }
    async generateAiCourse(body, req) {
        return this.adminCourseGenerationService.startGeneration(body, req.user.id);
    }
    async getGenerationJob(jobId) {
        return this.adminCourseGenerationService.getJob(jobId);
    }
    async getActivityLogs(limit, offset, action, entityType, startDate, endDate) {
        const filters = {};
        if (action)
            filters.action = action;
        if (entityType)
            filters.entityType = entityType;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.activityLogService.getFilteredLogs(Number(limit) || 50, Number(offset) || 0, filters);
    }
    async getNewLogs(since, limit) {
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 10000);
        return this.activityLogService.getNewLogsSince(sinceDate, Number(limit) || 100);
    }
    async getLogTypes() {
        return this.activityLogService.getLogTypes();
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
                status: client_1.UserStatus.PENDING_APPROVAL,
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
            message: 'Teacher account created successfully. Awaiting approval.',
            teacher: { id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role, status: teacher.status },
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
                phone: true,
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
        await this.notify(user.id, 'account', 'Account Approved', 'Your account has been approved. You can now access all features.');
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
        await this.notify(user.id, 'account', 'Account Rejected', body.reason || 'Your account application has been rejected by the administrator.');
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
        await this.notify(course.instructorId, 'course', 'Course Approved', `Your course "${course.title}" has been approved and is now visible to students.`);
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
        await this.notify(course.instructorId, 'course', 'Course Rejected', `Your course "${course.title}" has been rejected. ${body.reason || ''}`);
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
            await this.notify(user.id, 'enrollment', 'Enrollment Approved', `Your enrollment in "${course.title}" has been approved. You can now access the course.`);
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
                phone: true,
                role: true,
                status: true,
                rejectionReason: true,
                createdAt: true,
                updatedAt: true,
                organization: { select: { id: true, name: true } },
                _count: { select: { coursesCreated: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTeacherById(teacherId) {
        const teacher = await this.prisma.user.findFirst({
            where: {
                id: teacherId,
                role: client_1.Role.TEACHER,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                rejectionReason: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                    },
                },
                coursesCreated: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        price: true,
                        createdAt: true,
                        _count: { select: { sections: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        return teacher;
    }
    async getStudents(status) {
        const whereClause = { role: client_1.Role.STUDENT };
        if (status) {
            whereClause.status = status;
        }
        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                rollNo: true,
                year: true,
                branch: true,
                course: true,
                status: true,
                rejectionReason: true,
                createdAt: true,
                updatedAt: true,
                organization: { select: { id: true, name: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStudentById(studentId) {
        const student = await this.prisma.user.findFirst({
            where: {
                id: studentId,
                role: client_1.Role.STUDENT,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                rollNo: true,
                year: true,
                branch: true,
                course: true,
                role: true,
                status: true,
                rejectionReason: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                    },
                },
                enrollments: {
                    select: {
                        id: true,
                        accessStatus: true,
                        createdAt: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                price: true,
                                createdAt: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        return student;
    }
    async cleanupRejectedStudents(req) {
        const rejectedStudents = await this.prisma.user.findMany({
            where: {
                role: client_1.Role.STUDENT,
                status: client_1.UserStatus.REJECTED,
            },
            select: { id: true, email: true, name: true },
        });
        if (rejectedStudents.length === 0) {
            return { success: true, deleted: 0, message: 'No rejected students to clean up' };
        }
        const studentIds = rejectedStudents.map(s => s.id);
        await this.prisma.enrollment.deleteMany({
            where: { userId: { in: studentIds } },
        });
        await this.prisma.progress.deleteMany({
            where: { userId: { in: studentIds } },
        });
        await this.prisma.quizAttempt.deleteMany({
            where: { userId: { in: studentIds } },
        });
        await this.prisma.submission.deleteMany({
            where: { userId: { in: studentIds } },
        });
        await this.prisma.analyticsEvent.deleteMany({
            where: { userId: { in: studentIds } },
        });
        await this.prisma.notification.deleteMany({
            where: { userId: { in: studentIds } },
        });
        const result = await this.prisma.user.deleteMany({
            where: {
                role: client_1.Role.STUDENT,
                status: client_1.UserStatus.REJECTED,
            },
        });
        await this.activityLogService.log({
            action: 'REJECTED_STUDENTS_CLEANED',
            entityType: 'USER',
            userId: req.user.id,
            metadata: {
                deletedCount: result.count,
                deletedEmails: rejectedStudents.map(s => s.email),
            },
        });
        return {
            success: true,
            deleted: result.count,
            message: `Deleted ${result.count} rejected student application(s)`,
        };
    }
    async cleanupAllRejected(req) {
        const deleted = {};
        const rejectedStudents = await this.prisma.user.findMany({
            where: { role: client_1.Role.STUDENT, status: client_1.UserStatus.REJECTED },
            select: { id: true },
        });
        if (rejectedStudents.length > 0) {
            const ids = rejectedStudents.map(s => s.id);
            await this.prisma.enrollment.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.progress.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.quizAttempt.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.submission.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.analyticsEvent.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.notification.deleteMany({ where: { userId: { in: ids } } });
            const r = await this.prisma.user.deleteMany({ where: { role: client_1.Role.STUDENT, status: client_1.UserStatus.REJECTED } });
            deleted.students = r.count;
        }
        const rejectedTeachers = await this.prisma.user.findMany({
            where: { role: client_1.Role.TEACHER, status: client_1.UserStatus.REJECTED },
            select: { id: true },
        });
        if (rejectedTeachers.length > 0) {
            const ids = rejectedTeachers.map(t => t.id);
            await this.prisma.analyticsEvent.deleteMany({ where: { userId: { in: ids } } });
            await this.prisma.notification.deleteMany({ where: { userId: { in: ids } } });
            const r = await this.prisma.user.deleteMany({ where: { role: client_1.Role.TEACHER, status: client_1.UserStatus.REJECTED } });
            deleted.teachers = r.count;
        }
        const r = await this.prisma.course.deleteMany({ where: { status: client_1.CourseStatus.REJECTED } });
        deleted.courses = r.count;
        await this.activityLogService.log({
            action: 'ALL_REJECTED_CLEANED',
            entityType: 'SYSTEM',
            userId: req.user.id,
            metadata: deleted,
        });
        return { success: true, deleted, message: 'All rejected items cleaned up' };
    }
    async getStats() {
        const [pendingApprovals, totalUsers, totalTeachers, totalStudents, totalCourses, blacklistedUsers, blacklistedCourses] = await Promise.all([
            this.prisma.user.count({ where: { status: client_1.UserStatus.PENDING_APPROVAL, role: client_1.Role.TEACHER } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: client_1.Role.TEACHER } }),
            this.prisma.user.count({ where: { role: client_1.Role.STUDENT } }),
            this.prisma.course.count(),
            this.prisma.blacklistedUser.count(),
            this.prisma.course.count({ where: { status: client_1.CourseStatus.BLACKLISTED } }),
        ]);
        return {
            pendingApprovals,
            totalUsers,
            totalTeachers,
            totalStudents,
            totalCourses,
            blacklistedUsers,
            blacklistedCourses,
        };
    }
    async blacklistUser(userId, body, req) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, name: true, password: true, role: true, status: true,
                avatar: true, organizationId: true, rejectionReason: true,
                phone: true, rollNo: true, year: true, branch: true, course: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let blacklistedCourses = 0;
        if (user.role === client_1.Role.TEACHER) {
            const result = await this.prisma.course.updateMany({
                where: { instructorId: userId, status: { not: client_1.CourseStatus.BLACKLISTED } },
                data: { status: client_1.CourseStatus.BLACKLISTED, rejectionReason: `Instructor blacklisted: ${body.reason}` },
            });
            blacklistedCourses = result.count;
        }
        if (user.role === client_1.Role.TEACHER) {
            await this.prisma.course.updateMany({
                where: { instructorId: userId },
                data: { status: client_1.CourseStatus.BLACKLISTED, rejectionReason: `Instructor blacklisted: ${body.reason}` },
            });
        }
        await this.prisma.blacklistedUser.create({
            data: {
                originalUserId: user.id,
                email: user.email,
                name: user.name,
                password: user.password,
                role: user.role,
                avatar: user.avatar,
                organizationId: user.organizationId,
                rejectionReason: user.rejectionReason,
                phone: user.phone,
                rollNo: user.rollNo,
                year: user.year,
                branch: user.branch,
                course: user.course,
                reason: body.reason,
                blacklistedBy: req.user.id,
            },
        });
        await this.prisma.enrollment.deleteMany({ where: { userId } });
        await this.prisma.progress.deleteMany({ where: { userId } });
        await this.prisma.quizAttempt.deleteMany({ where: { userId } });
        await this.prisma.submission.deleteMany({ where: { userId } });
        await this.prisma.analyticsEvent.deleteMany({ where: { userId } });
        await this.prisma.notification.deleteMany({ where: { userId } });
        await this.prisma.review.deleteMany({ where: { userId } });
        await this.prisma.order.deleteMany({ where: { userId } });
        await this.prisma.discussion.deleteMany({ where: { userId } });
        await this.prisma.certificate.deleteMany({ where: { userId } });
        await this.prisma.reply.deleteMany({ where: { userId } });
        await this.prisma.user.delete({ where: { id: userId } });
        await this.activityLogService.log({
            action: 'USER_BLACKLISTED',
            entityType: 'USER',
            entityId: user.id,
            userId: req.user.id,
            targetUserId: user.id,
            metadata: { email: user.email, name: user.name, role: user.role, reason: body.reason, blacklistedCourses },
        });
        return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, blacklistedCourses };
    }
    async unblacklistUser(userId, req) {
        const blacklisted = await this.prisma.blacklistedUser.findFirst({
            where: { originalUserId: userId },
        });
        if (!blacklisted) {
            throw new common_1.NotFoundException('Blacklisted user not found');
        }
        const restoredUser = await this.prisma.user.create({
            data: {
                email: blacklisted.email,
                name: blacklisted.name,
                password: blacklisted.password,
                role: blacklisted.role,
                status: client_1.UserStatus.ACTIVE,
                avatar: blacklisted.avatar,
                organizationId: blacklisted.organizationId,
                phone: blacklisted.phone,
                rollNo: blacklisted.rollNo,
                year: blacklisted.year,
                branch: blacklisted.branch,
                course: blacklisted.course,
            },
        });
        let restoredCourses = 0;
        if (blacklisted.role === client_1.Role.TEACHER) {
            const result = await this.prisma.course.updateMany({
                where: { instructorId: userId, status: client_1.CourseStatus.BLACKLISTED },
                data: { status: client_1.CourseStatus.APPROVED, rejectionReason: null },
            });
            restoredCourses = result.count;
            await this.prisma.course.updateMany({
                where: { instructorId: userId },
                data: { instructorId: restoredUser.id },
            });
        }
        await this.prisma.blacklistedUser.delete({ where: { id: blacklisted.id } });
        await this.activityLogService.log({
            action: 'USER_UNBLACKLISTED',
            entityType: 'USER',
            entityId: restoredUser.id,
            userId: req.user.id,
            targetUserId: restoredUser.id,
            metadata: { email: restoredUser.email, name: restoredUser.name, restoredCourses },
        });
        return { success: true, user: { id: restoredUser.id, email: restoredUser.email, name: restoredUser.name, role: restoredUser.role }, restoredCourses };
    }
    async getBlacklistedUsers() {
        return this.prisma.blacklistedUser.findMany({
            select: {
                id: true,
                originalUserId: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                rollNo: true,
                year: true,
                branch: true,
                course: true,
                reason: true,
                blacklistedAt: true,
                organizationId: true,
            },
            orderBy: { blacklistedAt: 'desc' },
        });
    }
    async revertBlacklist(blacklistedId, req) {
        const blacklisted = await this.prisma.blacklistedUser.findUnique({
            where: { id: blacklistedId },
        });
        if (!blacklisted) {
            throw new common_1.NotFoundException('Blacklisted user not found');
        }
        const existing = await this.prisma.user.findUnique({ where: { email: blacklisted.email } });
        if (existing) {
            return { success: false, message: 'A user with this email already exists in the main table' };
        }
        const restoredUser = await this.prisma.user.create({
            data: {
                email: blacklisted.email,
                name: blacklisted.name,
                password: blacklisted.password,
                role: blacklisted.role,
                status: client_1.UserStatus.ACTIVE,
                avatar: blacklisted.avatar,
                organizationId: blacklisted.organizationId,
                phone: blacklisted.phone,
                rollNo: blacklisted.rollNo,
                year: blacklisted.year,
                branch: blacklisted.branch,
                course: blacklisted.course,
            },
        });
        let restoredCourses = 0;
        if (blacklisted.role === client_1.Role.TEACHER) {
            const result = await this.prisma.course.updateMany({
                where: {
                    instructorId: blacklisted.originalUserId,
                    status: client_1.CourseStatus.BLACKLISTED,
                },
                data: { status: client_1.CourseStatus.APPROVED, rejectionReason: null, instructorId: restoredUser.id },
            });
            restoredCourses = result.count;
        }
        await this.prisma.blacklistedUser.delete({ where: { id: blacklistedId } });
        await this.activityLogService.log({
            action: 'BLACKLIST_REVERTED',
            entityType: 'USER',
            entityId: restoredUser.id,
            userId: req.user.id,
            targetUserId: restoredUser.id,
            metadata: { email: restoredUser.email, name: restoredUser.name, restoredCourses },
        });
        return { success: true, user: { id: restoredUser.id, email: restoredUser.email, name: restoredUser.name, role: restoredUser.role }, restoredCourses };
    }
    async blacklistCourse(courseId, body, req) {
        const course = await this.prisma.course.update({
            where: { id: courseId },
            data: { status: client_1.CourseStatus.BLACKLISTED, rejectionReason: body.reason },
            select: { id: true, title: true, status: true, instructorId: true },
        });
        await this.notify(course.instructorId, 'course', 'Course Blacklisted', `Your course "${course.title}" has been hidden. ${body.reason || ''}`);
        await this.activityLogService.log({
            action: 'COURSE_BLACKLISTED',
            entityType: 'COURSE',
            entityId: course.id,
            userId: req.user.id,
            targetUserId: course.instructorId,
            metadata: { title: course.title, reason: body.reason },
        });
        return { success: true, course };
    }
    async unblacklistCourse(courseId, req) {
        const course = await this.prisma.course.update({
            where: { id: courseId },
            data: { status: 'APPROVED', rejectionReason: null },
            select: { id: true, title: true, status: true, instructorId: true },
        });
        await this.activityLogService.log({
            action: 'COURSE_UNBLACKLISTED',
            entityType: 'COURSE',
            entityId: course.id,
            userId: req.user.id,
            targetUserId: course.instructorId,
            metadata: { title: course.title },
        });
        return { success: true, course };
    }
    async deleteCourse(courseId, req) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, instructorId: true },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const sections = await this.prisma.section.findMany({ where: { courseId }, select: { id: true } });
        const sectionIds = sections.map(s => s.id);
        if (sectionIds.length > 0) {
            const modules = await this.prisma.module.findMany({ where: { sectionId: { in: sectionIds } }, select: { id: true } });
            const moduleIds = modules.map(m => m.id);
            if (moduleIds.length > 0) {
                await this.prisma.progress.deleteMany({ where: { moduleId: { in: moduleIds } } });
                await this.prisma.quizAttempt.deleteMany({ where: { quiz: { moduleId: { in: moduleIds } } } });
                await this.prisma.question.deleteMany({ where: { quiz: { moduleId: { in: moduleIds } } } });
                await this.prisma.quiz.deleteMany({ where: { moduleId: { in: moduleIds } } });
                await this.prisma.submission.deleteMany({ where: { assignment: { moduleId: { in: moduleIds } } } });
                await this.prisma.assignment.deleteMany({ where: { moduleId: { in: moduleIds } } });
            }
            await this.prisma.module.deleteMany({ where: { sectionId: { in: sectionIds } } });
        }
        await this.prisma.section.deleteMany({ where: { courseId } });
        await this.prisma.enrollment.deleteMany({ where: { courseId } });
        await this.prisma.review.deleteMany({ where: { courseId } });
        await this.prisma.order.deleteMany({ where: { courseId } });
        await this.prisma.discussion.deleteMany({ where: { courseId } });
        await this.prisma.certificate.deleteMany({ where: { courseId } });
        await this.prisma.course.delete({ where: { id: courseId } });
        await this.activityLogService.log({
            action: 'COURSE_DELETED',
            entityType: 'COURSE',
            entityId: courseId,
            userId: req.user.id,
            targetUserId: course.instructorId,
            metadata: { title: course.title },
        });
        return { success: true, message: `Course "${course.title}" deleted permanently` };
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
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('entityType')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActivityLogs", null);
__decorate([
    (0, common_1.Get)('logs/new'),
    __param(0, (0, common_1.Query)('since')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getNewLogs", null);
__decorate([
    (0, common_1.Get)('logs/types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLogTypes", null);
__decorate([
    (0, common_1.Post)('teachers/register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.RegisterTeacherBodyDto, Object]),
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
    __metadata("design:paramtypes", [String, admin_dto_1.RejectUserBodyDto, Object]),
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
    __metadata("design:paramtypes", [String, admin_dto_1.RejectCourseBodyDto, Object]),
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
    (0, common_1.Get)('teachers/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTeacherById", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('students/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStudentById", null);
__decorate([
    (0, common_1.Delete)('students/cleanup-rejected'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cleanupRejectedStudents", null);
__decorate([
    (0, common_1.Delete)('cleanup-all-rejected'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cleanupAllRejected", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('users/:userId/blacklist'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.BlacklistUserBodyDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "blacklistUser", null);
__decorate([
    (0, common_1.Post)('users/:userId/unblacklist'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unblacklistUser", null);
__decorate([
    (0, common_1.Get)('users/blacklisted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlacklistedUsers", null);
__decorate([
    (0, common_1.Post)('users/blacklisted/:blacklistedId/revert'),
    __param(0, (0, common_1.Param)('blacklistedId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "revertBlacklist", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/blacklist'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.BlacklistCourseBodyDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "blacklistCourse", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/unblacklist'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unblacklistCourse", null);
__decorate([
    (0, common_1.Delete)('courses/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCourse", null);
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