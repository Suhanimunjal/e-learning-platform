"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const analytics_tracking_service_1 = require("./services/analytics-tracking.service");
const analytics_reporting_service_1 = require("./services/analytics-reporting.service");
const analytics_controller_1 = require("./analytics.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [analytics_tracking_service_1.AnalyticsTrackingService, analytics_reporting_service_1.AnalyticsReportingService],
        controllers: [analytics_controller_1.AnalyticsController],
        exports: [analytics_tracking_service_1.AnalyticsTrackingService, analytics_reporting_service_1.AnalyticsReportingService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map