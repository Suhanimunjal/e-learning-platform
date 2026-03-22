import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, NotFoundException, Delete, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, UserStatus, CourseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { EmailService } from '../common/services/email.service';
import { ActivityLogService } from '../common/services/activity-log.service';
import { GenerateAiCourseDto } from './dto/generate-ai-course.dto';
import { AdminCourseGenerationService } from './services/admin-course-generation.service';
import {
  RegisterTeacherBodyDto,
  RejectUserBodyDto,
  BlacklistUserBodyDto,
  RejectCourseBodyDto,
  BlacklistCourseBodyDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private emailService: EmailService,
    private activityLogService: ActivityLogService,
    private adminCourseGenerationService: AdminCourseGenerationService,
  ) {}

  private async notify(userId: string, type: string, title: string, message: string) {
    await this.prisma.notification.create({ data: { userId, type, title, message } });
  }

  @Post('courses/generate-ai')
  async generateAiCourse(@Body() body: GenerateAiCourseDto, @Request() req) {
    return this.adminCourseGenerationService.startGeneration(body, req.user.id);
  }

  @Get('courses/generation-jobs/:jobId')
  async getGenerationJob(@Param('jobId') jobId: string) {
    return this.adminCourseGenerationService.getJob(jobId);
  }

  // Activity Logs with filters
  @Get('logs')
  async getActivityLogs(
    @Query('limit') limit?: string, 
    @Query('offset') offset?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.activityLogService.getFilteredLogs(
      Number(limit) || 50, 
      Number(offset) || 0,
      filters
    );
  }

  // Get new logs since timestamp (for auto-refresh/polling)
  @Get('logs/new')
  async getNewLogs(@Query('since') since?: string, @Query('limit') limit?: string) {
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 10000);
    return this.activityLogService.getNewLogsSince(sinceDate, Number(limit) || 100);
  }

  @Get('logs/types')
  async getLogTypes() {
    return this.activityLogService.getLogTypes();
  }

  // Teacher Registration by Admin (creates in PENDING status)
  @Post('teachers/register')
  async registerTeacher(@Body() body: RegisterTeacherBodyDto, @Request() req) {
    const { name, email, password } = body;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'User with this email already exists' };
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.TEACHER,
        status: UserStatus.PENDING_APPROVAL,
      },
    });

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
      message: 'Teacher account created successfully. Awaiting approval.',
      teacher: { id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role, status: teacher.status },
    };
  }

  // User Management - Pending Teacher approvals
  @Get('users/pending')
  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: { 
        status: UserStatus.PENDING_APPROVAL,
        role: Role.TEACHER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
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

    await this.emailService.sendTeacherApproved(user.email, user.name);
    await this.notify(user.id, 'account', 'Account Approved', 'Your account has been approved. You can now access all features.');

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
    @Body() body: RejectUserBodyDto,
    @Request() req,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.REJECTED, rejectionReason: body.reason },
      select: { id: true, email: true, name: true, status: true, rejectionReason: true },
    });

    await this.emailService.sendTeacherRejected(user.email, user.name, body.reason);
    await this.notify(user.id, 'account', 'Account Rejected', body.reason || 'Your account application has been rejected by the administrator.');

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

    await this.notify(course.instructorId, 'course', 'Course Approved', `Your course "${course.title}" has been approved and is now visible to students.`);

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
    @Body() body: RejectCourseBodyDto,
    @Request() req,
  ) {
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'REJECTED', rejectionReason: body.reason },
      select: { id: true, title: true, status: true, rejectionReason: true, instructorId: true },
    });

    await this.notify(course.instructorId, 'course', 'Course Rejected', `Your course "${course.title}" has been rejected. ${body.reason || ''}`);

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

    const user = await this.prisma.user.findUnique({ where: { id: enrollment.userId } });
    const course = await this.prisma.course.findUnique({ where: { id: enrollment.courseId } });
    
    if (user && course) {
      await this.emailService.sendEnrollmentApproved(user.email, user.name, course.title);
      await this.notify(user.id, 'enrollment', 'Enrollment Approved', `Your enrollment in "${course.title}" has been approved. You can now access the course.`);
    }

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

  // =====================
  // TEACHERS - full list with all profile fields
  // =====================
  @Get('teachers')
  async getTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        organization: { select: { id: true, name: true } },
        _count: { select: { coursesCreated: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('teachers/:teacherId')
  async getTeacherById(@Param('teacherId') teacherId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id: teacherId,
        role: Role.TEACHER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        rejectionReason: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        coursesCreated: {
          select: {
            id: true,
            title: true,
            status: true,
            price: true,
            createdAt: true,
            _count: { select: { sections: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  // =====================
  // STUDENTS - full list with all profile fields
  // =====================
  @Get('students')
  async getStudents(@Query('status') status?: UserStatus) {
    const whereClause: any = { role: Role.STUDENT };
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        rollNo: true,
        year: true,
        branch: true,
        course: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        organization: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('students/:studentId')
  async getStudentById(@Param('studentId') studentId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        rollNo: true,
        year: true,
        branch: true,
        course: true,
        role: true,
        status: true,
        rejectionReason: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            accessStatus: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
                status: true,
                price: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  // =====================
  // CLEANUP: Delete rejected student applications
  // =====================
  @Delete('students/cleanup-rejected')
  async cleanupRejectedStudents(@Request() req) {
    // First get the count and details for logging
    const rejectedStudents = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        status: UserStatus.REJECTED,
      },
      select: { id: true, email: true, name: true },
    });

    if (rejectedStudents.length === 0) {
      return { success: true, deleted: 0, message: 'No rejected students to clean up' };
    }

    // Delete related enrollments first
    const studentIds = rejectedStudents.map(s => s.id);
    await this.prisma.enrollment.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Delete related progress records
    await this.prisma.progress.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Delete related quiz attempts
    await this.prisma.quizAttempt.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Delete related submissions
    await this.prisma.submission.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Delete related analytics events
    await this.prisma.analyticsEvent.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Delete related notifications
    await this.prisma.notification.deleteMany({
      where: { userId: { in: studentIds } },
    });

    // Now delete the users
    const result = await this.prisma.user.deleteMany({
      where: {
        role: Role.STUDENT,
        status: UserStatus.REJECTED,
      },
    });

    // Log activity
    await this.activityLogService.log({
      action: 'REJECTED_STUDENTS_CLEANED',
      entityType: 'USER',
      userId: req.user.id,
      metadata: {
        deletedCount: result.count,
        deletedEmails: rejectedStudents.map(s => s.email),
      },
    });

    return {
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} rejected student application(s)`,
    };
  }

  // =====================
  // CLEANUP: Delete ALL rejected items (students + teachers + courses)
  // =====================
  @Delete('cleanup-all-rejected')
  async cleanupAllRejected(@Request() req) {
    const deleted: Record<string, number> = {};

    // Clean rejected students (with related data)
    const rejectedStudents = await this.prisma.user.findMany({
      where: { role: Role.STUDENT, status: UserStatus.REJECTED },
      select: { id: true },
    });
    if (rejectedStudents.length > 0) {
      const ids = rejectedStudents.map(s => s.id);
      await this.prisma.enrollment.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.progress.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.quizAttempt.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.submission.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.analyticsEvent.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.notification.deleteMany({ where: { userId: { in: ids } } });
      const r = await this.prisma.user.deleteMany({ where: { role: Role.STUDENT, status: UserStatus.REJECTED } });
      deleted.students = r.count;
    }

    // Clean rejected teachers
    const rejectedTeachers = await this.prisma.user.findMany({
      where: { role: Role.TEACHER, status: UserStatus.REJECTED },
      select: { id: true },
    });
    if (rejectedTeachers.length > 0) {
      const ids = rejectedTeachers.map(t => t.id);
      await this.prisma.analyticsEvent.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.notification.deleteMany({ where: { userId: { in: ids } } });
      const r = await this.prisma.user.deleteMany({ where: { role: Role.TEACHER, status: UserStatus.REJECTED } });
      deleted.teachers = r.count;
    }

    // Clean rejected courses
    const r = await this.prisma.course.deleteMany({ where: { status: CourseStatus.REJECTED } });
    deleted.courses = r.count;

    await this.activityLogService.log({
      action: 'ALL_REJECTED_CLEANED',
      entityType: 'SYSTEM',
      userId: req.user.id,
      metadata: deleted,
    });

    return { success: true, deleted, message: 'All rejected items cleaned up' };
  }

  // Statistics
  @Get('stats')
  async getStats() {
    const [pendingApprovals, totalUsers, totalTeachers, totalStudents, totalCourses, blacklistedUsers, blacklistedCourses] = await Promise.all([
      this.prisma.user.count({ where: { status: UserStatus.PENDING_APPROVAL, role: Role.TEACHER } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.course.count(),
      this.prisma.blacklistedUser.count(),
      this.prisma.course.count({ where: { status: CourseStatus.BLACKLISTED } }),
    ]);

    return {
      pendingApprovals,
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      blacklistedUsers,
      blacklistedCourses,
    };
  }

  // Blacklist Management
  @Post('users/:userId/blacklist')
  async blacklistUser(@Param('userId') userId: string, @Body() body: BlacklistUserBodyDto, @Request() req) {
    // Fetch the full user record
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, password: true, role: true, status: true,
        avatar: true, organizationId: true, rejectionReason: true,
        phone: true, rollNo: true, year: true, branch: true, course: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let blacklistedCourses = 0;
    if (user.role === Role.TEACHER) {
      const result = await this.prisma.course.updateMany({
        where: { instructorId: userId, status: { not: CourseStatus.BLACKLISTED } },
        data: { status: CourseStatus.BLACKLISTED, rejectionReason: `Instructor blacklisted: ${body.reason}` },
      });
      blacklistedCourses = result.count;
    }

    // Blacklist related courses for the teacher
    if (user.role === Role.TEACHER) {
      await this.prisma.course.updateMany({
        where: { instructorId: userId },
        data: { status: CourseStatus.BLACKLISTED, rejectionReason: `Instructor blacklisted: ${body.reason}` },
      });
    }

    // Create BlacklistedUser record
    await this.prisma.blacklistedUser.create({
      data: {
        originalUserId: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        avatar: user.avatar,
        organizationId: user.organizationId,
        rejectionReason: user.rejectionReason,
        phone: user.phone,
        rollNo: user.rollNo,
        year: user.year,
        branch: user.branch,
        course: user.course,
        reason: body.reason,
        blacklistedBy: req.user.id,
      },
    });

    // Delete related records before deleting the user
    await this.prisma.enrollment.deleteMany({ where: { userId } });
    await this.prisma.progress.deleteMany({ where: { userId } });
    await this.prisma.quizAttempt.deleteMany({ where: { userId } });
    await this.prisma.submission.deleteMany({ where: { userId } });
    await this.prisma.analyticsEvent.deleteMany({ where: { userId } });
    await this.prisma.notification.deleteMany({ where: { userId } });
    await this.prisma.review.deleteMany({ where: { userId } });
    await this.prisma.order.deleteMany({ where: { userId } });
    await this.prisma.discussion.deleteMany({ where: { userId } });
    await this.prisma.certificate.deleteMany({ where: { userId } });
    await this.prisma.reply.deleteMany({ where: { userId } });

    // Delete the user from the main table
    await this.prisma.user.delete({ where: { id: userId } });

    await this.activityLogService.log({
      action: 'USER_BLACKLISTED',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      targetUserId: user.id,
      metadata: { email: user.email, name: user.name, role: user.role, reason: body.reason, blacklistedCourses },
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, blacklistedCourses };
  }

  @Post('users/:userId/unblacklist')
  async unblacklistUser(@Param('userId') userId: string, @Request() req) {
    // Check if user is in BlacklistedUser table
    const blacklisted = await this.prisma.blacklistedUser.findFirst({
      where: { originalUserId: userId },
    });

    if (!blacklisted) {
      throw new NotFoundException('Blacklisted user not found');
    }

    // Restore user to main User table
    const restoredUser = await this.prisma.user.create({
      data: {
        email: blacklisted.email,
        name: blacklisted.name,
        password: blacklisted.password,
        role: blacklisted.role,
        status: UserStatus.ACTIVE,
        avatar: blacklisted.avatar,
        organizationId: blacklisted.organizationId,
        phone: blacklisted.phone,
        rollNo: blacklisted.rollNo,
        year: blacklisted.year,
        branch: blacklisted.branch,
        course: blacklisted.course,
      },
    });

    let restoredCourses = 0;
    if (blacklisted.role === Role.TEACHER) {
      const result = await this.prisma.course.updateMany({
        where: { instructorId: userId, status: CourseStatus.BLACKLISTED },
        data: { status: CourseStatus.APPROVED, rejectionReason: null },
      });
      restoredCourses = result.count;
      // Update course instructorId to new user ID
      await this.prisma.course.updateMany({
        where: { instructorId: userId },
        data: { instructorId: restoredUser.id },
      });
    }

    // Delete from blacklisted table
    await this.prisma.blacklistedUser.delete({ where: { id: blacklisted.id } });

    await this.activityLogService.log({
      action: 'USER_UNBLACKLISTED',
      entityType: 'USER',
      entityId: restoredUser.id,
      userId: req.user.id,
      targetUserId: restoredUser.id,
      metadata: { email: restoredUser.email, name: restoredUser.name, restoredCourses },
    });

    return { success: true, user: { id: restoredUser.id, email: restoredUser.email, name: restoredUser.name, role: restoredUser.role }, restoredCourses };
  }

  // Get all blacklisted users
  @Get('users/blacklisted')
  async getBlacklistedUsers() {
    return this.prisma.blacklistedUser.findMany({
      select: {
        id: true,
        originalUserId: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        rollNo: true,
        year: true,
        branch: true,
        course: true,
        reason: true,
        blacklistedAt: true,
        organizationId: true,
      },
      orderBy: { blacklistedAt: 'desc' },
    });
  }

  // Revert blacklist - move user back from BlacklistedUser to User table
  @Post('users/blacklisted/:blacklistedId/revert')
  async revertBlacklist(@Param('blacklistedId') blacklistedId: string, @Request() req) {
    const blacklisted = await this.prisma.blacklistedUser.findUnique({
      where: { id: blacklistedId },
    });

    if (!blacklisted) {
      throw new NotFoundException('Blacklisted user not found');
    }

    // Check if email is already in use
    const existing = await this.prisma.user.findUnique({ where: { email: blacklisted.email } });
    if (existing) {
      return { success: false, message: 'A user with this email already exists in the main table' };
    }

    // Restore user to main User table
    const restoredUser = await this.prisma.user.create({
      data: {
        email: blacklisted.email,
        name: blacklisted.name,
        password: blacklisted.password,
        role: blacklisted.role,
        status: UserStatus.ACTIVE,
        avatar: blacklisted.avatar,
        organizationId: blacklisted.organizationId,
        phone: blacklisted.phone,
        rollNo: blacklisted.rollNo,
        year: blacklisted.year,
        branch: blacklisted.branch,
        course: blacklisted.course,
      },
    });

    let restoredCourses = 0;
    if (blacklisted.role === Role.TEACHER) {
      // Restore courses that were blacklisted due to this instructor
      const result = await this.prisma.course.updateMany({
        where: {
          instructorId: blacklisted.originalUserId,
          status: CourseStatus.BLACKLISTED,
        },
        data: { status: CourseStatus.APPROVED, rejectionReason: null, instructorId: restoredUser.id },
      });
      restoredCourses = result.count;
    }

    // Delete from blacklisted table
    await this.prisma.blacklistedUser.delete({ where: { id: blacklistedId } });

    await this.activityLogService.log({
      action: 'BLACKLIST_REVERTED',
      entityType: 'USER',
      entityId: restoredUser.id,
      userId: req.user.id,
      targetUserId: restoredUser.id,
      metadata: { email: restoredUser.email, name: restoredUser.name, restoredCourses },
    });

    return { success: true, user: { id: restoredUser.id, email: restoredUser.email, name: restoredUser.name, role: restoredUser.role }, restoredCourses };
  }

  @Post('courses/:courseId/blacklist')
  async blacklistCourse(@Param('courseId') courseId: string, @Body() body: BlacklistCourseBodyDto, @Request() req) {
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.BLACKLISTED, rejectionReason: body.reason },
      select: { id: true, title: true, status: true, instructorId: true },
    });

    await this.notify(course.instructorId, 'course', 'Course Blacklisted', `Your course "${course.title}" has been hidden. ${body.reason || ''}`);

    await this.activityLogService.log({
      action: 'COURSE_BLACKLISTED',
      entityType: 'COURSE',
      entityId: course.id,
      userId: req.user.id,
      targetUserId: course.instructorId,
      metadata: { title: course.title, reason: body.reason },
    });

    return { success: true, course };
  }

  @Post('courses/:courseId/unblacklist')
  async unblacklistCourse(@Param('courseId') courseId: string, @Request() req) {
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'APPROVED', rejectionReason: null },
      select: { id: true, title: true, status: true, instructorId: true },
    });

    await this.activityLogService.log({
      action: 'COURSE_UNBLACKLISTED',
      entityType: 'COURSE',
      entityId: course.id,
      userId: req.user.id,
      targetUserId: course.instructorId,
      metadata: { title: course.title },
    });

    return { success: true, course };
  }

  // Delete a specific course permanently
  @Delete('courses/:courseId')
  async deleteCourse(@Param('courseId') courseId: string, @Request() req) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Delete related data
    const sections = await this.prisma.section.findMany({ where: { courseId }, select: { id: true } });
    const sectionIds = sections.map(s => s.id);

    if (sectionIds.length > 0) {
      const modules = await this.prisma.module.findMany({ where: { sectionId: { in: sectionIds } }, select: { id: true } });
      const moduleIds = modules.map(m => m.id);

      if (moduleIds.length > 0) {
        await this.prisma.progress.deleteMany({ where: { moduleId: { in: moduleIds } } });
        await this.prisma.quizAttempt.deleteMany({ where: { quiz: { moduleId: { in: moduleIds } } } });
        await this.prisma.question.deleteMany({ where: { quiz: { moduleId: { in: moduleIds } } } });
        await this.prisma.quiz.deleteMany({ where: { moduleId: { in: moduleIds } } });
        await this.prisma.submission.deleteMany({ where: { assignment: { moduleId: { in: moduleIds } } } });
        await this.prisma.assignment.deleteMany({ where: { moduleId: { in: moduleIds } } });
      }
      await this.prisma.module.deleteMany({ where: { sectionId: { in: sectionIds } } });
    }
    await this.prisma.section.deleteMany({ where: { courseId } });
    await this.prisma.enrollment.deleteMany({ where: { courseId } });
    await this.prisma.review.deleteMany({ where: { courseId } });
    await this.prisma.order.deleteMany({ where: { courseId } });
    await this.prisma.discussion.deleteMany({ where: { courseId } });
    await this.prisma.certificate.deleteMany({ where: { courseId } });

    await this.prisma.course.delete({ where: { id: courseId } });

    await this.activityLogService.log({
      action: 'COURSE_DELETED',
      entityType: 'COURSE',
      entityId: courseId,
      userId: req.user.id,
      targetUserId: course.instructorId,
      metadata: { title: course.title },
    });

    return { success: true, message: `Course "${course.title}" deleted permanently` };
  }
}
