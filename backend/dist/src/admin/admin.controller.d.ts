import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export declare class AdminController {
    private prisma;
    private otpService;
    private emailService;
    private activityLogService;
    constructor(prisma: PrismaService, otpService: OtpService, emailService: EmailService, activityLogService: ActivityLogService);
    getActivityLogs(limit?: string, offset?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    registerTeacher(body: {
        name: string;
        email: string;
        password: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        teacher?: undefined;
    } | {
        success: boolean;
        message: string;
        teacher: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    getPendingUsers(): Promise<{
        name: string;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        organization: {
            name: string;
        };
    }[]>;
    approveUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            name: string;
            id: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    rejectUser(userId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            name: string;
            id: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
            rejectionReason: string;
        };
    }>;
    getPendingCourses(): Promise<({
        instructor: {
            name: string;
            id: string;
            email: string;
        };
        _count: {
            sections: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CourseStatus;
        organizationId: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        approvedBy: string | null;
        slug: string;
        thumbnail: string | null;
        videoIntro: string | null;
        price: number;
        instructorId: string;
    })[]>;
    approveCourse(courseId: string, req: any): Promise<{
        success: boolean;
        course: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            title: string;
            instructorId: string;
        };
    }>;
    rejectCourse(courseId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        course: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string;
            title: string;
            instructorId: string;
        };
    }>;
    getPendingEnrollments(): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
        };
        course: {
            id: string;
            title: string;
            instructorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    approveEnrollment(enrollmentId: string, req: any): Promise<{
        success: boolean;
        enrollment: {
            id: string;
            createdAt: Date;
            courseId: string;
            userId: string;
            accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
        };
    }>;
    rejectEnrollment(enrollmentId: string, req: any): Promise<{
        success: boolean;
        enrollment: {
            id: string;
            createdAt: Date;
            courseId: string;
            userId: string;
            accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
        };
    }>;
    getTeachers(): Promise<{
        name: string;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }[]>;
    getStats(): Promise<{
        pendingStudents: number;
        pendingEnrollments: number;
        totalUsers: number;
        totalTeachers: number;
        totalStudents: number;
        totalCourses: number;
    }>;
}
