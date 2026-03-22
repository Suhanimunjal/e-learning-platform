import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ActivityAction = 
  | 'USER_REGISTERED'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'USER_BLACKLISTED'
  | 'USER_UNBLACKLISTED'
  | 'BLACKLIST_REVERTED'
  | 'TEACHER_CREATED'
  | 'COURSE_CREATED'
  | 'COURSE_ACCESSED'
  | 'COURSE_APPROVED'
  | 'COURSE_REJECTED'
  | 'COURSE_BLACKLISTED'
  | 'COURSE_UNBLACKLISTED'
  | 'ENROLLMENT_REQUESTED'
  | 'ENROLLMENT_APPROVED'
  | 'ENROLLMENT_REJECTED'
  | 'ENROLLMENT_COMPLETED'
  | 'QUIZ_STARTED'
  | 'QUIZ_SUBMITTED'
  | 'QUIZ_GRADED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'COURSE_COMPLETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PROFILE_UPDATED'
  | 'MODULE_CREATED'
  | 'SECTION_CREATED'
  | 'CONTENT_GENERATED'
  | 'REJECTED_STUDENTS_CLEANED'
  | 'ALL_REJECTED_CLEANED'
  | 'COURSE_DELETED';

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

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: LogParams): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          userId: params.userId,
          targetUserId: params.targetUserId,
          metadata: params.metadata || {},
        },
      });
      this.logger.debug(`Logged: ${params.action} for ${params.entityType} ${params.entityId || ''}`);
    } catch (error) {
      this.logger.error(`Failed to create activity log: ${params.action}`, error);
    }
  }

  async getRecentLogs(limit: number = 50, offset: number = 0) {
    return this.prisma.activityLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFilteredLogs(limit: number = 50, offset: number = 0, filters: LogFilters) {
    const where: any = {};
    
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }
    
    return this.prisma.activityLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogTypes(): Promise<string[]> {
    const types = await this.prisma.activityLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });
    return types.map(t => t.action);
  }

  async getLogsByEntity(entityType: EntityType, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogsByUser(userId: string, limit: number = 50) {
    return this.prisma.activityLog.findMany({
      where: {
        OR: [
          { userId },
          { targetUserId: userId },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNewLogsSince(since: Date, limit: number = 100) {
    return this.prisma.activityLog.findMany({
      where: {
        createdAt: { gt: since },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
