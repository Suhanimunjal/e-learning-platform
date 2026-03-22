import { Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { StudentService } from './student.service';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.studentService.getDashboard(req.user.id);
  }

  @Get('enrolled')
  getEnrolledCourses(@Request() req) {
    return this.studentService.getEnrolledCourses(req.user.id);
  }

  @Get('course/:courseId/full')
  getCourseFull(@Request() req, @Param('courseId') courseId: string) {
    return this.studentService.getCourseFull(req.user.id, courseId);
  }

  @Get('certificates')
  getCertificates(@Request() req) {
    return this.studentService.getCertificates(req.user.id);
  }

  @Get('certificates/:certificateId/download')
  getCertificateDownload(@Request() req, @Param('certificateId') certificateId: string) {
    return this.studentService.getCertificateDownload(req.user.id, certificateId);
  }

  @Get('notifications')
  getNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 20;
    const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;
    const onlyUnread = unreadOnly === 'true';

    return this.studentService.getNotifications(req.user.id, safeLimit, onlyUnread);
  }

  @Get('notifications/unread-count')
  getUnreadCount(@Request() req) {
    return this.studentService.getUnreadNotificationCount(req.user.id);
  }

  @Patch('notifications/:notificationId/read')
  markNotificationRead(@Request() req, @Param('notificationId') notificationId: string) {
    return this.studentService.markNotificationRead(req.user.id, notificationId);
  }
}
