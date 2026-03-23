import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { UploadsController } from './uploads.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required.');
        }
        return { secret };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [CoursesController, UploadsController],
  providers: [CoursesService, PrismaService, ActivityLogService],
})
export class CoursesModule {}
