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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_tracking_service_1 = require("./services/analytics-tracking.service");
const analytics_reporting_service_1 = require("./services/analytics-reporting.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    constructor(trackingService, reportingService) {
        this.trackingService = trackingService;
        this.reportingService = reportingService;
    }
    async getMyAnalytics(req) {
        return this.reportingService.getUserAnalytics(req.user.id);
    }
    async getCourseAnalytics(courseId, req) {
        if (req.user.role === client_1.Role.TEACHER) {
            const course = await this.reportingService.getCourseAnalytics(courseId);
        }
        return this.reportingService.getCourseAnalytics(courseId);
    }
    async getCourseStudentsProgress(courseId) {
        return this.reportingService.getCourseStudentsProgress(courseId);
    }
    async getStudentProgress(courseId, studentId) {
        return this.reportingService.getStudentProgress(courseId, studentId);
    }
    async getPlatformAnalytics(startDate, endDate) {
        return this.reportingService.getPlatformAnalytics(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getTopCourses(limit) {
        const limitNum = limit ? parseInt(limit) : 5;
        return this.reportingService.getTopCourses(limitNum);
    }
    async getEngagementMetrics(startDate, endDate) {
        return this.reportingService.getEngagementMetrics(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('my-analytics'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMyAnalytics", null);
__decorate([
    (0, common_1.Get)('courses/:courseId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCourseAnalytics", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/students'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCourseStudentsProgress", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/students/:studentId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStudentProgress", null);
__decorate([
    (0, common_1.Get)('platform'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPlatformAnalytics", null);
__decorate([
    (0, common_1.Get)('platform/top-courses'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopCourses", null);
__decorate([
    (0, common_1.Get)('platform/engagement'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getEngagementMetrics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_tracking_service_1.AnalyticsTrackingService,
        analytics_reporting_service_1.AnalyticsReportingService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map