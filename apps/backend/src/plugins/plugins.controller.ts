import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PluginsService } from './plugins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('plugins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @Roles(Role.ADMIN)
  getInstalledPlugins() {
    return this.pluginsService.getInstalledPlugins();
  }

  @Get('available')
  @Roles(Role.ADMIN)
  getAvailablePlugins(@Query('category') category?: string) {
    return this.pluginsService.getAvailablePlugins(category);
  }

  @Get('categories')
  @Roles(Role.ADMIN)
  getCategories() {
    return this.pluginsService.getCategories();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getPluginStats() {
    return this.pluginsService.getPluginStats();
  }

  @Get(':pluginId')
  @Roles(Role.ADMIN)
  getPlugin(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getPluginById(pluginId);
  }

  @Post('install')
  @Roles(Role.ADMIN)
  installPlugin(@Body() body: { pluginId: string }) {
    return this.pluginsService.installPlugin(body.pluginId);
  }

  @Post('uninstall/:pluginId')
  @Roles(Role.ADMIN)
  uninstallPlugin(@Param('pluginId') pluginId: string) {
    return this.pluginsService.uninstallPlugin(pluginId);
  }

  @Patch(':pluginId/toggle')
  @Roles(Role.ADMIN)
  togglePlugin(
    @Param('pluginId') pluginId: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.pluginsService.togglePlugin(pluginId, body.enabled);
  }

  @Patch(':pluginId/configure')
  @Roles(Role.ADMIN)
  configurePlugin(
    @Param('pluginId') pluginId: string,
    @Body() config: Record<string, any>,
  ) {
    return this.pluginsService.configurePlugin(pluginId, config);
  }
}
