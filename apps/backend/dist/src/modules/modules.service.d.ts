import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { User } from '@prisma/client';
import { AnalyticsTrackingService } from '../analytics/services/analytics-tracking.service';
export declare class ModulesService {
    private prisma;
    private analyticsTracking;
    constructor(prisma: PrismaService, analyticsTracking: AnalyticsTrackingService);
    create(createModuleDto: CreateModuleDto, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        sectionId: string;
        type: import(".prisma/client").$Enums.ModuleType;
        videoUrl: string | null;
        textContent: string | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        duration: number | null;
        isPreview: boolean;
        hasVideo: boolean;
        videoGenId: string | null;
    }>;
    findAll(sectionId: string, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        sectionId: string;
        type: import(".prisma/client").$Enums.ModuleType;
        videoUrl: string | null;
        textContent: string | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        duration: number | null;
        isPreview: boolean;
        hasVideo: boolean;
        videoGenId: string | null;
    }[]>;
    findOne(id: string, user: User): Promise<{
        section: {
            course: {
                id: string;
                description: string;
                updatedAt: Date;
                organizationId: string | null;
                createdAt: Date;
                slug: string;
                title: string;
                thumbnail: string | null;
                videoIntro: string | null;
                price: number;
                instructorId: string;
                published: boolean;
            };
        } & {
            id: string;
            title: string;
            courseId: string;
            order: number;
        };
    } & {
        id: string;
        title: string;
        order: number;
        sectionId: string;
        type: import(".prisma/client").$Enums.ModuleType;
        videoUrl: string | null;
        textContent: string | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        duration: number | null;
        isPreview: boolean;
        hasVideo: boolean;
        videoGenId: string | null;
    }>;
    update(id: string, updateModuleDto: any, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        sectionId: string;
        type: import(".prisma/client").$Enums.ModuleType;
        videoUrl: string | null;
        textContent: string | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        duration: number | null;
        isPreview: boolean;
        hasVideo: boolean;
        videoGenId: string | null;
    }>;
    remove(id: string, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        sectionId: string;
        type: import(".prisma/client").$Enums.ModuleType;
        videoUrl: string | null;
        textContent: string | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        duration: number | null;
        isPreview: boolean;
        hasVideo: boolean;
        videoGenId: string | null;
    }>;
}
