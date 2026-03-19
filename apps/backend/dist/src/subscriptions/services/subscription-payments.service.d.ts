import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionPaymentsService {
    private prisma;
    private configService;
    private subscriptionsService;
    private readonly logger;
    private razorpay;
    constructor(prisma: PrismaService, configService: ConfigService, subscriptionsService: SubscriptionsService);
    createSubscriptionOrder(userId: string, planId: string): Promise<{
        subscriptionId: string;
        razorpaySubscriptionId: string;
        plan: {
            id: string;
            name: string;
            price: number;
            billingCycle: string;
        };
        keyId: any;
        status: "pending" | "completed" | "active" | "created" | "authenticated" | "halted" | "cancelled" | "expired";
    }>;
    handleSubscriptionWebhook(payload: any, signature: string): Promise<{
        success: boolean;
    }>;
    private handleSubscriptionActivated;
    private handleSubscriptionCharged;
    private handleSubscriptionCompleted;
    private handleSubscriptionCancelled;
    private handleSubscriptionPending;
}
