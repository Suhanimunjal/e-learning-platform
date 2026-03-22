import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './common/health.controller';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { ModulesModule } from './modules/modules.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AiModule } from './ai/ai.module';
import { PaymentsModule } from './payments/payments.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PluginsModule } from './plugins/plugins.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { VideoGenerationModule } from './video-generation/video-generation.module';
import { QuizModule } from './quiz/quiz.module';
import { AdminModule } from './admin/admin.module';
import { CourseEnrollmentGuard } from './common/guards/course-enrollment.guard';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    CoursesModule,
    SectionsModule,
    ModulesModule,
    EnrollmentsModule,
    AiModule,
    PaymentsModule,
    OrganizationsModule,
    PluginsModule,
    SubscriptionsModule,
    AnalyticsModule,
    VideoGenerationModule,
    QuizModule,
    AdminModule,
    StudentModule,
  ],
  controllers: [HealthController],
  providers: [CourseEnrollmentGuard],
})
export class AppModule {}
