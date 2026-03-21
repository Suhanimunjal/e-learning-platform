import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionPaymentsService } from './services/subscription-payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, CreateSubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly planService: SubscriptionPlanService,
    private readonly paymentService: SubscriptionPaymentsService,
  ) {}

  // ==================== SUBSCRIPTION PLANS ====================

  @Post('plans')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.planService.createPlan(dto);
  }

  @Get('plans')
  async getAllPlans(@Request() req) {
    // Show all active plans for users, all plans for admins
    const onlyActive = req.user.role !== Role.ADMIN && req.user.role !== Role.MANAGER;
    return this.planService.getAllPlans(onlyActive);
  }

  @Get('plans/:planId')
  async getPlan(@Param('planId') planId: string) {
    return this.planService.getPlanById(planId);
  }

  @Patch('plans/:planId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async updatePlan(
    @Param('planId') planId: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.planService.updatePlan(planId, dto);
  }

  @Delete('plans/:planId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async deletePlan(@Param('planId') planId: string) {
    return this.planService.deletePlan(planId);
  }

  // ==================== USER SUBSCRIPTIONS ====================

  @Post()
  @Roles(Role.STUDENT, Role.TEACHER)
  async createSubscription(
    @Request() req,
    @Body() dto: { planId: string },
  ) {
    // User can only create subscription for themselves
    return this.subscriptionsService.createSubscription({
      userId: req.user.id,
      planId: dto.planId,
    });
  }

  @Get('my-subscription')
  @Roles(Role.STUDENT, Role.TEACHER)
  async getMySubscription(@Request() req) {
    return this.subscriptionsService.getUserSubscription(req.user.id);
  }

  @Get('my-active-subscription')
  @Roles(Role.STUDENT, Role.TEACHER)
  async getMyActiveSubscription(@Request() req) {
    return this.subscriptionsService.getUserActiveSubscription(req.user.id);
  }

  @Post(':subscriptionId/cancel')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT, Role.TEACHER)
  async cancelSubscription(
    @Request() req,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    const subscription = await this.subscriptionsService.getSubscriptionById(subscriptionId);
    
    // Users can only cancel their own subscription, admins can cancel any
    if (req.user.role === Role.STUDENT || req.user.role === Role.TEACHER) {
      if (subscription.userId !== req.user.id) {
        throw new Error('Unauthorized');
      }
    }

    return this.subscriptionsService.cancelSubscription(subscriptionId);
  }

  @Post(':subscriptionId/renew')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async renewSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionsService.renewSubscription(subscriptionId);
  }

  @Get(':subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.subscriptionsService.getSubscriptionById(subscriptionId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getAllSubscriptions(@Request() req) {
    return this.subscriptionsService.getAllSubscriptions();
  }

  // ==================== PAYMENTS ====================

  @Post('plans/:planId/checkout')
  @Roles(Role.STUDENT, Role.TEACHER)
  async createSubscriptionCheckout(
    @Request() req,
    @Param('planId') planId: string,
  ) {
    return this.paymentService.createSubscriptionOrder(req.user.id, planId);
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.paymentService.handleSubscriptionWebhook(payload, '');
  }
}
