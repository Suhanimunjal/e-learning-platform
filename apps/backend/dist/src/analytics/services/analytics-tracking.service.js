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
var AnalyticsTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsTrackingService = exports.AnalyticsEventType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
var AnalyticsEventType;
(function (AnalyticsEventType) {
    AnalyticsEventType["COURSE_VIEWED"] = "course.viewed";
    AnalyticsEventType["COURSE_ENROLLED"] = "course.enrolled";
    AnalyticsEventType["COURSE_COMPLETED"] = "course.completed";
    AnalyticsEventType["MODULE_VIEWED"] = "module.viewed";
    AnalyticsEventType["MODULE_COMPLETED"] = "module.completed";
    AnalyticsEventType["MODULE_TIME_SPENT"] = "module.time_spent";
    AnalyticsEventType["QUIZ_STARTED"] = "quiz.started";
    AnalyticsEventType["QUIZ_COMPLETED"] = "quiz.completed";
    AnalyticsEventType["QUIZ_PASSED"] = "quiz.passed";
    AnalyticsEventType["QUIZ_FAILED"] = "quiz.failed";
    AnalyticsEventType["ASSIGNMENT_SUBMITTED"] = "assignment.submitted";
    AnalyticsEventType["ASSIGNMENT_GRADED"] = "assignment.graded";
    AnalyticsEventType["DISCUSSION_CREATED"] = "discussion.created";
    AnalyticsEventType["DISCUSSION_REPLIED"] = "discussion.replied";
    AnalyticsEventType["CERTIFICATE_EARNED"] = "certificate.earned";
    AnalyticsEventType["PAYMENT_COMPLETED"] = "payment.completed";
    AnalyticsEventType["SUBSCRIPTION_CREATED"] = "subscription.created";
})(AnalyticsEventType || (exports.AnalyticsEventType = AnalyticsEventType = {}));
let AnalyticsTrackingService = AnalyticsTrackingService_1 = class AnalyticsTrackingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AnalyticsTrackingService_1.name);
    }
    async trackEvent(userId, eventType, metadata) {
        try {
            const event = await this.prisma.analyticsEvent.create({
                data: {
                    userId,
                    courseId: metadata.courseId,
                    moduleId: metadata.moduleId,
                    type: eventType,
                    metadata,
                },
            });
            this.logger.debug(`Event tracked: ${eventType} for user ${userId}`);
            return event;
        }
        catch (error) {
            this.logger.error(`Error tracking event ${eventType}:`, error);
            throw error;
        }
    }
    async trackCourseViewed(userId, courseId) {
        return this.trackEvent(userId, AnalyticsEventType.COURSE_VIEWED, { courseId });
    }
    async trackCourseEnrolled(userId, courseId) {
        return this.trackEvent(userId, AnalyticsEventType.COURSE_ENROLLED, { courseId });
    }
    async trackCourseCompleted(userId, courseId) {
        return this.trackEvent(userId, AnalyticsEventType.COURSE_COMPLETED, { courseId });
    }
    async trackModuleViewed(userId, courseId, moduleId) {
        return this.trackEvent(userId, AnalyticsEventType.MODULE_VIEWED, {
            courseId,
            moduleId,
        });
    }
    async trackModuleCompleted(userId, courseId, moduleId) {
        return this.trackEvent(userId, AnalyticsEventType.MODULE_COMPLETED, {
            courseId,
            moduleId,
        });
    }
    async trackModuleTimeSpent(userId, courseId, moduleId, duration) {
        return this.trackEvent(userId, AnalyticsEventType.MODULE_TIME_SPENT, {
            courseId,
            moduleId,
            duration,
        });
    }
    async trackQuizStarted(userId, courseId, quizId) {
        return this.trackEvent(userId, AnalyticsEventType.QUIZ_STARTED, {
            courseId,
            quizId,
        });
    }
    async trackQuizCompleted(userId, courseId, quizId, score, maxScore) {
        const passed = score >= maxScore * 0.5;
        return this.trackEvent(userId, AnalyticsEventType.QUIZ_COMPLETED, {
            courseId,
            quizId,
            score,
            maxScore,
            passed,
        });
    }
    async trackAssignmentSubmitted(userId, courseId, assignmentId) {
        return this.trackEvent(userId, AnalyticsEventType.ASSIGNMENT_SUBMITTED, {
            courseId,
            assignmentId,
        });
    }
    async trackAssignmentGraded(userId, courseId, assignmentId, grade, maxGrade) {
        return this.trackEvent(userId, AnalyticsEventType.ASSIGNMENT_GRADED, {
            courseId,
            assignmentId,
            grade,
            maxGrade,
        });
    }
    async trackCertificateEarned(userId, courseId) {
        return this.trackEvent(userId, AnalyticsEventType.CERTIFICATE_EARNED, { courseId });
    }
    async trackPaymentCompleted(userId, courseId, amount) {
        return this.trackEvent(userId, AnalyticsEventType.PAYMENT_COMPLETED, {
            courseId,
            amount,
        });
    }
    async trackSubscriptionCreated(userId, planId, amount) {
        return this.trackEvent(userId, AnalyticsEventType.SUBSCRIPTION_CREATED, {
            planId,
            amount,
        });
    }
};
exports.AnalyticsTrackingService = AnalyticsTrackingService;
exports.AnalyticsTrackingService = AnalyticsTrackingService = AnalyticsTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsTrackingService);
//# sourceMappingURL=analytics-tracking.service.js.map