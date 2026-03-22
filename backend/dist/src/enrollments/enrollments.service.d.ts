import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService } from '../analytics/services/analytics-tracking.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export declare class EnrollmentsService {
    private prisma;
    private analyticsTracking;
    private activityLogService;
    constructor(prisma: PrismaService, analyticsTracking: AnalyticsTrackingService, activityLogService: ActivityLogService);
    enroll(courseId: string, user: User): Promise<{
        message: string;
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    getMyCourses(user: User): Promise<({
        course: {
            instructor: {
                id: string;
                name: string;
                email: string;
            };
            sections: ({
                modules: {
                    id: string;
                    type: import(".prisma/client").$Enums.ModuleType;
                    retryCount: number;
                    rejectionReason: string | null;
                    title: string;
                    approvedBy: string | null;
                    order: number;
                    sectionId: string;
                    videoUrl: string | null;
                    textContent: string | null;
                    content: import("@prisma/client/runtime/client").JsonValue | null;
                    duration: number | null;
                    isPreview: boolean;
                    hasVideo: boolean;
                    videoGenId: string | null;
                    topic: string | null;
                    generatedContent: import("@prisma/client/runtime/client").JsonValue | null;
                    contentStatus: import(".prisma/client").$Enums.ContentStatus;
                    videoStatus: import(".prisma/client").$Enums.VideoStatus;
                    audioUrl: string | null;
                    transcript: string | null;
                    voiceId: string | null;
                    approvedAt: Date | null;
                    contentGeneratedAt: Date | null;
                    videoGeneratedAt: Date | null;
                }[];
            } & {
                id: string;
                title: string;
                courseId: string;
                order: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            updatedAt: Date;
            rejectionReason: string | null;
            organizationId: string | null;
            slug: string;
            title: string;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            approvedBy: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    getPendingEnrollments(userId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        course: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    approveEnrollment(enrollmentId: string, teacherId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    rejectEnrollment(enrollmentId: string, teacherId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    getCourseStudents(courseId: string, user: User): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
}
