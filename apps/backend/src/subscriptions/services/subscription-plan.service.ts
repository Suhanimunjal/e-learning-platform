import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name);

  constructor(private prisma: PrismaService) {}

  async createPlan(data: {
    name: string;
    description?: string;
    price: number;
    billingCycle: string;
    features?: any;
    maxCourses?: number;
    maxStudents?: number;
    supportLevel?: string;
    razorpayPlanId?: string;
  }) {
    try {
      const plan = await this.prisma.subscriptionPlan.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          billingCycle: data.billingCycle,
          features: data.features,
          maxCourses: data.maxCourses || -1,
          maxStudents: data.maxStudents || -1,
          supportLevel: data.supportLevel || 'basic',
          razorpayPlanId: data.razorpayPlanId,
        },
      });
      return plan;
    } catch (error) {
      this.logger.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  async getPlanById(planId: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
  }

  async getAllPlans(onlyActive: boolean = true) {
    return this.prisma.subscriptionPlan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { price: 'asc' },
    });
  }

  async updatePlan(planId: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    features: any;
    maxCourses: number;
    maxStudents: number;
    supportLevel: string;
    isActive: boolean;
  }>) {
    return this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  }

  async deletePlan(planId: string) {
    return this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });
  }
}
