import { AnalyticsTrackingService } from './services/analytics-tracking.service';
import { AnalyticsReportingService } from './services/analytics-reporting.service';
export declare class AnalyticsController {
    private readonly trackingService;
    private readonly reportingService;
    constructor(trackingService: AnalyticsTrackingService, reportingService: AnalyticsReportingService);
    getMyAnalytics(req: any): Promise<{
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
            moduleId: string | null;
            userId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
    getCourseAnalytics(courseId: string, req: any): Promise<{
        courseId: string;
        enrollmentCount: number;
        completionCount: number;
        completionRate: number;
        avgModulesCompleted: number;
        avgQuizScore: number;
        eventBreakdown: Record<string, number>;
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
    getStudentProgress(courseId: string, studentId: string): Promise<{
        userId: string;
        courseId: string;
        enrolledAt: Date;
        modulesCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        certificateEarned: boolean;
        totalTimeSpent: any;
    }>;
    getPlatformAnalytics(startDate?: string, endDate?: string): Promise<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        completedEnrollments: number;
        completionRate: number;
        totalRevenue: number;
        enrollmentTrend: {
            month: string;
            enrollments: number;
        }[];
        revenueTrend: {
            month: string;
            revenue: number;
        }[];
        userGrowthRate: number;
        revenueGrowthRate: number;
        enrollmentGrowthRate: number;
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
    getTopCourses(limit?: string): Promise<{
        courseId: string;
        title: string;
        enrollmentCount: number;
    }[]>;
    getEngagementMetrics(startDate?: string, endDate?: string): Promise<{
        avgTimePerModule: number;
        quizPassRate: number;
        activeDays: number;
    }>;
}
