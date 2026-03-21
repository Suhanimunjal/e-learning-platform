import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService, ActivityLogService],
})
export class CoursesModule {}
