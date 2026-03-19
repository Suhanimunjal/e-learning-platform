import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';
import Razorpay from 'razorpay';

@Injectable()
export class SubscriptionPaymentsService {
  private readonly logger = new Logger(SubscriptionPaymentsService.name);
  private razorpay: Razorpay;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
  ) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required. Please set them in your .env file.');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createSubscriptionOrder(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new BadRequestException('Subscription plan not found');
    }

    if (!plan.razorpayPlanId) {
      throw new BadRequestException('Razorpay plan not configured for this subscription plan');
    }

    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (existingSub) {
      throw new BadRequestException('User already has an active subscription');
    }

    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        customer_notify: 1,
        quantity: 1,
        total_count: 12,
        notes: {
          userId,
          planId,
        },
      });

      const dbSubscription = await this.subscriptionsService.createSubscription({
        userId,
        planId,
        razorpaySubscriptionId: subscription.id,
      });

      return {
        subscriptionId: dbSubscription.id,
        razorpaySubscriptionId: subscription.id,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          billingCycle: plan.billingCycle,
        },
        keyId: this.configService.get('RAZORPAY_KEY_ID'),
        status: subscription.status,
      };
    } catch (error) {
      this.logger.error('Razorpay subscription creation failed:', error);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async handleSubscriptionWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET environment variable is required');
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn('Invalid subscription webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log('Subscription webhook received', { event: payload.event });

    const event = payload.event;

    switch (event) {
      case 'subscription.activated':
        return this.handleSubscriptionActivated(payload.payload.subscription.entity);
      case 'subscription.charged':
        return this.handleSubscriptionCharged(payload.payload.subscription.entity);
      case 'subscription.completed':
        return this.handleSubscriptionCompleted(payload.payload.subscription.entity);
      case 'subscription.cancelled':
        return this.handleSubscriptionCancelled(payload.payload.subscription.entity);
      case 'subscription.pending':
        return this.handleSubscriptionPending(payload.payload.subscription.entity);
      default:
        this.logger.log(`Event ${event} not handled`);
        return { success: true };
    }
  }

  private async handleSubscriptionActivated(entity: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: entity.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
        },
      });

      this.logger.log(`Subscription ${subscription.id} activated`);
    }

    return { success: true };
  }

  private async handleSubscriptionCharged(entity: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: entity.id },
      include: { plan: true },
    });

    if (subscription) {
      const newPeriodEnd = new Date(subscription.currentPeriodEnd);

      switch (subscription.plan.billingCycle) {
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

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: newPeriodEnd,
          nextBillingDate: newPeriodEnd,
        },
      });

      this.logger.log(`Subscription ${subscription.id} charged and renewed`);
    }

    return { success: true };
  }

  private async handleSubscriptionCompleted(entity: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: entity.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });

      this.logger.log(`Subscription ${subscription.id} completed/expired`);
    }

    return { success: true };
  }

  private async handleSubscriptionCancelled(entity: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: entity.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      this.logger.log(`Subscription ${subscription.id} cancelled`);
    }

    return { success: true };
  }

  private async handleSubscriptionPending(entity: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: entity.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'paused' },
      });

      this.logger.log(`Subscription ${subscription.id} paused`);
    }

    return { success: true };
  }
}
