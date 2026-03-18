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
var SubscriptionPlanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SubscriptionPlanService = SubscriptionPlanService_1 = class SubscriptionPlanService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SubscriptionPlanService_1.name);
    }
    async createPlan(data) {
        try {
            const plan = await this.prisma.subscriptionPlan.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    billingCycle: data.billingCycle,
                    features: data.features,
                    maxCourses: data.maxCourses || -1,
                    maxStudents: data.maxStudents || -1,
                    supportLevel: data.supportLevel || 'basic',
                    razorpayPlanId: data.razorpayPlanId,
                },
            });
            return plan;
        }
        catch (error) {
            this.logger.error('Error creating subscription plan:', error);
            throw error;
        }
    }
    async getPlanById(planId) {
        return this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
    }
    async getAllPlans(onlyActive = true) {
        return this.prisma.subscriptionPlan.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { price: 'asc' },
        });
    }
    async updatePlan(planId, data) {
        return this.prisma.subscriptionPlan.update({
            where: { id: planId },
            data,
        });
    }
    async deletePlan(planId) {
        return this.prisma.subscriptionPlan.update({
            where: { id: planId },
            data: { isActive: false },
        });
    }
};
exports.SubscriptionPlanService = SubscriptionPlanService;
exports.SubscriptionPlanService = SubscriptionPlanService = SubscriptionPlanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionPlanService);
//# sourceMappingURL=subscription-plan.service.js.map