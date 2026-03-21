import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AiModule } from '../ai/ai.module';
import { AdminCourseGenerationService } from './services/admin-course-generation.service';

@Module({
  imports: [AiModule],
  controllers: [AdminController],
  providers: [AdminCourseGenerationService],
})
export class AdminModule {}
