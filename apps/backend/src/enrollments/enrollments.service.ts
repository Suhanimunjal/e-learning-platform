import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../analytics/services/analytics-tracking.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private analyticsTracking: AnalyticsTrackingService,
  ) {}

  async enroll(courseId: string, user: User) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
      },
    });

    // Track analytics event
    this.analyticsTracking.trackEvent(user.id, AnalyticsEventType.COURSE_ENROLLED, {
      courseId: courseId,
    }).catch(err => console.error('Analytics tracking error:', err));

    return enrollment;
  }

  async getMyCourses(user: User) {
    return this.prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            sections: {
              include: {
                modules: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseStudents(courseId: string, user: User) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permissions
    if (user.role === 'STUDENT') {
      throw new ForbiddenException('Students cannot view course students');
    }

    if (user.role === 'TEACHER' && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only view students for your own courses');
    }

    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
