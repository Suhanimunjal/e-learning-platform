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
            name: string;
            updatedAt: Date;
            email: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
            organizationId: string | null;
            createdAt: Date;
        };
        plan: {
            id: string;
            name: string;
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    getSubscriptionById(subscriptionId: string): Promise<{
        user: {
            id: string;
            name: string;
            updatedAt: Date;
            email: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
            organizationId: string | null;
            createdAt: Date;
        };
        plan: {
            id: string;
            name: string;
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
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
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
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
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
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
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
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
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    }>;
    checkExpiredSubscriptions(): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
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
            name: string;
            updatedAt: Date;
            email: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
            organizationId: string | null;
            createdAt: Date;
        };
        plan: {
            id: string;
            name: string;
            description: string | null;
            updatedAt: Date;
            createdAt: Date;
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
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        planId: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
        razorpaySubscriptionId: string | null;
    })[]>;
}
