import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AnalyticsModule, AiModule],
  controllers: [ModulesController],
  providers: [ModulesService, PrismaService],
})
export class ModulesModule {}
