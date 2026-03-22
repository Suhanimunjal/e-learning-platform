import { StudentService } from './student.service';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getDashboard(req: any): Promise<{
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
    getEnrolledCourses(req: any): Promise<{
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
    getCourseFull(req: any, courseId: string): Promise<{
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
    getCertificates(req: any): Promise<{
        id: string;
        course: {
            id: string;
            title: string;
        };
        issuedAt: Date;
        pdfUrl: string;
    }[]>;
    getCertificateDownload(req: any, certificateId: string): Promise<{
        certificateId: string;
        downloadUrl: string;
    }>;
    getNotifications(req: any, limit?: string, unreadOnly?: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        title: string;
        type: string;
        read: boolean;
    }[]>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markNotificationRead(req: any, notificationId: string): Promise<{
        id: string;
        read: boolean;
    }>;
}
