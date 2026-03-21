import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AVAILABLE_PLUGINS, PLUGIN_CATEGORIES, AvailablePlugin } from './available-plugins';
import { PluginCategory } from '@prisma/client';

@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);

  constructor(private prisma: PrismaService) {}

  async getInstalledPlugins() {
    const plugins = await this.prisma.plugin.findMany({
      orderBy: { installedAt: 'desc' },
    });

    return plugins.map(plugin => {
      const availablePlugin = AVAILABLE_PLUGINS.find(p => p.id === plugin.pluginId);
      return {
        ...plugin,
        features: availablePlugin?.features || [],
        configSchema: availablePlugin?.configSchema || null,
        usageInstructions: availablePlugin?.usageInstructions || null,
      };
    });
  }

  async getAvailablePlugins(category?: string) {
    const installed = await this.prisma.plugin.findMany({ select: { pluginId: true } });
    const installedIds = new Set(installed.map(p => p.pluginId));

    let plugins = AVAILABLE_PLUGINS;

    if (category && category !== 'ALL') {
      plugins = plugins.filter(p => p.category === category);
    }

    return plugins.map(plugin => ({
      ...plugin,
      isInstalled: installedIds.has(plugin.id),
    }));
  }

  async getCategories() {
    return PLUGIN_CATEGORIES;
  }

  async installPlugin(pluginId: string) {
    const availablePlugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);

    if (!availablePlugin) {
      throw new NotFoundException(`Plugin '${pluginId}' not found in marketplace`);
    }

    const existing = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });

    if (existing) {
      return { message: 'Plugin already installed', plugin: existing };
    }

    const plugin = await this.prisma.plugin.create({
      data: {
        pluginId: availablePlugin.id,
        name: availablePlugin.name,
        description: availablePlugin.description,
        version: availablePlugin.version,
        author: availablePlugin.author,
        category: availablePlugin.category as PluginCategory,
        icon: availablePlugin.icon,
        enabled: false,
        config: availablePlugin.configSchema?.properties ? {} : null,
      },
    });

    this.logger.log(`Plugin installed: ${plugin.name}`);

    return { message: 'Plugin installed successfully', plugin };
  }

  async uninstallPlugin(pluginId: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    await this.prisma.plugin.delete({
      where: { pluginId },
    });

    this.logger.log(`Plugin uninstalled: ${plugin.name}`);

    return { message: 'Plugin uninstalled successfully' };
  }

  async togglePlugin(pluginId: string, enabled: boolean) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    const updated = await this.prisma.plugin.update({
      where: { pluginId },
      data: { enabled },
    });

    this.logger.log(`Plugin ${updated.name} ${enabled ? 'enabled' : 'disabled'}`);

    return { message: `Plugin ${enabled ? 'enabled' : 'disabled'}`, plugin: updated };
  }

  async configurePlugin(pluginId: string, config: Record<string, any>) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    const availablePlugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
    
    if (availablePlugin?.configSchema?.required) {
      const missingFields = availablePlugin.configSchema.required.filter(
        field => !config[field]
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
      }
    }

    const updated = await this.prisma.plugin.update({
      where: { pluginId },
      data: { config },
    });

    this.logger.log(`Plugin ${plugin.name} configured`);

    return { message: 'Plugin configured successfully', plugin: updated };
  }

  async getPluginById(pluginId: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }

    const availablePlugin = AVAILABLE_PLUGINS.find(p => p.id === plugin.pluginId);

    return {
      ...plugin,
      features: availablePlugin?.features || [],
      configSchema: availablePlugin?.configSchema || null,
      usageInstructions: availablePlugin?.usageInstructions || null,
    };
  }

  async getPluginStats() {
    const [total, installed, enabled] = await Promise.all([
      AVAILABLE_PLUGINS.length,
      this.prisma.plugin.count(),
      this.prisma.plugin.count({ where: { enabled: true } }),
    ]);

    const byCategory = await Promise.all(
      PLUGIN_CATEGORIES.slice(1).map(async (cat) => {
        if (cat.id === 'ALL') return null;
        const count = AVAILABLE_PLUGINS.filter(p => p.category === cat.id).length;
        const installedCount = await this.prisma.plugin.count({
          where: { category: cat.id as PluginCategory },
        });
        return {
          category: cat.name,
          available: count,
          installed: installedCount,
        };
      })
    );

    return {
      totalPlugins: total,
      installedPlugins: installed,
      enabledPlugins: enabled,
      byCategory: byCategory.filter(Boolean),
    };
  }
}
