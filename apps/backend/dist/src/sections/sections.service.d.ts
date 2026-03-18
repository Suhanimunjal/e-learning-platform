import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { User } from '@prisma/client';
export declare class SectionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSectionDto: CreateSectionDto, user: User): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
    findAll(courseId: string, user: User): Promise<({
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
    update(id: string, updateSectionDto: any, user: User): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
    remove(id: string, user: User): Promise<{
        id: string;
        title: string;
        courseId: string;
        order: number;
    }>;
}
