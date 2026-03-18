import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionPaymentsService } from './services/subscription-payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionPlanService, SubscriptionPaymentsService, PrismaService],
  exports: [SubscriptionsService, SubscriptionPlanService],
})
export class SubscriptionsModule {}
