import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post(':courseId')
  enroll(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.enroll(courseId, req.user);
  }

  @Get('my-courses')
  getMyCourses(@Request() req) {
    return this.enrollmentsService.getMyCourses(req.user);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  getPendingEnrollments(@Request() req) {
    return this.enrollmentsService.getPendingEnrollments(req.user.id);
  }

  @Post(':enrollmentId/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  approveEnrollment(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    return this.enrollmentsService.approveEnrollment(enrollmentId, req.user.id);
  }

  @Post(':enrollmentId/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  rejectEnrollment(
    @Param('enrollmentId') enrollmentId: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    return this.enrollmentsService.rejectEnrollment(enrollmentId, req.user.id);
  }

  @Get('course/:courseId/students')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  getCourseStudents(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getCourseStudents(courseId, req.user);
  }
}
