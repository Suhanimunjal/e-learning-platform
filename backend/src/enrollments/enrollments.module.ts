import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, PrismaService, ActivityLogService],
})
export class EnrollmentsModule {}
