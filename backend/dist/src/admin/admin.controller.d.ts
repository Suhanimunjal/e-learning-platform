import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';
import { GenerateAiCourseDto } from './dto/generate-ai-course.dto';
import { AdminCourseGenerationService } from './services/admin-course-generation.service';
export declare class AdminController {
    private prisma;
    private otpService;
    private emailService;
    private activityLogService;
    private adminCourseGenerationService;
    constructor(prisma: PrismaService, otpService: OtpService, emailService: EmailService, activityLogService: ActivityLogService, adminCourseGenerationService: AdminCourseGenerationService);
    generateAiCourse(body: GenerateAiCourseDto, req: any): Promise<{
        jobId: string;
        status: string;
    }>;
    getGenerationJob(jobId: string): Promise<{
        error: string | null;
        id: string;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getActivityLogs(limit?: string, offset?: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
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
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        name: string;
        organization: {
            name: string;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    approveUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            name: string;
            email: string;
        };
    }>;
    rejectUser(userId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            name: string;
            rejectionReason: string;
            email: string;
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
        status: import(".prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        approvedBy: string | null;
        rejectionReason: string | null;
        slug: string;
        description: string;
        thumbnail: string | null;
        videoIntro: string | null;
        price: number;
        instructorId: string;
        organizationId: string | null;
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
            title: string;
            rejectionReason: string;
            instructorId: string;
        };
    }>;
    getPendingEnrollments(): Promise<({
        course: {
            id: string;
            title: string;
            instructorId: string;
        };
        user: {
            id: string;
            name: string;
            email: string;
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
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getStats(): Promise<{
        pendingApprovals: number;
        totalUsers: number;
        totalTeachers: number;
        totalStudents: number;
        totalCourses: number;
    }>;
}
