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
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackCourseViewed(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackCourseEnrolled(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackCourseCompleted(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackModuleViewed(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackModuleTimeSpent(userId: string, courseId: string, moduleId: string, duration: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackQuizStarted(userId: string, courseId: string, quizId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackQuizCompleted(userId: string, courseId: string, quizId: string, score: number, maxScore: number, passingScore?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackAssignmentSubmitted(userId: string, courseId: string, assignmentId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackAssignmentGraded(userId: string, courseId: string, assignmentId: string, grade: number, maxGrade: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackCertificateEarned(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackPaymentCompleted(userId: string, courseId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
    trackSubscriptionCreated(userId: string, planId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        courseId: string | null;
        type: string;
        moduleId: string | null;
    }>;
}
