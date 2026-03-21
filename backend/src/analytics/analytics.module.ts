import { Module } from '@nestjs/common';
import { AnalyticsTrackingService } from './services/analytics-tracking.service';
import { AnalyticsReportingService } from './services/analytics-reporting.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AnalyticsTrackingService, AnalyticsReportingService],
  controllers: [AnalyticsController],
  exports: [AnalyticsTrackingService, AnalyticsReportingService],
})
export class AnalyticsModule {}
