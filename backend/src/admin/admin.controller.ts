import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
  ) {}

  // Activity Logs
  @Get('logs')
  async getActivityLogs(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.activityLogService.getRecentLogs(Number(limit) || 50, Number(offset) || 0);
  }

  // Teacher Registration by Admin (direct creation, no OTP)
  @Post('teachers/register')
  async registerTeacher(@Body() body: { name: string; email: string; password: string }, @Request() req) {
    const { name, email, password } = body;

    // Check if user exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Create teacher directly (no OTP verification needed)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.TEACHER,
        status: UserStatus.ACTIVE,
      },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'TEACHER_CREATED',
      entityType: 'USER',
      entityId: teacher.id,
      userId: req.user.id,
      targetUserId: teacher.id,
      metadata: { email: teacher.email, name: teacher.name },
    });

    return {
      success: true,
      message: 'Teacher account created successfully',
      teacher: { id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role },
    };
  }

  // User Management - Pending Student approvals only
  @Get('users/pending')
  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: { 
        status: UserStatus.PENDING_APPROVAL,
        role: Role.STUDENT, // Only students need admin approval
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('users/:userId/approve')
  async approveUser(@Param('userId') userId: string, @Request() req) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
      select: { id: true, email: true, name: true, status: true },
    });

    // Send approval email
    await this.emailService.sendTeacherApproved(user.email, user.name);

    // Log activity
    await this.activityLogService.log({
      action: 'USER_APPROVED',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      targetUserId: user.id,
      metadata: { email: user.email, name: user.name },
    });

    return { success: true, user };
  }

  @Post('users/:userId/reject')
  async rejectUser(
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.REJECTED, rejectionReason: body.reason },
      select: { id: true, email: true, name: true, status: true, rejectionReason: true },
    });

    // Send rejection email
    await this.emailService.sendTeacherRejected(user.email, user.name, body.reason);

    // Log activity
    await this.activityLogService.log({
      action: 'USER_REJECTED',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      targetUserId: user.id,
      metadata: { email: user.email, name: user.name, reason: body.reason },
    });

    return { success: true, user };
  }

  // Course Approvals
  @Get('courses/pending')
  async getPendingCourses() {
    return this.prisma.course.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { sections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('courses/:courseId/approve')
  async approveCourse(@Param('courseId') courseId: string, @Request() req) {
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'APPROVED', approvedBy: req.user.id },
      select: { id: true, title: true, status: true, instructorId: true },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'COURSE_APPROVED',
      entityType: 'COURSE',
      entityId: course.id,
      userId: req.user.id,
      targetUserId: course.instructorId,
      metadata: { title: course.title },
    });

    return { success: true, course };
  }

  @Post('courses/:courseId/reject')
  async rejectCourse(
    @Param('courseId') courseId: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'REJECTED', rejectionReason: body.reason },
      select: { id: true, title: true, status: true, rejectionReason: true, instructorId: true },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'COURSE_REJECTED',
      entityType: 'COURSE',
      entityId: course.id,
      userId: req.user.id,
      targetUserId: course.instructorId,
      metadata: { title: course.title, reason: body.reason },
    });

    return { success: true, course };
  }

  // Enrollment Approvals (for teachers to approve student enrollments)
  @Get('enrollments/pending')
  async getPendingEnrollments() {
    return this.prisma.enrollment.findMany({
      where: { accessStatus: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, instructorId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('enrollments/:enrollmentId/approve')
  async approveEnrollment(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    const enrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { accessStatus: 'APPROVED' },
    });

    // Get user and course for email and logging
    const user = await this.prisma.user.findUnique({ where: { id: enrollment.userId } });
    const course = await this.prisma.course.findUnique({ where: { id: enrollment.courseId } });
    
    if (user && course) {
      await this.emailService.sendEnrollmentApproved(user.email, user.name, course.title);
    }

    // Log activity
    await this.activityLogService.log({
      action: 'ENROLLMENT_APPROVED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: req.user.id,
      targetUserId: enrollment.userId,
      metadata: { courseTitle: course?.title },
    });

    return { success: true, enrollment };
  }

  @Post('enrollments/:enrollmentId/reject')
  async rejectEnrollment(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    const enrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { accessStatus: 'REJECTED' },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'ENROLLMENT_REJECTED',
      entityType: 'ENROLLMENT',
      entityId: enrollment.id,
      userId: req.user.id,
      targetUserId: enrollment.userId,
      metadata: {},
    });

    return { success: true, enrollment };
  }

  // Get all teachers
  @Get('teachers')
  async getTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Statistics
  @Get('stats')
  async getStats() {
    const [pendingStudents, pendingEnrollments, totalUsers, totalTeachers, totalStudents, totalCourses] = await Promise.all([
      this.prisma.user.count({ where: { status: UserStatus.PENDING_APPROVAL, role: Role.STUDENT } }),
      this.prisma.enrollment.count({ where: { accessStatus: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.course.count(),
    ]);

    return {
      pendingStudents,
      pendingEnrollments,
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
    };
  }
}
