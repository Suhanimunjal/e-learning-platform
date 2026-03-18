import { PrismaService } from '../../prisma/prisma.service';
export declare enum AnalyticsEventType {
    COURSE_VIEWED = "course.viewed",
    COURSE_ENROLLED = "course.enrolled",
    COURSE_COMPLETED = "course.completed",
    MODULE_VIEWED = "module.viewed",
    MODULE_COMPLETED = "module.completed",
    MODULE_TIME_SPENT = "module.time_spent",
    QUIZ_STARTED = "quiz.started",
    QUIZ_COMPLETED = "quiz.completed",
    QUIZ_PASSED = "quiz.passed",
    QUIZ_FAILED = "quiz.failed",
    ASSIGNMENT_SUBMITTED = "assignment.submitted",
    ASSIGNMENT_GRADED = "assignment.graded",
    DISCUSSION_CREATED = "discussion.created",
    DISCUSSION_REPLIED = "discussion.replied",
    CERTIFICATE_EARNED = "certificate.earned",
    PAYMENT_COMPLETED = "payment.completed",
    SUBSCRIPTION_CREATED = "subscription.created"
}
export declare class AnalyticsTrackingService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    trackEvent(userId: string, eventType: AnalyticsEventType | string, metadata: {
        courseId?: string;
        moduleId?: string;
        quizId?: string;
        assignmentId?: string;
        discussionId?: string;
        duration?: number;
        score?: number;
        maxScore?: number;
        [key: string]: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackCourseViewed(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackCourseEnrolled(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackCourseCompleted(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackModuleViewed(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackModuleTimeSpent(userId: string, courseId: string, moduleId: string, duration: number): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackQuizStarted(userId: string, courseId: string, quizId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackQuizCompleted(userId: string, courseId: string, quizId: string, score: number, maxScore: number): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackAssignmentSubmitted(userId: string, courseId: string, assignmentId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackAssignmentGraded(userId: string, courseId: string, assignmentId: string, grade: number, maxGrade: number): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackCertificateEarned(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackPaymentCompleted(userId: string, courseId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
    trackSubscriptionCreated(userId: string, planId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        courseId: string | null;
        type: string;
        userId: string;
        moduleId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
