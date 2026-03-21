import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
export declare class SectionsController {
    private readonly sectionsService;
    constructor(sectionsService: SectionsService);
    create(req: any, createSectionDto: CreateSectionDto): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    findAll(courseId: string, req: any): Promise<({
        modules: {
            id: string;
            rejectionReason: string | null;
            title: string;
            approvedBy: string | null;
            order: number;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
            topic: string | null;
            generatedContent: import("@prisma/client/runtime/client").JsonValue | null;
            contentStatus: import(".prisma/client").$Enums.ContentStatus;
            videoStatus: import(".prisma/client").$Enums.VideoStatus;
            audioUrl: string | null;
            transcript: string | null;
            voiceId: string | null;
            approvedAt: Date | null;
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
            sectionId: string;
        }[];
    } & {
        id: string;
        title: string;
        order: number;
        courseId: string;
    })[]>;
    update(id: string, updateSectionDto: any, req: any): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
}
