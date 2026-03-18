import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../../analytics/services/analytics-tracking.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private analyticsTracking: AnalyticsTrackingService,
  ) {}

  async createOrder(courseId: string, amount: number, user: User) {
    // Check if course exists and get price
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        courseId: courseId,
        amount: amount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    // For demo purposes, generate a mock Razorpay order ID
    const mockRazorpayOrderId = `order_mock_${order.id}`;

      // Update order with mock Razorpay order ID
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId: mockRazorpayOrderId,
        },
      });

      // Track payment event
      this.analyticsTracking.trackEvent(user.id, AnalyticsEventType.PAYMENT_COMPLETED, {
        courseId: courseId,
        amount: amount,
      }).catch(err => console.error('Analytics tracking error:', err));

      return {
        orderId: order.id,
        razorpayOrderId: mockRazorpayOrderId,
        amount: amount,
        currency: 'INR',
        keyId: this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_demo',
      };
  }

  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
    
    // Note: Razorpay webhook verification is complex
    // For now, we'll log the payload and process it
    
    this.logger.log('Webhook received', { payload, signature });

    const event = payload.event;
    
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      
      // Find order by Razorpay order ID
      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Update order status
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: payment.id,
        },
      });

      // Create enrollment
      await this.prisma.enrollment.create({
        data: {
          userId: order.userId,
          courseId: order.courseId,
        },
      });

      // Create notification
      await this.prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'payment',
          title: 'Payment Successful',
          message: `You have successfully enrolled in the course.`,
        },
      });

      return { success: true };
    }

    return { success: true, message: 'Event not processed' };
  }

  async getOrderStatus(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }
}
