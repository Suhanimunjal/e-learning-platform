"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const health_controller_1 = require("./common/health.controller");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const courses_module_1 = require("./courses/courses.module");
const sections_module_1 = require("./sections/sections.module");
const modules_module_1 = require("./modules/modules.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const ai_module_1 = require("./ai/ai.module");
const payments_module_1 = require("./payments/payments.module");
const organizations_module_1 = require("./organizations/organizations.module");
const plugins_module_1 = require("./plugins/plugins.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const analytics_module_1 = require("./analytics/analytics.module");
const video_generation_module_1 = require("./video-generation/video-generation.module");
const quiz_module_1 = require("./quiz/quiz.module");
const admin_module_1 = require("./admin/admin.module");
const course_enrollment_guard_1 = require("./common/guards/course-enrollment.guard");
const student_module_1 = require("./student/student.module");
const sanitization_middleware_1 = require("./common/middleware/sanitization.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(sanitization_middleware_1.SanitizationMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            courses_module_1.CoursesModule,
            sections_module_1.SectionsModule,
            modules_module_1.ModulesModule,
            enrollments_module_1.EnrollmentsModule,
            ai_module_1.AiModule,
            payments_module_1.PaymentsModule,
            organizations_module_1.OrganizationsModule,
            plugins_module_1.PluginsModule,
            subscriptions_module_1.SubscriptionsModule,
            analytics_module_1.AnalyticsModule,
            video_generation_module_1.VideoGenerationModule,
            quiz_module_1.QuizModule,
            admin_module_1.AdminModule,
            student_module_1.StudentModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [course_enrollment_guard_1.CourseEnrollmentGuard],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map