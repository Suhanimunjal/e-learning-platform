import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('video-generation')
@UseGuards(JwtAuthGuard)
export class VideoGenerationController {
  constructor(private readonly videoGenService: VideoGenerationService) {}

  @Get('stats/all')
  async getStats() {
    return this.videoGenService.getStats();
  }

  @Post('generate/:moduleId')
  async generateVideo(@Param('moduleId') moduleId: string) {
    return this.videoGenService.generateVideo(moduleId);
  }

  @Get('module/:moduleId')
  async getByModuleId(@Param('moduleId') moduleId: string) {
    return this.videoGenService.findByModuleId(moduleId);
  }

  @Get('course/:courseId')
  async getByCourse(@Param('courseId') courseId: string) {
    return this.videoGenService.findAllByCourse(courseId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.videoGenService.findById(id);
  }

  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    return this.videoGenService.retry(id);
  }
}
