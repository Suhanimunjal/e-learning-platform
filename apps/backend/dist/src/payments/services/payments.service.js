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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const analytics_tracking_service_1 = require("../../analytics/services/analytics-tracking.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, configService, analyticsTracking) {
        this.prisma = prisma;
        this.configService = configService;
        this.analyticsTracking = analyticsTracking;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createOrder(courseId, amount, user) {
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
                amount: amount,
                currency: 'INR',
                status: 'PENDING',
            },
        });
        const mockRazorpayOrderId = `order_mock_${order.id}`;
        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                razorpayOrderId: mockRazorpayOrderId,
            },
        });
        this.analyticsTracking.trackEvent(user.id, analytics_tracking_service_1.AnalyticsEventType.PAYMENT_COMPLETED, {
            courseId: courseId,
            amount: amount,
        }).catch(err => console.error('Analytics tracking error:', err));
        return {
            orderId: order.id,
            razorpayOrderId: mockRazorpayOrderId,
            amount: amount,
            currency: 'INR',
            keyId: this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_demo',
        };
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
        this.logger.log('Webhook received', { payload, signature });
        const event = payload.event;
        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            const orderId = payment.order_id;
            const order = await this.prisma.order.findFirst({
                where: { razorpayOrderId: orderId },
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
            await this.prisma.enrollment.create({
                data: {
                    userId: order.userId,
                    courseId: order.courseId,
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: order.userId,
                    type: 'payment',
                    title: 'Payment Successful',
                    message: `You have successfully enrolled in the course.`,
                },
            });
            return { success: true };
        }
        return { success: true, message: 'Event not processed' };
    }
    async getOrderStatus(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
        });
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