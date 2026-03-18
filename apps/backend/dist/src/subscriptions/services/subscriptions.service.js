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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const subscription_plan_service_1 = require("./subscription-plan.service");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    constructor(prisma, planService) {
        this.prisma = prisma;
        this.planService = planService;
        this.logger = new common_1.Logger(SubscriptionsService_1.name);
    }
    async createSubscription(data) {
        try {
            const plan = await this.planService.getPlanById(data.planId);
            if (!plan) {
                throw new common_1.BadRequestException('Subscription plan not found');
            }
            const existingSubscription = await this.prisma.subscription.findFirst({
                where: {
                    userId: data.userId,
                    status: 'active',
                },
            });
            if (existingSubscription) {
                throw new common_1.BadRequestException('User already has an active subscription');
            }
            const currentDate = new Date();
            let nextBillingDate = new Date(currentDate);
            switch (plan.billingCycle) {
                case 'monthly':
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
                    break;
                case 'yearly':
                    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                    break;
            }
            const subscription = await this.prisma.subscription.create({
                data: {
                    userId: data.userId,
                    planId: data.planId,
                    status: 'active',
                    currentPeriodStart: currentDate,
                    currentPeriodEnd: nextBillingDate,
                    nextBillingDate: nextBillingDate,
                    razorpaySubscriptionId: data.razorpaySubscriptionId,
                },
                include: {
                    plan: true,
                    user: true,
                },
            });
            return subscription;
        }
        catch (error) {
            this.logger.error('Error creating subscription:', error);
            throw error;
        }
    }
    async getSubscriptionById(subscriptionId) {
        return this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                plan: true,
                user: true,
            },
        });
    }
    async getUserSubscription(userId) {
        return this.prisma.subscription.findFirst({
            where: { userId },
            include: {
                plan: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUserActiveSubscription(userId) {
        return this.prisma.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                plan: true,
            },
        });
    }
    async cancelSubscription(subscriptionId) {
        const subscription = await this.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription not found');
        }
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
            },
            include: {
                plan: true,
            },
        });
    }
    async renewSubscription(subscriptionId) {
        const subscription = await this.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription not found');
        }
        const plan = subscription.plan;
        const newPeriodEnd = new Date(subscription.currentPeriodEnd);
        switch (plan.billingCycle) {
            case 'monthly':
                newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
                break;
            case 'quarterly':
                newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 3);
                break;
            case 'yearly':
                newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
                break;
        }
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'active',
                currentPeriodStart: subscription.currentPeriodEnd,
                currentPeriodEnd: newPeriodEnd,
                nextBillingDate: newPeriodEnd,
            },
            include: {
                plan: true,
            },
        });
    }
    async checkExpiredSubscriptions() {
        const now = new Date();
        const expiredSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: 'active',
                currentPeriodEnd: {
                    lte: now,
                },
            },
        });
        for (const sub of expiredSubscriptions) {
            await this.prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'expired' },
            });
        }
        this.logger.log(`Marked ${expiredSubscriptions.length} subscriptions as expired`);
        return expiredSubscriptions;
    }
    async getAllSubscriptions(filter) {
        return this.prisma.subscription.findMany({
            where: filter,
            include: {
                plan: true,
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_plan_service_1.SubscriptionPlanService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map