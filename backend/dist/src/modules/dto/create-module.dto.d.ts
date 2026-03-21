import { ModuleType } from '@prisma/client';
export declare class CreateModuleDto {
    title: string;
    sectionId: string;
    type: ModuleType;
    videoUrl?: string;
    textContent?: string;
    content?: any;
    order?: number;
    duration?: number;
    isPreview?: boolean;
}
