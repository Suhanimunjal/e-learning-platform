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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ActivityLogService = class ActivityLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
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
        }
        catch (error) {
            console.error('Failed to create activity log:', error);
        }
    }
    async getRecentLogs(limit = 50, offset = 0) {
        return this.prisma.activityLog.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLogsByEntity(entityType, entityId) {
        return this.prisma.activityLog.findMany({
            where: {
                entityType,
                entityId,
            },
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
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map