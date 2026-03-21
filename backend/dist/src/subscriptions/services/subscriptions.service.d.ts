import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlanService } from './subscription-plan.service';
export declare class SubscriptionsService {
    private prisma;
    private planService;
    private readonly logger;
    constructor(prisma: PrismaService, planService: SubscriptionPlanService);
    createSubscription(data: {
        userId: string;
        planId: string;
        razorpaySubscriptionId?: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    getSubscriptionById(subscriptionId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    getUserSubscription(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    getUserActiveSubscription(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    cancelSubscription(subscriptionId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    renewSubscription(subscriptionId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    checkExpiredSubscriptions(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }[]>;
    getAllSubscriptions(filter?: {
        status?: string;
        planId?: string;
    }): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            billingCycle: string;
            maxCourses: number;
            maxStudents: number;
            supportLevel: string;
            isActive: boolean;
            razorpayPlanId: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    })[]>;
}
