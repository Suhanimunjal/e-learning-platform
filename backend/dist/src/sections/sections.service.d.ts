import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { User } from '@prisma/client';
export declare class SectionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSectionDto: CreateSectionDto, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    findAll(courseId: string, user: User): Promise<({
        modules: {
            id: string;
            rejectionReason: string | null;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            order: number;
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
            approvedBy: string | null;
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
    update(id: string, updateSectionDto: any, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    remove(id: string, user: User): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
}
