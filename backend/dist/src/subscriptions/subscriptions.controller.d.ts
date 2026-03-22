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
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        price: number;
        features: import("@prisma/client/runtime/client").JsonValue | null;
        billingCycle: string;
        maxCourses: number;
        maxStudents: number;
        supportLevel: string;
        razorpayPlanId: string | null;
        isActive: boolean;
    }>;
    getAllPlans(req: any): Promise<{
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
        razorpayPlanId: string | null;
        isActive: boolean;
    }[]>;
    getPlan(planId: string): Promise<{
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
        razorpayPlanId: string | null;
        isActive: boolean;
    }>;
    updatePlan(planId: string, dto: UpdateSubscriptionPlanDto): Promise<{
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
        razorpayPlanId: string | null;
        isActive: boolean;
    }>;
    deletePlan(planId: string): Promise<{
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
        razorpayPlanId: string | null;
        isActive: boolean;
    }>;
    createSubscription(req: any, dto: {
        planId: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            updatedAt: Date;
            createdAt: Date;
            email: string;
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
            organizationId: string | null;
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
    }>;
    getMySubscription(req: any): Promise<{
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
    }>;
    getMyActiveSubscription(req: any): Promise<{
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
    }>;
    cancelSubscription(req: any, subscriptionId: string): Promise<{
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
    }>;
    getSubscription(subscriptionId: string): Promise<{
        user: {
            id: string;
            name: string;
            updatedAt: Date;
            createdAt: Date;
            email: string;
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
            organizationId: string | null;
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
    }>;
    getAllSubscriptions(req: any): Promise<({
        user: {
            id: string;
            name: string;
            updatedAt: Date;
            createdAt: Date;
            email: string;
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
            organizationId: string | null;
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
            razorpayPlanId: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        userId: string;
        planId: string;
        razorpaySubscriptionId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        nextBillingDate: Date | null;
        cancelledAt: Date | null;
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
