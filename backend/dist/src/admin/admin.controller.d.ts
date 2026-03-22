import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';
import { GenerateAiCourseDto } from './dto/generate-ai-course.dto';
import { AdminCourseGenerationService } from './services/admin-course-generation.service';
import { RegisterTeacherBodyDto, RejectUserBodyDto, BlacklistUserBodyDto, RejectCourseBodyDto, BlacklistCourseBodyDto } from './dto/admin.dto';
export declare class AdminController {
    private prisma;
    private otpService;
    private emailService;
    private activityLogService;
    private adminCourseGenerationService;
    constructor(prisma: PrismaService, otpService: OtpService, emailService: EmailService, activityLogService: ActivityLogService, adminCourseGenerationService: AdminCourseGenerationService);
    private notify;
    generateAiCourse(body: GenerateAiCourseDto, req: any): Promise<{
        jobId: string;
        status: string;
    }>;
    getGenerationJob(jobId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        retryCount: number;
        version: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tenantId: string | null;
    }>;
    getActivityLogs(limit?: string, offset?: string, action?: string, entityType?: string, startDate?: string, endDate?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    getNewLogs(since?: string, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    getLogTypes(): Promise<string[]>;
    registerTeacher(body: RegisterTeacherBodyDto, req: any): Promise<{
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
        name: string;
        createdAt: Date;
        organization: {
            name: string;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string;
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
    rejectUser(userId: string, body: RejectUserBodyDto, req: any): Promise<{
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
        instructor: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            sections: number;
        };
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CourseStatus;
        rejectionReason: string | null;
        organizationId: string | null;
        title: string;
        description: string;
        thumbnail: string | null;
        videoIntro: string | null;
        price: number;
        approvedBy: string | null;
        materials: import("@prisma/client/runtime/client").JsonValue | null;
        youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
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
    rejectCourse(courseId: string, body: RejectCourseBodyDto, req: any): Promise<{
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organization: {
            id: string;
            name: string;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        rejectionReason: string;
        phone: string;
        _count: {
            coursesCreated: number;
        };
    }[]>;
    getTeacherById(teacherId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organization: {
            id: string;
            name: string;
            createdAt: Date;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        avatar: string;
        rejectionReason: string;
        phone: string;
        coursesCreated: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            title: string;
            price: number;
            _count: {
                sections: number;
            };
        }[];
    }>;
    getStudents(status?: UserStatus): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organization: {
            id: string;
            name: string;
        };
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        rejectionReason: string;
        phone: string;
        rollNo: string;
        year: string;
        branch: string;
        course: string;
        _count: {
            enrollments: number;
        };
    }[]>;
    getStudentById(studentId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organization: {
            id: string;
            name: string;
            createdAt: Date;
        };
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        avatar: string;
        rejectionReason: string;
        phone: string;
        rollNo: string;
        year: string;
        branch: string;
        course: string;
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
    cleanupRejectedStudents(req: any): Promise<{
        success: boolean;
        deleted: number;
        message: string;
    }>;
    cleanupAllRejected(req: any): Promise<{
        success: boolean;
        deleted: Record<string, number>;
        message: string;
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
    blacklistUser(userId: string, body: BlacklistUserBodyDto, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
        blacklistedCourses: number;
    }>;
    unblacklistUser(userId: string, req: any): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
        restoredCourses: number;
    }>;
    blacklistCourse(courseId: string, body: BlacklistCourseBodyDto, req: any): Promise<{
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
    deleteCourse(courseId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
