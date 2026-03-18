export declare class CreateSubscriptionPlanDto {
    name: string;
    description?: string;
    price: number;
    billingCycle: string;
    features?: any;
    maxCourses?: number;
    maxStudents?: number;
    supportLevel?: string;
    razorpayPlanId?: string;
}
export declare class UpdateSubscriptionPlanDto {
    name?: string;
    description?: string;
    price?: number;
    features?: any;
    maxCourses?: number;
    maxStudents?: number;
    supportLevel?: string;
    isActive?: boolean;
}
export declare class CreateSubscriptionDto {
    userId: string;
    planId: string;
    razorpaySubscriptionId?: string;
}
