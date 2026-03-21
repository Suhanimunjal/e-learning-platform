import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LMSPlugin, PluginContext } from './plugin.interface';
import { HooksService } from '../common/services/hooks.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PluginLoaderService implements OnModuleInit {
  private readonly logger = new Logger(PluginLoaderService.name);
  private plugins: Map<string, LMSPlugin> = new Map();
  private pluginContext: PluginContext;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private hooksService: HooksService,
  ) {
    this.pluginContext = this.createPluginContext();
  }

  async onModuleInit() {
    const pluginsEnabled = this.configService.get('PLUGINS_ENABLED', 'true');
    
    if (pluginsEnabled === 'true') {
      await this.loadPlugins();
    } else {
      this.logger.log('Plugins are disabled');
    }
  }

  private createPluginContext(): PluginContext {
    return {
      tenantId: null, // Will be set per request
      logger: {
        log: (message: string, data?: any) => this.logger.log(message, data),
        error: (message: string, error?: any) => this.logger.error(message, error),
        warn: (message: string, data?: any) => this.logger.warn(message, data),
      },
      db: {
        find: async (model: string, query: any) => {
          // Limited DB access - only read operations on specific models
          const allowedModels = ['Attendance', 'Certificate', 'Notification'];
          if (!allowedModels.includes(model)) {
            throw new Error(`Model ${model} not allowed for plugins`);
          }
          // Implementation would use Prisma dynamically
          return [];
        },
        findOne: async (model: string, query: any) => {
          // Limited DB access
          return null;
        },
        create: async (model: string, data: any) => {
          // Limited DB access
          return null;
        },
        update: async (model: string, id: string, data: any) => {
          // Limited DB access
          return null;
        },
        delete: async (model: string, id: string) => {
          // Limited DB access
          return null;
        },
      },
      hooks: {
        trigger: async (event: string, data: any) => {
          await this.hooksService.trigger(event, data);
        },
        register: (event: string, handler: (data: any) => Promise<void> | void) => {
          this.hooksService.register(event, handler);
        },
      },
      features: {
        isEnabled: (flag: string) => {
          // Check feature flags
          return this.configService.get(`FEATURE_${flag}`, 'false') === 'true';
        },
      },
    };
  }

  async loadPlugins() {
    const pluginsDir = path.join(__dirname, '../plugins');
    
    if (!fs.existsSync(pluginsDir)) {
      this.logger.warn('Plugins directory not found');
      return;
    }

    const pluginFiles = fs.readdirSync(pluginsDir);
    
    for (const file of pluginFiles) {
      if (file.endsWith('.plugin.ts') || file.endsWith('.plugin.js')) {
        try {
          const pluginPath = path.join(pluginsDir, file);
          const pluginModule = await import(pluginPath);
          const plugin: LMSPlugin = pluginModule.default || pluginModule;
          
          // Initialize plugin
          await plugin.init(this.pluginContext);
          
          // Register hooks
          if (plugin.hooks) {
            for (const [event, handler] of Object.entries(plugin.hooks)) {
              this.hooksService.register(event, handler);
            }
          }
          
          this.plugins.set(plugin.name, plugin);
          this.logger.log(`Plugin loaded: ${plugin.name} v${plugin.version}`);
        } catch (error) {
          this.logger.error(`Failed to load plugin ${file}:`, error);
        }
      }
    }
  }

  getPlugin(name: string): LMSPlugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Array<{ name: string; version: string; description?: string }> {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
    }));
  }
}
