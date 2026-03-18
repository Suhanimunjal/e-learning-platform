import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiController } from './ai.controller';
import { AiService } from './services/ai.service';
import { AnthropicService } from './services/anthropic.service';
import { AiJobProcessor } from './services/ai-job.processor';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [AiController],
  providers: [AiService, AnthropicService, AiJobProcessor, PrismaService],
  exports: [AiService],
})
export class AiModule {}
