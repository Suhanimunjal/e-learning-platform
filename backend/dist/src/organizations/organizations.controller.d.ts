import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(req: any, createOrganizationDto: CreateOrganizationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(req: any): Promise<({
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            slug: string;
            title: string;
            approvedBy: string | null;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    })[] | ({
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            slug: string;
            title: string;
            approvedBy: string | null;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    })>;
    findOne(id: string, req: any): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            slug: string;
            title: string;
            approvedBy: string | null;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    addUser(organizationId: string, userId: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
