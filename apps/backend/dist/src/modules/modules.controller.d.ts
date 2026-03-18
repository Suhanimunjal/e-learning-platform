import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(req: any, createModuleDto: CreateModuleDto): Promise<{
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
    findAll(sectionId: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateModuleDto: any, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
