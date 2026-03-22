"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ActivityLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ActivityLogService = ActivityLogService_1 = class ActivityLogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ActivityLogService_1.name);
    }
    async log(params) {
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
        }
        catch (error) {
            this.logger.error(`Failed to create activity log: ${params.action}`, error);
        }
    }
    async getRecentLogs(limit = 50, offset = 0) {
        return this.prisma.activityLog.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getFilteredLogs(limit = 50, offset = 0, filters) {
        const where = {};
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
    async getLogTypes() {
        const types = await this.prisma.activityLog.findMany({
            select: { action: true },
            distinct: ['action'],
            orderBy: { action: 'asc' },
        });
        return types.map(t => t.action);
    }
    async getLogsByEntity(entityType, entityId) {
        return this.prisma.activityLog.findMany({
            where: { entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLogsByUser(userId, limit = 50) {
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
    async getNewLogsSince(since, limit = 100) {
        return this.prisma.activityLog.findMany({
            where: {
                createdAt: { gt: since },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = ActivityLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map