import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  getCourseStudents(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getCourseStudents(courseId, req.user);
  }
}
