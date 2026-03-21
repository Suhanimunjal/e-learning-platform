import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsTrackingService } from './services/analytics-tracking.service';
import { AnalyticsReportingService } from './services/analytics-reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly trackingService: AnalyticsTrackingService,
    private readonly reportingService: AnalyticsReportingService,
  ) {}

  // ==================== USER ANALYTICS ====================

  @Get('my-analytics')
  @Roles(Role.STUDENT, Role.TEACHER)
  async getMyAnalytics(@Request() req) {
    return this.reportingService.getUserAnalytics(req.user.id);
  }

  // ==================== COURSE ANALYTICS ====================

  @Get('courses/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async getCourseAnalytics(@Param('courseId') courseId: string, @Request() req) {
    // For teachers, verify they own the course
    if (req.user.role === Role.TEACHER) {
      const course = await this.reportingService.getCourseAnalytics(courseId);
      // Additional check can be added here to verify teacher ownership
    }
    return this.reportingService.getCourseAnalytics(courseId);
  }

  @Get('courses/:courseId/students')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async getCourseStudentsProgress(@Param('courseId') courseId: string) {
    return this.reportingService.getCourseStudentsProgress(courseId);
  }

  @Get('courses/:courseId/students/:studentId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async getStudentProgress(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.reportingService.getStudentProgress(courseId, studentId);
  }

  // ==================== PLATFORM ANALYTICS ====================

  @Get('platform')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getPlatformAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getPlatformAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('platform/top-courses')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getTopCourses(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.reportingService.getTopCourses(limitNum);
  }

  @Get('platform/engagement')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getEngagementMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportingService.getEngagementMetrics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
