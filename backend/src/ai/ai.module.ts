import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './services/ai.service';
import { AnthropicService } from './services/anthropic.service';
import { CustomAiJobScheduler } from './services/custom-ai-job-scheduler';
import { AiJobProcessor } from './services/ai-job.processor';
import { PrismaService } from '../prisma/prisma.service';
import { TTSService } from './tts.service';
import { ContentGeneratorEnhancedService } from './content-generator-enhanced.service';
import { QuizVerificationService } from './quiz-verification.service';

@Module({
  providers: [
    AiService,
    AnthropicService,
    CustomAiJobScheduler,
    AiJobProcessor,
    PrismaService,
    TTSService,
    ContentGeneratorEnhancedService,
    QuizVerificationService,
  ],
  controllers: [AiController],
  exports: [AiService, TTSService, ContentGeneratorEnhancedService, QuizVerificationService],
})
export class AiModule {}
