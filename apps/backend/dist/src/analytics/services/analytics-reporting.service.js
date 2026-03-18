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
var AnalyticsReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsReportingService = AnalyticsReportingService_1 = class AnalyticsReportingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AnalyticsReportingService_1.name);
    }
    async getCourseAnalytics(courseId) {
        try {
            const [enrollmentCount, completionCount, courseEvents, avgModulesPerUser, avgQuizScore,] = await Promise.all([
                this.prisma.enrollment.count({ where: { courseId } }),
                this.prisma.analyticsEvent.count({
                    where: {
                        courseId,
                        type: 'course.completed',
                    },
                }),
                this.prisma.analyticsEvent.findMany({
                    where: { courseId },
                    select: { type: true },
                }),
                this.getAvgModulesCompleted(courseId),
                this.getAvgQuizScore(courseId),
            ]);
            const eventCounts = this.countEventsByType(courseEvents);
            const completionRate = enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0;
            return {
                courseId,
                enrollmentCount,
                completionCount,
                completionRate: Math.round(completionRate),
                avgModulesCompleted: avgModulesPerUser,
                avgQuizScore: avgQuizScore,
                eventBreakdown: eventCounts,
            };
        }
        catch (error) {
            this.logger.error(`Error getting course analytics for ${courseId}:`, error);
            throw error;
        }
    }
    async getStudentProgress(courseId, userId) {
        try {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: { courseId, userId },
            });
            if (!enrollment) {
                return null;
            }
            const [modulesCompleted, quizzesTaken, averageQuizScore, certificateEarned, timeSpent,] = await Promise.all([
                this.prisma.analyticsEvent.count({
                    where: {
                        userId,
                        courseId,
                        type: 'module.completed',
                    },
                }),
                this.prisma.analyticsEvent.count({
                    where: {
                        userId,
                        courseId,
                        type: 'quiz.completed',
                    },
                }),
                this.getAverageScoreForUser(userId, courseId, 'quiz.completed'),
                this.prisma.analyticsEvent.count({
                    where: {
                        userId,
                        courseId,
                        type: 'certificate.earned',
                    },
                }),
                this.getTotalTimeSpent(userId, courseId),
            ]);
            return {
                userId,
                courseId,
                enrolledAt: enrollment.createdAt,
                modulesCompleted,
                quizzesTaken,
                averageQuizScore,
                certificateEarned: certificateEarned > 0,
                totalTimeSpent: timeSpent,
            };
        }
        catch (error) {
            this.logger.error(`Error getting student progress:`, error);
            throw error;
        }
    }
    async getCourseStudentsProgress(courseId) {
        try {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { courseId },
                include: { user: true },
            });
            const studentProgress = await Promise.all(enrollments.map(enrollment => this.getStudentProgress(courseId, enrollment.userId)));
            return studentProgress.filter(sp => sp !== null);
        }
        catch (error) {
            this.logger.error(`Error getting course students progress:`, error);
            throw error;
        }
    }
    async getUserAnalytics(userId) {
        try {
            const [enrollmentCount, coursesCompleted, certificatesEarned, totalTimeSpent, recentEvents,] = await Promise.all([
                this.prisma.enrollment.count({ where: { userId } }),
                this.prisma.analyticsEvent.count({
                    where: { userId, type: 'course.completed' },
                }),
                this.prisma.analyticsEvent.count({
                    where: { userId, type: 'certificate.earned' },
                }),
                this.getTotalTimeSpentByUser(userId),
                this.prisma.analyticsEvent.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
            ]);
            return {
                userId,
                enrollmentCount,
                coursesCompleted,
                certificatesEarned,
                totalTimeSpent,
                recentEvents,
            };
        }
        catch (error) {
            this.logger.error(`Error getting user analytics:`, error);
            throw error;
        }
    }
    async getPlatformAnalytics(startDate, endDate) {
        try {
            const totalUsers = await this.prisma.user.count();
            const totalCourses = await this.prisma.course.count();
            const totalEnrollments = await this.prisma.enrollment.count();
            const completedEnrollments = await this.prisma.analyticsEvent.count({
                where: { type: 'course.completed' },
            });
            const totalRevenue = await this.prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
            });
            const topCourses = await this.getTopCourses(5);
            const eventBreakdown = await this.getPlatformEventBreakdown();
            const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
            return {
                totalUsers,
                totalCourses,
                totalEnrollments,
                completedEnrollments,
                completionRate: Math.round(completionRate),
                totalRevenue: totalRevenue._sum.amount || 0,
                topCourses,
                eventBreakdown,
                period: {
                    startDate: startDate || new Date(new Date().setDate(1)),
                    endDate: endDate || new Date(),
                },
            };
        }
        catch (error) {
            this.logger.error('Error getting platform analytics:', error);
            throw error;
        }
    }
    async getTopCourses(limit = 5, startDate, endDate) {
        try {
            const dateFilter = this._buildDateFilter(startDate, endDate);
            const topCourses = await this.prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    enrollments: {
                        where: dateFilter ? { createdAt: dateFilter } : {},
                    },
                },
                orderBy: {
                    enrollments: {
                        _count: 'desc',
                    },
                },
                take: limit,
            });
            return topCourses.map(course => ({
                courseId: course.id,
                title: course.title,
                enrollmentCount: course.enrollments.length,
            }));
        }
        catch (error) {
            this.logger.error('Error getting top courses:', error);
            throw error;
        }
    }
    async getEngagementMetrics(startDate, endDate) {
        try {
            const dateFilter = this._buildDateFilter(startDate, endDate);
            const where = dateFilter ? { createdAt: dateFilter } : {};
            const events = await this.prisma.analyticsEvent.findMany({
                where,
                select: { type: true, metadata: true },
            });
            const avgTimePerModule = this._calculateAvgTimePerModule(events);
            const quizPassRate = this._calculateQuizPassRate(events);
            const activeDays = await this._calculateActiveDays(startDate, endDate);
            return {
                avgTimePerModule,
                quizPassRate: Math.round(quizPassRate),
                activeDays,
            };
        }
        catch (error) {
            this.logger.error('Error getting engagement metrics:', error);
            throw error;
        }
    }
    async getAvgModulesCompleted(courseId) {
        const result = await this.prisma.analyticsEvent.groupBy({
            by: ['userId'],
            where: { courseId, type: 'module.completed' },
            _count: true,
        });
        return result.length > 0
            ? result.reduce((sum, r) => sum + r._count, 0) / result.length
            : 0;
    }
    async getAvgQuizScore(courseId) {
        const events = await this.prisma.analyticsEvent.findMany({
            where: { courseId, type: 'quiz.completed' },
            select: { metadata: true },
        });
        if (events.length === 0)
            return 0;
        const scores = events
            .map(e => {
            const meta = e.metadata;
            return meta.score / meta.maxScore * 100;
        })
            .filter(s => !isNaN(s));
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    async getAverageScoreForUser(userId, courseId, eventType) {
        const events = await this.prisma.analyticsEvent.findMany({
            where: { userId, courseId, type: eventType },
            select: { metadata: true },
        });
        if (events.length === 0)
            return 0;
        const scores = events
            .map(e => {
            const meta = e.metadata;
            return meta.score / meta.maxScore * 100;
        })
            .filter(s => !isNaN(s));
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    async getTotalTimeSpent(userId, courseId) {
        const events = await this.prisma.analyticsEvent.findMany({
            where: { userId, courseId, type: 'module.time_spent' },
            select: { metadata: true },
        });
        return events.reduce((sum, e) => {
            const meta = e.metadata;
            return sum + (meta.duration || 0);
        }, 0);
    }
    async getTotalTimeSpentByUser(userId) {
        const events = await this.prisma.analyticsEvent.findMany({
            where: { userId, type: 'module.time_spent' },
            select: { metadata: true },
        });
        return events.reduce((sum, e) => {
            const meta = e.metadata;
            return sum + (meta.duration || 0);
        }, 0);
    }
    countEventsByType(events) {
        return events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
    }
    async getPlatformEventBreakdown(startDate, endDate) {
        const dateFilter = this._buildDateFilter(startDate, endDate);
        const where = dateFilter ? { createdAt: dateFilter } : {};
        const events = await this.prisma.analyticsEvent.findMany({
            where,
            select: { type: true },
        });
        return this.countEventsByType(events);
    }
    _buildDateFilter(startDate, endDate) {
        if (!startDate && !endDate)
            return null;
        return {
            gte: startDate || new Date(0),
            lte: endDate || new Date(),
        };
    }
    _calculateAvgTimePerModule(events) {
        const timeEvents = events.filter(e => e.type === 'module.time_spent');
        if (timeEvents.length === 0)
            return 0;
        const totalTime = timeEvents.reduce((sum, e) => sum + (e.metadata.duration || 0), 0);
        return Math.round(totalTime / timeEvents.length);
    }
    _calculateQuizPassRate(events) {
        const quizEvents = events.filter(e => e.type === 'quiz.completed');
        if (quizEvents.length === 0)
            return 0;
        const passed = quizEvents.filter(e => e.metadata.passed).length;
        return (passed / quizEvents.length) * 100;
    }
    async _calculateActiveDays(startDate, endDate) {
        const dateFilter = this._buildDateFilter(startDate, endDate);
        const where = dateFilter ? { createdAt: dateFilter } : {};
        const events = await this.prisma.analyticsEvent.findMany({
            where,
            select: { createdAt: true, userId: true },
        });
        const uniqueDays = new Set(events.map(e => e.createdAt.toISOString().split('T')[0]));
        return uniqueDays.size;
    }
};
exports.AnalyticsReportingService = AnalyticsReportingService;
exports.AnalyticsReportingService = AnalyticsReportingService = AnalyticsReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsReportingService);
//# sourceMappingURL=analytics-reporting.service.js.map