import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ActivityAction = 
  | 'USER_REGISTERED'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'TEACHER_CREATED'
  | 'COURSE_CREATED'
  | 'COURSE_ACCESSED'
  | 'COURSE_APPROVED'
  | 'COURSE_REJECTED'
  | 'ENROLLMENT_REQUESTED'
  | 'ENROLLMENT_APPROVED'
  | 'ENROLLMENT_REJECTED'
  | 'QUIZ_GRADED'
  | 'ASSIGNMENT_GRADED'
  | 'COURSE_COMPLETED';

export type EntityType = 'USER' | 'COURSE' | 'ENROLLMENT' | 'QUIZ' | 'ASSIGNMENT' | 'CERTIFICATE';

interface LogParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  userId?: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: LogParams) {
    try {
      return await this.prisma.activityLog.create({
        data: {
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          userId: params.userId,
          targetUserId: params.targetUserId,
          metadata: params.metadata,
        },
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  async getRecentLogs(limit: number = 50, offset: number = 0) {
    return this.prisma.activityLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogsByEntity(entityType: EntityType, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
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
}
