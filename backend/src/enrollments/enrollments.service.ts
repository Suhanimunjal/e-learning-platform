import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../analytics/services/analytics-tracking.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private analyticsTracking: AnalyticsTrackingService,
    private activityLogService: ActivityLogService,
  ) {}

  async enroll(courseId: string, user: User) {
    // Check if course exists and is approved
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is approved
    if (course.status !== 'APPROVED') {
      throw new ForbiddenException('This course is not available for enrollment yet');
    }

    // Check if already enrolled (approved or pending)
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.accessStatus === 'APPROVED') {
        throw new ConflictException('You are already enrolled in this course');
      }
      if (existingEnrollment.accessStatus === 'PENDING') {
        throw new ConflictException('Your enrollment request is pending approval');
      }
      // If rejected, allow re-application
    }

    // Create enrollment with PENDING status - requires teacher approval
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        accessStatus: 'PENDING',
      },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'ENROLLMENT_REQUESTED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: user.id,
      targetUserId: course.instructorId,
      metadata: { courseTitle: course.title },
    });

    return {
      ...enrollment,
      message: 'Enrollment request submitted. Waiting for teacher approval.',
    };
  }

  async getMyCourses(user: User) {
    return this.prisma.enrollment.findMany({
      where: { 
        userId: user.id,
        accessStatus: 'APPROVED',
      },
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

  async getPendingEnrollments(userId: string) {
    // Get pending enrollments for courses owned by this teacher
    const courses = await this.prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    });

    const courseIds = courses.map(c => c.id);

    return this.prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        accessStatus: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveEnrollment(enrollmentId: string, teacherId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.course.instructorId !== teacherId) {
      throw new ForbiddenException('You can only approve enrollments for your own courses');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { accessStatus: 'APPROVED' },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'ENROLLMENT_APPROVED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: teacherId,
      targetUserId: enrollment.userId,
      metadata: { courseTitle: enrollment.course.title },
    });

    return updated;
  }

  async rejectEnrollment(enrollmentId: string, teacherId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.course.instructorId !== teacherId) {
      throw new ForbiddenException('You can only reject enrollments for your own courses');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { accessStatus: 'REJECTED' },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'ENROLLMENT_REJECTED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: teacherId,
      targetUserId: enrollment.userId,
      metadata: { courseTitle: enrollment.course.title },
    });

    return updated;
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
      where: { 
        courseId,
        accessStatus: 'APPROVED',
      },
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
