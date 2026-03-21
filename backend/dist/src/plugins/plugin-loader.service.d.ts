import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LMSPlugin } from './plugin.interface';
import { HooksService } from '../common/services/hooks.service';
export declare class PluginLoaderService implements OnModuleInit {
    private configService;
    private prisma;
    private hooksService;
    private readonly logger;
    private plugins;
    private pluginContext;
    constructor(configService: ConfigService, prisma: PrismaService, hooksService: HooksService);
    onModuleInit(): Promise<void>;
    private createPluginContext;
    loadPlugins(): Promise<void>;
    getPlugin(name: string): LMSPlugin | undefined;
    getAllPlugins(): Array<{
        name: string;
        version: string;
        description?: string;
    }>;
}
