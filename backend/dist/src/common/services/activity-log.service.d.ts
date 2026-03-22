import { PrismaService } from '../../prisma/prisma.service';
export type ActivityAction = 'USER_REGISTERED' | 'USER_APPROVED' | 'USER_REJECTED' | 'USER_BLACKLISTED' | 'USER_UNBLACKLISTED' | 'BLACKLIST_REVERTED' | 'TEACHER_CREATED' | 'COURSE_CREATED' | 'COURSE_ACCESSED' | 'COURSE_APPROVED' | 'COURSE_REJECTED' | 'COURSE_BLACKLISTED' | 'COURSE_UNBLACKLISTED' | 'ENROLLMENT_REQUESTED' | 'ENROLLMENT_APPROVED' | 'ENROLLMENT_REJECTED' | 'ENROLLMENT_COMPLETED' | 'QUIZ_STARTED' | 'QUIZ_SUBMITTED' | 'QUIZ_GRADED' | 'ASSIGNMENT_SUBMITTED' | 'ASSIGNMENT_GRADED' | 'COURSE_COMPLETED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'OTP_SENT' | 'OTP_VERIFIED' | 'OTP_FAILED' | 'PASSWORD_CHANGED' | 'PROFILE_UPDATED' | 'MODULE_CREATED' | 'SECTION_CREATED' | 'CONTENT_GENERATED' | 'REJECTED_STUDENTS_CLEANED' | 'ALL_REJECTED_CLEANED' | 'COURSE_DELETED';
export type EntityType = 'USER' | 'COURSE' | 'ENROLLMENT' | 'QUIZ' | 'ASSIGNMENT' | 'CERTIFICATE' | 'MODULE' | 'SECTION' | 'OTP' | 'CONTENT' | 'SYSTEM';
interface LogParams {
    action: ActivityAction;
    entityType: EntityType;
    entityId?: string;
    userId?: string;
    targetUserId?: string;
    metadata?: Record<string, any>;
}
interface LogFilters {
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class ActivityLogService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: LogParams): Promise<void>;
    getRecentLogs(limit?: number, offset?: number): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
    }[]>;
    getFilteredLogs(limit: number, offset: number, filters: LogFilters): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
    }[]>;
    getLogTypes(): Promise<string[]>;
    getLogsByEntity(entityType: EntityType, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
    }[]>;
    getLogsByUser(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
    }[]>;
    getNewLogsSince(since: Date, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        targetUserId: string | null;
    }[]>;
}
export {};
