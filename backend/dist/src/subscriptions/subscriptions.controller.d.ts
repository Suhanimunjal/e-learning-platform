import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionPaymentsService } from './services/subscription-payments.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly planService;
    private readonly paymentService;
    constructor(subscriptionsService: SubscriptionsService, planService: SubscriptionPlanService, paymentService: SubscriptionPaymentsService);
    createPlan(dto: CreateSubscriptionPlanDto): Promise<{
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
    }>;
    getAllPlans(req: any): Promise<{
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
    }[]>;
    getPlan(planId: string): Promise<{
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
    }>;
    updatePlan(planId: string, dto: UpdateSubscriptionPlanDto): Promise<{
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
    }>;
    deletePlan(planId: string): Promise<{
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
    }>;
    createSubscription(req: any, dto: {
        planId: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            rejectionReason: string | null;
            phone: string | null;
            rollNo: string | null;
            year: string | null;
            branch: string | null;
            course: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
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
    getMySubscription(req: any): Promise<{
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
    getMyActiveSubscription(req: any): Promise<{
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
    cancelSubscription(req: any, subscriptionId: string): Promise<{
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
    getSubscription(subscriptionId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            rejectionReason: string | null;
            phone: string | null;
            rollNo: string | null;
            year: string | null;
            branch: string | null;
            course: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
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
    getAllSubscriptions(req: any): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            avatar: string | null;
            rejectionReason: string | null;
            phone: string | null;
            rollNo: string | null;
            year: string | null;
            branch: string | null;
            course: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
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
    createSubscriptionCheckout(req: any, planId: string): Promise<{
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
    handleWebhook(payload: any): Promise<{
        success: boolean;
    }>;
}
