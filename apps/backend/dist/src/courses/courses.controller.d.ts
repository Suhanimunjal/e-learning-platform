import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(req: any, createCourseDto: CreateCourseDto): Promise<{
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
    }>;
    findAll(req: any): Promise<({
        instructor: {
            id: string;
            name: string;
            email: string;
        };
        sections: ({
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
        })[];
    } & {
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
    })[]>;
    findOne(id: string, req: any): Promise<{
        isEnrolled: boolean;
        previewOnly: boolean;
        message: string;
        enrollments: {
            id: string;
            createdAt: Date;
            courseId: string;
            userId: string;
            accessStatus: string;
        }[];
        instructor: {
            id: string;
            name: string;
            email: string;
        };
        sections: ({
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
        })[];
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
    } | {
        isEnrolled: boolean;
        isInstructor: boolean;
        isAdmin: boolean;
        enrollments: {
            id: string;
            createdAt: Date;
            courseId: string;
            userId: string;
            accessStatus: string;
        }[];
        instructor: {
            id: string;
            name: string;
            email: string;
        };
        sections: ({
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
        })[];
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
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto, req: any): Promise<{
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
    }>;
    remove(id: string, req: any): Promise<{
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
    }>;
}
