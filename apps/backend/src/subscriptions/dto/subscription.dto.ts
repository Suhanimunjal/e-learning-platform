export class CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: string; // 'monthly', 'quarterly', 'yearly'
  features?: any;
  maxCourses?: number;
  maxStudents?: number;
  supportLevel?: string;
  razorpayPlanId?: string;
}

export class UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: any;
  maxCourses?: number;
  maxStudents?: number;
  supportLevel?: string;
  isActive?: boolean;
}

export class CreateSubscriptionDto {
  userId: string;
  planId: string;
  razorpaySubscriptionId?: string;
}
