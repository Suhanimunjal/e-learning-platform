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
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== 'APPROVED') {
      throw new ForbiddenException('This course is not available for enrollment yet');
    }

    // Check if already enrolled
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
      if (existingEnrollment.accessStatus === 'REJECTED') {
        // Allow re-enrollment if previously rejected
        const updated = await this.prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { accessStatus: 'APPROVED' },
        });
        return { ...updated, message: 'Successfully enrolled in the course' };
      }
    }

    // Direct enrollment - no approval needed
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        accessStatus: 'APPROVED',
      },
    });

    await this.activityLogService.log({
      action: 'ENROLLMENT_APPROVED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: user.id,
      targetUserId: course.instructorId,
      metadata: { courseTitle: course.title },
    });

    return {
      ...enrollment,
      message: 'Successfully enrolled in the course',
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

  async getCourseStudents(courseId: string, user: User) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

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
            phone: true,
            rollNo: true,
            year: true,
            branch: true,
            course: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeStudentFromCourse(enrollmentId: string, user: User) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (user.role === 'TEACHER' && enrollment.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only remove students from your own courses');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    await this.activityLogService.log({
      action: 'ENROLLMENT_REJECTED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: user.id,
      targetUserId: enrollment.userId,
      metadata: { courseTitle: enrollment.course.title, action: 'removed_by_teacher' },
    });

    return { success: true, message: 'Student removed from course' };
  }
}
