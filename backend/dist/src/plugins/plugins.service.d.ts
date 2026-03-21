import { PrismaService } from '../prisma/prisma.service';
export declare class PluginsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getInstalledPlugins(): Promise<{
        features: string[];
        configSchema: {
            type: string;
            properties: Record<string, any>;
            required?: string[];
        };
        usageInstructions: string;
        id: string;
        name: string;
        updatedAt: Date;
        pluginId: string;
        description: string | null;
        version: string;
        author: string | null;
        category: import(".prisma/client").$Enums.PluginCategory;
        icon: string | null;
        enabled: boolean;
        config: import("@prisma/client/runtime/client").JsonValue | null;
        installedAt: Date;
    }[]>;
    getAvailablePlugins(category?: string): Promise<{
        isInstalled: boolean;
        id: string;
        name: string;
        description: string;
        version: string;
        author: string;
        category: string;
        icon: string;
        features: string[];
        usageInstructions?: string;
        configSchema?: {
            type: string;
            properties: Record<string, any>;
            required?: string[];
        };
    }[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        icon: string;
    }[]>;
    installPlugin(pluginId: string): Promise<{
        message: string;
        plugin: {
            id: string;
            name: string;
            updatedAt: Date;
            pluginId: string;
            description: string | null;
            version: string;
            author: string | null;
            category: import(".prisma/client").$Enums.PluginCategory;
            icon: string | null;
            enabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
            installedAt: Date;
        };
    }>;
    uninstallPlugin(pluginId: string): Promise<{
        message: string;
    }>;
    togglePlugin(pluginId: string, enabled: boolean): Promise<{
        message: string;
        plugin: {
            id: string;
            name: string;
            updatedAt: Date;
            pluginId: string;
            description: string | null;
            version: string;
            author: string | null;
            category: import(".prisma/client").$Enums.PluginCategory;
            icon: string | null;
            enabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
            installedAt: Date;
        };
    }>;
    configurePlugin(pluginId: string, config: Record<string, any>): Promise<{
        message: string;
        plugin: {
            id: string;
            name: string;
            updatedAt: Date;
            pluginId: string;
            description: string | null;
            version: string;
            author: string | null;
            category: import(".prisma/client").$Enums.PluginCategory;
            icon: string | null;
            enabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
            installedAt: Date;
        };
    }>;
    getPluginById(pluginId: string): Promise<{
        features: string[];
        configSchema: {
            type: string;
            properties: Record<string, any>;
            required?: string[];
        };
        usageInstructions: string;
        id: string;
        name: string;
        updatedAt: Date;
        pluginId: string;
        description: string | null;
        version: string;
        author: string | null;
        category: import(".prisma/client").$Enums.PluginCategory;
        icon: string | null;
        enabled: boolean;
        config: import("@prisma/client/runtime/client").JsonValue | null;
        installedAt: Date;
    }>;
    getPluginStats(): Promise<{
        totalPlugins: number;
        installedPlugins: number;
        enabledPlugins: number;
        byCategory: {
            category: string;
            available: number;
            installed: number;
        }[];
    }>;
}
