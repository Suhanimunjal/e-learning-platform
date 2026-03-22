import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(req: any, createOrganizationDto: CreateOrganizationDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>;
    findAll(req: any): Promise<({
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            description: string;
            updatedAt: Date;
            slug: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            organizationId: string | null;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
            instructorId: string;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    })[] | ({
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            description: string;
            updatedAt: Date;
            slug: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            organizationId: string | null;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
            instructorId: string;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    })>;
    findOne(id: string, req: any): Promise<{
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        courses: {
            id: string;
            description: string;
            updatedAt: Date;
            slug: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            organizationId: string | null;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
            instructorId: string;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>;
    addUser(organizationId: string, userId: string, req: any): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>;
}
