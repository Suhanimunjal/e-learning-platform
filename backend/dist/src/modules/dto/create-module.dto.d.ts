import { ModuleType, ContentItemType } from '@prisma/client';
export declare class ContentItemDto {
    type: ContentItemType;
    title: string;
    url?: string;
    content?: any;
    order?: number;
    duration?: number;
    metadata?: any;
}
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
    contentItems?: ContentItemDto[];
}
