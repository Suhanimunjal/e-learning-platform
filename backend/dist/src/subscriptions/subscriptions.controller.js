"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./services/subscriptions.service");
const subscription_plan_service_1 = require("./services/subscription-plan.service");
const subscription_payments_service_1 = require("./services/subscription-payments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const subscription_dto_1 = require("./dto/subscription.dto");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService, planService, paymentService) {
        this.subscriptionsService = subscriptionsService;
        this.planService = planService;
        this.paymentService = paymentService;
    }
    async createPlan(dto) {
        return this.planService.createPlan(dto);
    }
    async getAllPlans(req) {
        const onlyActive = req.user.role !== client_1.Role.ADMIN && req.user.role !== client_1.Role.MANAGER;
        return this.planService.getAllPlans(onlyActive);
    }
    async getPlan(planId) {
        return this.planService.getPlanById(planId);
    }
    async updatePlan(planId, dto) {
        return this.planService.updatePlan(planId, dto);
    }
    async deletePlan(planId) {
        return this.planService.deletePlan(planId);
    }
    async createSubscription(req, dto) {
        return this.subscriptionsService.createSubscription({
            userId: req.user.id,
            planId: dto.planId,
        });
    }
    async getMySubscription(req) {
        return this.subscriptionsService.getUserSubscription(req.user.id);
    }
    async getMyActiveSubscription(req) {
        return this.subscriptionsService.getUserActiveSubscription(req.user.id);
    }
    async cancelSubscription(req, subscriptionId) {
        const subscription = await this.subscriptionsService.getSubscriptionById(subscriptionId);
        if (req.user.role === client_1.Role.STUDENT || req.user.role === client_1.Role.TEACHER) {
            if (subscription.userId !== req.user.id) {
                throw new Error('Unauthorized');
            }
        }
        return this.subscriptionsService.cancelSubscription(subscriptionId);
    }
    async renewSubscription(subscriptionId) {
        return this.subscriptionsService.renewSubscription(subscriptionId);
    }
    async getSubscription(subscriptionId) {
        return this.subscriptionsService.getSubscriptionById(subscriptionId);
    }
    async getAllSubscriptions(req) {
        return this.subscriptionsService.getAllSubscriptions();
    }
    async createSubscriptionCheckout(req, planId) {
        return this.paymentService.createSubscriptionOrder(req.user.id, planId);
    }
    async handleWebhook(payload) {
        return this.paymentService.handleSubscriptionWebhook(payload, '');
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Post)('plans'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.CreateSubscriptionPlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getAllPlans", null);
__decorate([
    (0, common_1.Get)('plans/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:planId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscription_dto_1.UpdateSubscriptionPlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('plans/:planId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)('my-subscription'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.Get)('my-active-subscription'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getMyActiveSubscription", null);
__decorate([
    (0, common_1.Post)(':subscriptionId/cancel'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)(':subscriptionId/renew'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "renewSubscription", null);
__decorate([
    (0, common_1.Get)(':subscriptionId'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getAllSubscriptions", null);
__decorate([
    (0, common_1.Post)('plans/:planId/checkout'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSubscriptionCheckout", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "handleWebhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        subscription_plan_service_1.SubscriptionPlanService,
        subscription_payments_service_1.SubscriptionPaymentsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map