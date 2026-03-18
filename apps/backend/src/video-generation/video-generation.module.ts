import { Module } from '@nestjs/common';
import { VideoGenerationController } from './video-generation.controller';
import { VideoGenerationService } from './video-generation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VideoGenerationController],
  providers: [VideoGenerationService, PrismaService],
  exports: [VideoGenerationService],
})
export class VideoGenerationModule {}
