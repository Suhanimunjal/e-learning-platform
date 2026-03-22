import { UserStatus } from '@prisma/client';
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
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
        updatedAt: Date;
    }>;
    getActivityLogs(limit?: string, offset?: string, action?: string, entityType?: string, startDate?: string, endDate?: string): Promise<({
        user: never;
    } & {
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    })[]>;
    getNewLogs(since?: string, limit?: string): Promise<({
        user: never;
    } & {
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    })[]>;
    getLogTypes(): Promise<string[]>;
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
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    getPendingUsers(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        organization: {
            name: string;
        };
    }[]>;
    approveUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
        };
    }>;
    rejectUser(userId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
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
    getTeachers(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getTeacherById(teacherId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        organization: {
            id: string;
            createdAt: Date;
            name: string;
        };
        coursesCreated: {
            id: string;
            createdAt: Date;
            _count: {
                sections: number;
            };
            status: import(".prisma/client").$Enums.CourseStatus;
            title: string;
            price: number;
        }[];
    }>;
    getStudents(status?: UserStatus): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        email: string;
    }[]>;
    getStudentById(studentId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        organization: {
            id: string;
            createdAt: Date;
            name: string;
        };
        enrollments: {
            id: string;
            createdAt: Date;
            course: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.CourseStatus;
                title: string;
                price: number;
            };
            accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
        }[];
    }>;
    getStats(): Promise<{
        pendingApprovals: number;
        totalUsers: number;
        totalTeachers: number;
        totalStudents: number;
        totalCourses: number;
        blacklistedUsers: number;
        blacklistedCourses: number;
    }>;
    blacklistUser(userId: string, body: {
        reason: string;
    }, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    unblacklistUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    blacklistCourse(courseId: string, body: {
        reason: string;
    }, req: any): Promise<{
        success: boolean;
        course: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            title: string;
            instructorId: string;
        };
    }>;
    unblacklistCourse(courseId: string, req: any): Promise<{
        success: boolean;
        course: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            title: string;
            instructorId: string;
        };
    }>;
}
