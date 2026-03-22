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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentService = class StudentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    summarizeCourseProgress(course) {
        const allModules = course.sections.flatMap((section) => section.modules);
        const totalModules = allModules.length;
        const completedModules = allModules.filter((module) => {
            const progress = module.progresses[0];
            return progress?.completed === true;
        }).length;
        const progressPercentage = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);
        const lastAccessedEntry = allModules
            .map((module) => {
            const progress = module.progresses[0];
            if (!progress) {
                return null;
            }
            return {
                moduleId: module.id,
                lastAccessed: progress.lastAccessed,
            };
        })
            .filter((entry) => entry !== null)
            .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())[0];
        return {
            totalModules,
            completedModules,
            progressPercentage,
            lastAccessedModuleId: lastAccessedEntry?.moduleId ?? null,
            lastAccessedAt: lastAccessedEntry?.lastAccessed ?? null,
        };
    }
    async getDashboard(userId) {
        const approvedEnrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
                accessStatus: 'APPROVED',
            },
            select: {
                course: {
                    select: {
                        id: true,
                        sections: {
                            select: {
                                modules: {
                                    select: {
                                        id: true,
                                        progresses: {
                                            where: { userId },
                                            select: {
                                                completed: true,
                                            },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const totalCourses = approvedEnrollments.length;
        const completedCourses = approvedEnrollments.filter((enrollment) => {
            const modules = enrollment.course.sections.flatMap((section) => section.modules);
            if (modules.length === 0) {
                return false;
            }
            const completedCount = modules.filter((module) => module.progresses[0]?.completed === true).length;
            return completedCount === modules.length;
        }).length;
        const inProgressCourses = totalCourses - completedCourses;
        const recentActivity = await this.prisma.analyticsEvent.findMany({
            where: { userId },
            select: {
                id: true,
                type: true,
                metadata: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return {
            totalCourses,
            completedCourses,
            inProgressCourses,
            recentActivity,
        };
    }
    async getEnrolledCourses(userId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
                accessStatus: 'APPROVED',
            },
            select: {
                id: true,
                createdAt: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        thumbnail: true,
                        status: true,
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        sections: {
                            select: {
                                id: true,
                                modules: {
                                    select: {
                                        id: true,
                                        title: true,
                                        progresses: {
                                            where: { userId },
                                            select: {
                                                id: true,
                                                completed: true,
                                                timeSpent: true,
                                                lastAccessed: true,
                                            },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return enrollments.map((enrollment) => {
            const summary = this.summarizeCourseProgress(enrollment.course);
            const moduleTitleById = new Map(enrollment.course.sections.flatMap((section) => section.modules.map((module) => [module.id, module.title])));
            const lastAccessedModuleTitle = summary.lastAccessedModuleId
                ? (moduleTitleById.get(summary.lastAccessedModuleId) ?? null)
                : null;
            return {
                id: enrollment.id,
                createdAt: enrollment.createdAt,
                course: {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    description: enrollment.course.description,
                    price: enrollment.course.price,
                    thumbnail: enrollment.course.thumbnail,
                    status: enrollment.course.status,
                    instructor: enrollment.course.instructor,
                },
                progress: {
                    totalModules: summary.totalModules,
                    completedModules: summary.completedModules,
                    percentage: summary.progressPercentage,
                    lastAccessedModuleId: summary.lastAccessedModuleId,
                    lastAccessedModuleTitle,
                    lastAccessedAt: summary.lastAccessedAt,
                },
            };
        });
    }
    async getCourseFull(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                accessStatus: 'APPROVED',
            },
            select: {
                id: true,
            },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('You are not enrolled in this course.');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                thumbnail: true,
                status: true,
                createdAt: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                sections: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        modules: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                order: true,
                                videoUrl: true,
                                textContent: true,
                                duration: true,
                                progresses: {
                                    where: { userId },
                                    select: {
                                        id: true,
                                        completed: true,
                                        timeSpent: true,
                                        lastAccessed: true,
                                    },
                                    take: 1,
                                },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const summary = this.summarizeCourseProgress(course);
        const sections = course.sections.map((section) => ({
            id: section.id,
            title: section.title,
            order: section.order,
            modules: section.modules.map((module) => ({
                id: module.id,
                title: module.title,
                type: module.type,
                order: module.order,
                videoUrl: module.videoUrl,
                content: module.textContent,
                duration: module.duration,
                completed: module.progresses[0]?.completed === true,
                lastWatchedTime: module.progresses[0]?.timeSpent ?? 0,
                lastAccessed: module.progresses[0]?.lastAccessed ?? null,
            })),
        }));
        return {
            enrollmentId: enrollment.id,
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                price: course.price,
                thumbnail: course.thumbnail,
                status: course.status,
                createdAt: course.createdAt,
                instructor: course.instructor,
            },
            sections,
            progress: {
                totalModules: summary.totalModules,
                completedModules: summary.completedModules,
                percentage: summary.progressPercentage,
                lastAccessedModuleId: summary.lastAccessedModuleId,
                lastAccessedAt: summary.lastAccessedAt,
            },
        };
    }
    async getCertificates(userId) {
        return this.prisma.certificate.findMany({
            where: { userId },
            select: {
                id: true,
                issuedAt: true,
                pdfUrl: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }
    async getCertificateDownload(userId, certificateId) {
        const certificate = await this.prisma.certificate.findFirst({
            where: {
                id: certificateId,
                userId,
            },
            select: {
                id: true,
                pdfUrl: true,
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        if (!certificate.pdfUrl) {
            throw new common_1.NotFoundException('Certificate file is not available');
        }
        return {
            certificateId: certificate.id,
            downloadUrl: certificate.pdfUrl,
        };
    }
    async getNotifications(userId, limit, unreadOnly) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { read: false } : {}),
            },
            select: {
                id: true,
                type: true,
                title: true,
                message: true,
                read: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getUnreadNotificationCount(userId) {
        const unreadCount = await this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
        return { unreadCount };
    }
    async markNotificationRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
            select: {
                id: true,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id: notification.id },
            data: { read: true },
            select: {
                id: true,
                read: true,
            },
        });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map