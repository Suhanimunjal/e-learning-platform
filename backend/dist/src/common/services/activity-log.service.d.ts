import { PrismaService } from '../../prisma/prisma.service';
export type ActivityAction = 'USER_REGISTERED' | 'USER_APPROVED' | 'USER_REJECTED' | 'TEACHER_CREATED' | 'COURSE_CREATED' | 'COURSE_APPROVED' | 'COURSE_REJECTED' | 'ENROLLMENT_REQUESTED' | 'ENROLLMENT_APPROVED' | 'ENROLLMENT_REJECTED' | 'QUIZ_GRADED' | 'ASSIGNMENT_GRADED' | 'COURSE_COMPLETED';
export type EntityType = 'USER' | 'COURSE' | 'ENROLLMENT' | 'QUIZ' | 'ASSIGNMENT' | 'CERTIFICATE';
interface LogParams {
    action: ActivityAction;
    entityType: EntityType;
    entityId?: string;
    userId?: string;
    targetUserId?: string;
    metadata?: Record<string, any>;
}
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: LogParams): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>;
    getRecentLogs(limit?: number, offset?: number): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }[]>;
    getLogsByEntity(entityType: EntityType, entityId: string): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }[]>;
    getLogsByUser(userId: string, limit?: number): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        userId: string | null;
        targetUserId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }[]>;
}
export {};
