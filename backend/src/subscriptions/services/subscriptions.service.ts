import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlanService } from './subscription-plan.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private planService: SubscriptionPlanService,
  ) {}

  async createSubscription(data: {
    userId: string;
    planId: string;
    razorpaySubscriptionId?: string;
  }) {
    try {
      // Verify plan exists
      const plan = await this.planService.getPlanById(data.planId);
      if (!plan) {
        throw new BadRequestException('Subscription plan not found');
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: data.userId,
          status: 'active',
        },
      });

      if (existingSubscription) {
        throw new BadRequestException('User already has an active subscription');
      }

      // Calculate billing period
      const currentDate = new Date();
      let nextBillingDate = new Date(currentDate);
      
      switch (plan.billingCycle) {
        case 'monthly':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case 'yearly':
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      const subscription = await this.prisma.subscription.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          status: 'active',
          currentPeriodStart: currentDate,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate: nextBillingDate,
          razorpaySubscriptionId: data.razorpaySubscriptionId,
        },
        include: {
          plan: true,
          user: true,
        },
      });

      return subscription;
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getSubscriptionById(subscriptionId: string) {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        user: true,
      },
    });
  }

  async getUserSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserActiveSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: {
        plan: true,
      },
    });
  }

  async renewSubscription(subscriptionId: string) {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const plan = subscription.plan;
    const newPeriodEnd = new Date(subscription.currentPeriodEnd);

    switch (plan.billingCycle) {
      case 'monthly':
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
        break;
      case 'quarterly':
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 3);
        break;
      case 'yearly':
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
        break;
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
      },
      include: {
        plan: true,
      },
    });
  }

  async checkExpiredSubscriptions() {
    const now = new Date();
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: now,
        },
      },
    });

    for (const sub of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'expired' },
      });
    }

    this.logger.log(`Marked ${expiredSubscriptions.length} subscriptions as expired`);
    return expiredSubscriptions;
  }

  async getAllSubscriptions(filter?: { status?: string; planId?: string }) {
    return this.prisma.subscription.findMany({
      where: filter,
      include: {
        plan: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
