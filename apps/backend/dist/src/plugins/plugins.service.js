"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PluginsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const available_plugins_1 = require("./available-plugins");
let PluginsService = PluginsService_1 = class PluginsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PluginsService_1.name);
    }
    async getInstalledPlugins() {
        const plugins = await this.prisma.plugin.findMany({
            orderBy: { installedAt: 'desc' },
        });
        return plugins.map(plugin => {
            const availablePlugin = available_plugins_1.AVAILABLE_PLUGINS.find(p => p.id === plugin.pluginId);
            return {
                ...plugin,
                features: availablePlugin?.features || [],
                configSchema: availablePlugin?.configSchema || null,
                usageInstructions: availablePlugin?.usageInstructions || null,
            };
        });
    }
    async getAvailablePlugins(category) {
        const installed = await this.prisma.plugin.findMany({ select: { pluginId: true } });
        const installedIds = new Set(installed.map(p => p.pluginId));
        let plugins = available_plugins_1.AVAILABLE_PLUGINS;
        if (category && category !== 'ALL') {
            plugins = plugins.filter(p => p.category === category);
        }
        return plugins.map(plugin => ({
            ...plugin,
            isInstalled: installedIds.has(plugin.id),
        }));
    }
    async getCategories() {
        return available_plugins_1.PLUGIN_CATEGORIES;
    }
    async installPlugin(pluginId) {
        const availablePlugin = available_plugins_1.AVAILABLE_PLUGINS.find(p => p.id === pluginId);
        if (!availablePlugin) {
            throw new common_1.NotFoundException(`Plugin '${pluginId}' not found in marketplace`);
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
                category: availablePlugin.category,
                icon: availablePlugin.icon,
                enabled: false,
                config: availablePlugin.configSchema?.properties ? {} : null,
            },
        });
        this.logger.log(`Plugin installed: ${plugin.name}`);
        return { message: 'Plugin installed successfully', plugin };
    }
    async uninstallPlugin(pluginId) {
        const plugin = await this.prisma.plugin.findUnique({
            where: { pluginId },
        });
        if (!plugin) {
            throw new common_1.NotFoundException('Plugin not found');
        }
        await this.prisma.plugin.delete({
            where: { pluginId },
        });
        this.logger.log(`Plugin uninstalled: ${plugin.name}`);
        return { message: 'Plugin uninstalled successfully' };
    }
    async togglePlugin(pluginId, enabled) {
        const plugin = await this.prisma.plugin.findUnique({
            where: { pluginId },
        });
        if (!plugin) {
            throw new common_1.NotFoundException('Plugin not found');
        }
        const updated = await this.prisma.plugin.update({
            where: { pluginId },
            data: { enabled },
        });
        this.logger.log(`Plugin ${updated.name} ${enabled ? 'enabled' : 'disabled'}`);
        return { message: `Plugin ${enabled ? 'enabled' : 'disabled'}`, plugin: updated };
    }
    async configurePlugin(pluginId, config) {
        const plugin = await this.prisma.plugin.findUnique({
            where: { pluginId },
        });
        if (!plugin) {
            throw new common_1.NotFoundException('Plugin not found');
        }
        const availablePlugin = available_plugins_1.AVAILABLE_PLUGINS.find(p => p.id === pluginId);
        if (availablePlugin?.configSchema?.required) {
            const missingFields = availablePlugin.configSchema.required.filter(field => !config[field]);
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
    async getPluginById(pluginId) {
        const plugin = await this.prisma.plugin.findUnique({
            where: { pluginId },
        });
        if (!plugin) {
            throw new common_1.NotFoundException('Plugin not found');
        }
        const availablePlugin = available_plugins_1.AVAILABLE_PLUGINS.find(p => p.id === plugin.pluginId);
        return {
            ...plugin,
            features: availablePlugin?.features || [],
            configSchema: availablePlugin?.configSchema || null,
            usageInstructions: availablePlugin?.usageInstructions || null,
        };
    }
    async getPluginStats() {
        const [total, installed, enabled] = await Promise.all([
            available_plugins_1.AVAILABLE_PLUGINS.length,
            this.prisma.plugin.count(),
            this.prisma.plugin.count({ where: { enabled: true } }),
        ]);
        const byCategory = await Promise.all(available_plugins_1.PLUGIN_CATEGORIES.slice(1).map(async (cat) => {
            if (cat.id === 'ALL')
                return null;
            const count = available_plugins_1.AVAILABLE_PLUGINS.filter(p => p.category === cat.id).length;
            const installedCount = await this.prisma.plugin.count({
                where: { category: cat.id },
            });
            return {
                category: cat.name,
                available: count,
                installed: installedCount,
            };
        }));
        return {
            totalPlugins: total,
            installedPlugins: installed,
            enabledPlugins: enabled,
            byCategory: byCategory.filter(Boolean),
        };
    }
};
exports.PluginsService = PluginsService;
exports.PluginsService = PluginsService = PluginsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PluginsService);
//# sourceMappingURL=plugins.service.js.map