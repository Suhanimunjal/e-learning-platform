import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../../analytics/services/analytics-tracking.service';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: Razorpay;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private analyticsTracking: AnalyticsTrackingService,
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

  async createOrder(courseId: string, amount: number, user: User) {
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        courseId: courseId,
        amount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    let razorpayOrderId: string;

    if (amount === 0) {
      razorpayOrderId = `free_${order.id}`;
      
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId,
          status: 'COMPLETED',
        },
      });

      await this.prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
        },
      });

      await this.analyticsTracking.trackEvent(user.id, AnalyticsEventType.COURSE_ENROLLED, {
        courseId,
        amount: 0,
      });

      return {
        orderId: order.id,
        razorpayOrderId,
        amount: 0,
        currency: 'INR',
        keyId: this.configService.get('RAZORPAY_KEY_ID'),
        status: 'FREE_ENROLLMENT',
      };
    }

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: order.id,
        notes: {
          courseId,
          userId: user.id,
        },
      });

      razorpayOrderId = razorpayOrder.id;

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId,
        },
      });

      return {
        orderId: order.id,
        razorpayOrderId,
        amount,
        currency: 'INR',
        keyId: this.configService.get('RAZORPAY_KEY_ID'),
      };
    } catch (error) {
      this.logger.error('Razorpay order creation failed:', error);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async handleWebhook(payload: any, signature: string) {
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
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log('Webhook received', { event: payload.event });

    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: payment.id,
        },
      });

      const existingEnrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: order.userId,
          courseId: order.courseId,
        },
      });

      if (!existingEnrollment) {
        await this.prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: order.courseId,
          },
        });
      }

      await this.prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'payment',
          title: 'Payment Successful',
          message: 'You have successfully enrolled in the course.',
        },
      });

      await this.analyticsTracking.trackEvent(order.userId, AnalyticsEventType.PAYMENT_COMPLETED, {
        courseId: order.courseId,
        amount: order.amount,
      });

      return { success: true };
    }

    if (event === 'payment.failed') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'FAILED',
            razorpayPaymentId: payment.id,
          },
        });
      }

      return { success: true };
    }

    return { success: true, message: 'Event not processed' };
  }

  async getOrderStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
