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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const analytics_tracking_service_1 = require("../../analytics/services/analytics-tracking.service");
const razorpay_1 = __importDefault(require("razorpay"));
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, configService, analyticsTracking) {
        this.prisma = prisma;
        this.configService = configService;
        this.analyticsTracking = analyticsTracking;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (!keyId || !keySecret) {
            throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required. Please set them in your .env file.');
        }
        this.razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    async createOrder(courseId, amount, user) {
        if (amount < 0) {
            throw new common_1.BadRequestException('Amount cannot be negative');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId: user.id,
                courseId: courseId,
            },
        });
        if (existingEnrollment) {
            throw new common_1.BadRequestException('You are already enrolled in this course');
        }
        const order = await this.prisma.order.create({
            data: {
                userId: user.id,
                courseId: courseId,
                amount,
                currency: 'INR',
                status: 'PENDING',
            },
        });
        let razorpayOrderId;
        if (amount === 0) {
            razorpayOrderId = `free_${order.id}`;
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    razorpayOrderId,
                    status: 'COMPLETED',
                },
            });
            await this.prisma.enrollment.create({
                data: {
                    userId: user.id,
                    courseId: courseId,
                },
            });
            await this.analyticsTracking.trackEvent(user.id, analytics_tracking_service_1.AnalyticsEventType.COURSE_ENROLLED, {
                courseId,
                amount: 0,
            });
            return {
                orderId: order.id,
                razorpayOrderId,
                amount: 0,
                currency: 'INR',
                keyId: this.configService.get('RAZORPAY_KEY_ID'),
                status: 'FREE_ENROLLMENT',
            };
        }
        try {
            const razorpayOrder = await this.razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: order.id,
                notes: {
                    courseId,
                    userId: user.id,
                },
            });
            razorpayOrderId = razorpayOrder.id;
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    razorpayOrderId,
                },
            });
            return {
                orderId: order.id,
                razorpayOrderId,
                amount,
                currency: 'INR',
                keyId: this.configService.get('RAZORPAY_KEY_ID'),
            };
        }
        catch (error) {
            this.logger.error('Razorpay order creation failed:', error);
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: 'FAILED' },
            });
            throw new common_1.BadRequestException('Failed to create payment order');
        }
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('RAZORPAY_WEBHOOK_SECRET environment variable is required');
        }
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (signature !== expectedSignature) {
            this.logger.warn('Invalid webhook signature');
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        this.logger.log('Webhook received', { event: payload.event });
        const event = payload.event;
        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const order = await this.prisma.order.findFirst({
                where: { razorpayOrderId },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'COMPLETED',
                    razorpayPaymentId: payment.id,
                },
            });
            const existingEnrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: order.userId,
                    courseId: order.courseId,
                },
            });
            if (!existingEnrollment) {
                await this.prisma.enrollment.create({
                    data: {
                        userId: order.userId,
                        courseId: order.courseId,
                    },
                });
            }
            await this.prisma.notification.create({
                data: {
                    userId: order.userId,
                    type: 'payment',
                    title: 'Payment Successful',
                    message: 'You have successfully enrolled in the course.',
                },
            });
            await this.analyticsTracking.trackEvent(order.userId, analytics_tracking_service_1.AnalyticsEventType.PAYMENT_COMPLETED, {
                courseId: order.courseId,
                amount: order.amount,
            });
            return { success: true };
        }
        if (event === 'payment.failed') {
            const payment = payload.payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const order = await this.prisma.order.findFirst({
                where: { razorpayOrderId },
            });
            if (order) {
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'FAILED',
                        razorpayPaymentId: payment.id,
                    },
                });
            }
            return { success: true };
        }
        return { success: true, message: 'Event not processed' };
    }
    async getOrderStatus(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        analytics_tracking_service_1.AnalyticsTrackingService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map