import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum AnalyticsEventType {
  // Course events
  COURSE_VIEWED = 'course.viewed',
  COURSE_ENROLLED = 'course.enrolled',
  COURSE_COMPLETED = 'course.completed',
  
  // Module events
  MODULE_VIEWED = 'module.viewed',
  MODULE_COMPLETED = 'module.completed',
  MODULE_TIME_SPENT = 'module.time_spent',
  
  // Quiz events
  QUIZ_STARTED = 'quiz.started',
  QUIZ_COMPLETED = 'quiz.completed',
  QUIZ_PASSED = 'quiz.passed',
  QUIZ_FAILED = 'quiz.failed',
  
  // Assignment events
  ASSIGNMENT_SUBMITTED = 'assignment.submitted',
  ASSIGNMENT_GRADED = 'assignment.graded',
  
  // Discussion events
  DISCUSSION_CREATED = 'discussion.created',
  DISCUSSION_REPLIED = 'discussion.replied',
  
  // Certificate events
  CERTIFICATE_EARNED = 'certificate.earned',
  
  // Payment events
  PAYMENT_COMPLETED = 'payment.completed',
  SUBSCRIPTION_CREATED = 'subscription.created',
}

@Injectable()
export class AnalyticsTrackingService {
  private readonly logger = new Logger(AnalyticsTrackingService.name);

  constructor(private prisma: PrismaService) {}

  async trackEvent(
    userId: string,
    eventType: AnalyticsEventType | string,
    metadata: {
      courseId?: string;
      moduleId?: string;
      quizId?: string;
      assignmentId?: string;
      discussionId?: string;
      duration?: number;
      score?: number;
      maxScore?: number;
      [key: string]: any;
    },
  ) {
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
    } catch (error) {
      this.logger.error(`Error tracking event ${eventType}:`, error);
      throw error;
    }
  }

  async trackCourseViewed(userId: string, courseId: string) {
    return this.trackEvent(userId, AnalyticsEventType.COURSE_VIEWED, { courseId });
  }

  async trackCourseEnrolled(userId: string, courseId: string) {
    return this.trackEvent(userId, AnalyticsEventType.COURSE_ENROLLED, { courseId });
  }

  async trackCourseCompleted(userId: string, courseId: string) {
    return this.trackEvent(userId, AnalyticsEventType.COURSE_COMPLETED, { courseId });
  }

  async trackModuleViewed(userId: string, courseId: string, moduleId: string) {
    return this.trackEvent(userId, AnalyticsEventType.MODULE_VIEWED, {
      courseId,
      moduleId,
    });
  }

  async trackModuleCompleted(userId: string, courseId: string, moduleId: string) {
    return this.trackEvent(userId, AnalyticsEventType.MODULE_COMPLETED, {
      courseId,
      moduleId,
    });
  }

  async trackModuleTimeSpent(
    userId: string,
    courseId: string,
    moduleId: string,
    duration: number,
  ) {
    return this.trackEvent(userId, AnalyticsEventType.MODULE_TIME_SPENT, {
      courseId,
      moduleId,
      duration, // in seconds
    });
  }

  async trackQuizStarted(userId: string, courseId: string, quizId: string) {
    return this.trackEvent(userId, AnalyticsEventType.QUIZ_STARTED, {
      courseId,
      quizId,
    });
  }

  async trackQuizCompleted(
    userId: string,
    courseId: string,
    quizId: string,
    score: number,
    maxScore: number,
    passingScore: number = 50,
  ) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = score >= (maxScore * passingScore / 100);
    return this.trackEvent(userId, AnalyticsEventType.QUIZ_COMPLETED, {
      courseId,
      quizId,
      score,
      maxScore,
      passingScore,
      passed,
    });
  }

  async trackAssignmentSubmitted(userId: string, courseId: string, assignmentId: string) {
    return this.trackEvent(userId, AnalyticsEventType.ASSIGNMENT_SUBMITTED, {
      courseId,
      assignmentId,
    });
  }

  async trackAssignmentGraded(
    userId: string,
    courseId: string,
    assignmentId: string,
    grade: number,
    maxGrade: number,
  ) {
    return this.trackEvent(userId, AnalyticsEventType.ASSIGNMENT_GRADED, {
      courseId,
      assignmentId,
      grade,
      maxGrade,
    });
  }

  async trackCertificateEarned(userId: string, courseId: string) {
    return this.trackEvent(userId, AnalyticsEventType.CERTIFICATE_EARNED, { courseId });
  }

  async trackPaymentCompleted(userId: string, courseId: string, amount: number) {
    return this.trackEvent(userId, AnalyticsEventType.PAYMENT_COMPLETED, {
      courseId,
      amount,
    });
  }

  async trackSubscriptionCreated(userId: string, planId: string, amount: number) {
    return this.trackEvent(userId, AnalyticsEventType.SUBSCRIPTION_CREATED, {
      planId,
      amount,
    });
  }
}
