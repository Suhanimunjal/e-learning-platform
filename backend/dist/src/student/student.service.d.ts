import { PrismaService } from '../prisma/prisma.service';
export declare class StudentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private summarizeCourseProgress;
    getDashboard(userId: string): Promise<{
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
        recentActivity: {
            id: string;
            createdAt: Date;
            type: string;
            metadata: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
    getEnrolledCourses(userId: string): Promise<{
        id: string;
        createdAt: Date;
        course: {
            id: string;
            title: string;
            description: string;
            price: number;
            thumbnail: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            instructor: {
                id: string;
                email: string;
                name: string;
            };
        };
        progress: {
            totalModules: number;
            completedModules: number;
            percentage: number;
            lastAccessedModuleId: string;
            lastAccessedModuleTitle: string;
            lastAccessedAt: Date;
        };
    }[]>;
    getCourseFull(userId: string, courseId: string): Promise<{
        enrollmentId: string;
        course: {
            id: string;
            title: string;
            description: string;
            price: number;
            thumbnail: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            instructor: {
                id: string;
                email: string;
                name: string;
            };
        };
        sections: {
            id: string;
            title: string;
            order: number;
            modules: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ModuleType;
                order: number;
                videoUrl: string;
                content: string;
                duration: number;
                completed: boolean;
                lastWatchedTime: number;
                lastAccessed: Date;
            }[];
        }[];
        progress: {
            totalModules: number;
            completedModules: number;
            percentage: number;
            lastAccessedModuleId: string;
            lastAccessedAt: Date;
        };
    }>;
    getCertificates(userId: string): Promise<{
        id: string;
        course: {
            id: string;
            title: string;
        };
        issuedAt: Date;
        pdfUrl: string;
    }[]>;
    getCertificateDownload(userId: string, certificateId: string): Promise<{
        certificateId: string;
        downloadUrl: string;
    }>;
    getNotifications(userId: string, limit: number, unreadOnly: boolean): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        title: string;
        type: string;
        read: boolean;
    }[]>;
    getUnreadNotificationCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markNotificationRead(userId: string, notificationId: string): Promise<{
        id: string;
        read: boolean;
    }>;
}
