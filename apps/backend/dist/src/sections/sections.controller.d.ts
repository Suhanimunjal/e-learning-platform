import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
export declare class SectionsController {
    private readonly sectionsService;
    constructor(sectionsService: SectionsService);
    create(req: any, createSectionDto: CreateSectionDto): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
    findAll(courseId: string, req: any): Promise<({
        modules: {
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
        }[];
    } & {
        id: string;
        title: string;
        courseId: string;
        order: number;
    })[]>;
    update(id: string, updateSectionDto: any, req: any): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
}
