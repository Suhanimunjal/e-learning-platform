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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SubscriptionPaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const subscriptions_service_1 = require("./subscriptions.service");
const razorpay_1 = __importDefault(require("razorpay"));
let SubscriptionPaymentsService = SubscriptionPaymentsService_1 = class SubscriptionPaymentsService {
    constructor(prisma, configService, subscriptionsService) {
        this.prisma = prisma;
        this.configService = configService;
        this.subscriptionsService = subscriptionsService;
        this.logger = new common_1.Logger(SubscriptionPaymentsService_1.name);
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (keyId && keySecret) {
            this.razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
    }
    async createSubscriptionOrder(userId, planId) {
        try {
            const plan = await this.prisma.subscriptionPlan.findUnique({
                where: { id: planId },
            });
            if (!plan) {
                throw new common_1.BadRequestException('Subscription plan not found');
            }
            const existingSub = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'active',
                },
            });
            if (existingSub) {
                throw new common_1.BadRequestException('User already has an active subscription');
            }
            const mockSubscriptionId = `sub_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const subscription = await this.subscriptionsService.createSubscription({
                userId,
                planId,
                razorpaySubscriptionId: mockSubscriptionId,
            });
            return {
                subscriptionId: subscription.id,
                razorpaySubscriptionId: mockSubscriptionId,
                plan: {
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    billingCycle: plan.billingCycle,
                },
                keyId: this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_demo',
                message: 'Subscription created successfully (demo mode)',
            };
        }
        catch (error) {
            this.logger.error('Error creating subscription order:', error);
            throw error;
        }
    }
    async handleSubscriptionWebhook(payload, signature) {
        try {
            this.logger.log('Subscription webhook received', { event: payload.event });
            const event = payload.event;
            switch (event) {
                case 'subscription.activated':
                    return this.handleSubscriptionActivated(payload.payload.subscription.entity);
                case 'subscription.charged':
                    return this.handleSubscriptionCharged(payload.payload.subscription.entity);
                case 'subscription.completed':
                    return this.handleSubscriptionCompleted(payload.payload.subscription.entity);
                case 'subscription.cancelled':
                    return this.handleSubscriptionCancelled(payload.payload.subscription.entity);
                case 'subscription.pending':
                    return this.handleSubscriptionPending(payload.payload.subscription.entity);
                default:
                    this.logger.log(`Event ${event} not handled`);
                    return { success: true };
            }
        }
        catch (error) {
            this.logger.error('Error handling subscription webhook:', error);
            throw error;
        }
    }
    async handleSubscriptionActivated(entity) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.id },
        });
        if (subscription) {
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'active',
                },
            });
            this.logger.log(`Subscription ${subscription.id} activated`);
        }
        return { success: true };
    }
    async handleSubscriptionCharged(entity) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.id },
            include: { plan: true },
        });
        if (subscription) {
            const newPeriodEnd = new Date(subscription.currentPeriodEnd);
            switch (subscription.plan.billingCycle) {
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
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentPeriodStart: subscription.currentPeriodEnd,
                    currentPeriodEnd: newPeriodEnd,
                    nextBillingDate: newPeriodEnd,
                },
            });
            this.logger.log(`Subscription ${subscription.id} charged and renewed`);
        }
        return { success: true };
    }
    async handleSubscriptionCompleted(entity) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.id },
        });
        if (subscription) {
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'expired' },
            });
            this.logger.log(`Subscription ${subscription.id} completed/expired`);
        }
        return { success: true };
    }
    async handleSubscriptionCancelled(entity) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.id },
        });
        if (subscription) {
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'cancelled',
                    cancelledAt: new Date(),
                },
            });
            this.logger.log(`Subscription ${subscription.id} cancelled`);
        }
        return { success: true };
    }
    async handleSubscriptionPending(entity) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.id },
        });
        if (subscription) {
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'paused' },
            });
            this.logger.log(`Subscription ${subscription.id} paused`);
        }
        return { success: true };
    }
};
exports.SubscriptionPaymentsService = SubscriptionPaymentsService;
exports.SubscriptionPaymentsService = SubscriptionPaymentsService = SubscriptionPaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        subscriptions_service_1.SubscriptionsService])
], SubscriptionPaymentsService);
//# sourceMappingURL=subscription-payments.service.js.map