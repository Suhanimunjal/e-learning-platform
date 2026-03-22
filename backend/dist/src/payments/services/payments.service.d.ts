import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService } from '../../analytics/services/analytics-tracking.service';
export declare class PaymentsService {
    private prisma;
    private configService;
    private analyticsTracking;
    private readonly logger;
    private razorpay;
    constructor(prisma: PrismaService, configService: ConfigService, analyticsTracking: AnalyticsTrackingService);
    createOrder(courseId: string, amount: number, user: User): Promise<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: any;
        status: string;
    } | {
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: any;
        status?: undefined;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    getOrderStatus(orderId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        amount: number;
        currency: string;
        razorpayOrderId: string | null;
        razorpayPaymentId: string | null;
        paymentMethod: string | null;
    }>;
}
