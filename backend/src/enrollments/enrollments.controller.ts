import { Controller, Post, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
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

  @Get('course/:courseId/students')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  getCourseStudents(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getCourseStudents(courseId, req.user);
  }

  @Delete(':enrollmentId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  removeStudent(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    return this.enrollmentsService.removeStudentFromCourse(enrollmentId, req.user);
  }
}
