import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsReportingService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCourseAnalytics(courseId: string): Promise<{
        courseId: string;
        enrollmentCount: number;
        completionCount: number;
        completionRate: number;
        avgModulesCompleted: number;
        avgQuizScore: number;
        eventBreakdown: Record<string, number>;
    }>;
    getStudentProgress(courseId: string, userId: string): Promise<{
        userId: string;
        courseId: string;
        enrolledAt: Date;
        modulesCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        certificateEarned: boolean;
        totalTimeSpent: any;
    }>;
    getCourseStudentsProgress(courseId: string): Promise<{
        userId: string;
        courseId: string;
        enrolledAt: Date;
        modulesCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        certificateEarned: boolean;
        totalTimeSpent: any;
    }[]>;
    getUserAnalytics(userId: string): Promise<{
        userId: string;
        enrollmentCount: number;
        coursesCompleted: number;
        certificatesEarned: number;
        totalTimeSpent: any;
        recentEvents: {
            id: string;
            createdAt: Date;
            courseId: string | null;
            type: string;
            userId: string;
            moduleId: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
    getPlatformAnalytics(startDate?: Date, endDate?: Date): Promise<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        completedEnrollments: number;
        completionRate: number;
        totalRevenue: number;
        topCourses: {
            courseId: string;
            title: string;
            enrollmentCount: number;
        }[];
        eventBreakdown: Record<string, number>;
        period: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getTopCourses(limit?: number, startDate?: Date, endDate?: Date): Promise<{
        courseId: string;
        title: string;
        enrollmentCount: number;
    }[]>;
    getEngagementMetrics(startDate?: Date, endDate?: Date): Promise<{
        avgTimePerModule: number;
        quizPassRate: number;
        activeDays: number;
    }>;
    private getAvgModulesCompleted;
    private getAvgQuizScore;
    private getAverageScoreForUser;
    private getTotalTimeSpent;
    private getTotalTimeSpentByUser;
    private countEventsByType;
    private getPlatformEventBreakdown;
    private _buildDateFilter;
    private _calculateAvgTimePerModule;
    private _calculateQuizPassRate;
    private _calculateActiveDays;
}
