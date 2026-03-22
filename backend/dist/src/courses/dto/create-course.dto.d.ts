export declare class CourseMaterialDto {
    name: string;
    url: string;
    type: string;
}
export declare class CreateCourseDto {
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    videoIntro?: string;
    price?: number;
    status?: string;
    organizationId?: string;
    materials?: CourseMaterialDto[];
    youtubeLinks?: string[];
}
