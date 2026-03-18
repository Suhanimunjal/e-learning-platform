import { Module } from '@nestjs/common';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { HooksService } from '../common/services/hooks.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PluginsController],
  providers: [PluginLoaderService, PluginsService, HooksService, PrismaService],
  exports: [PluginLoaderService, PluginsService, HooksService],
})
export class PluginsModule {}
