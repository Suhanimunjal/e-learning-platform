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
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackCourseViewed(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackCourseEnrolled(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackCourseCompleted(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackModuleViewed(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackModuleTimeSpent(userId: string, courseId: string, moduleId: string, duration: number): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackQuizStarted(userId: string, courseId: string, quizId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackQuizCompleted(userId: string, courseId: string, quizId: string, score: number, maxScore: number, passingScore?: number): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackAssignmentSubmitted(userId: string, courseId: string, assignmentId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackAssignmentGraded(userId: string, courseId: string, assignmentId: string, grade: number, maxGrade: number): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackCertificateEarned(userId: string, courseId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackPaymentCompleted(userId: string, courseId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
    trackSubscriptionCreated(userId: string, planId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        moduleId: string | null;
        courseId: string | null;
        userId: string;
    }>;
}
