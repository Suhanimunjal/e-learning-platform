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
    getActivityLogs(limit?: number, offset?: number): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }[]>;
    registerTeacher(body: {
        name: string;
        email: string;
        password: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        email?: undefined;
    } | {
        success: boolean;
        message: string;
        email: string;
    }>;
    verifyTeacherOTP(body: {
        email: string;
        otp: string;
        name: string;
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
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        organization: {
            name: string;
        };
    }[]>;
    approveUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    rejectUser(userId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
            rejectionReason: string;
        };
    }>;
    getPendingCourses(): Promise<({
        _count: {
            sections: number;
        };
        instructor: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.CourseStatus;
        rejectionReason: string | null;
        updatedAt: Date;
        organizationId: string | null;
        slug: string;
        title: string;
        description: string;
        thumbnail: string | null;
        videoIntro: string | null;
        price: number;
        instructorId: string;
        approvedBy: string | null;
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
            id: string;
            name: string;
            email: string;
        };
        course: {
            id: string;
            title: string;
            instructorId: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    approveEnrollment(enrollmentId: string, req: any): Promise<{
        success: boolean;
        enrollment: {
            id: string;
            userId: string;
            createdAt: Date;
            courseId: string;
            accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
        };
    }>;
    rejectEnrollment(enrollmentId: string, req: any): Promise<{
        success: boolean;
        enrollment: {
            id: string;
            userId: string;
            createdAt: Date;
            courseId: string;
            accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
        };
    }>;
    getStats(): Promise<{
        pendingUsers: number;
        pendingCourses: number;
        pendingEnrollments: number;
        totalUsers: number;
        totalTeachers: number;
        totalStudents: number;
    }>;
}
