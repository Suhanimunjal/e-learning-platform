import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(req: any, createOrganizationDto: CreateOrganizationDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
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
            organizationId: string | null;
            createdAt: Date;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            published: boolean;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
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
            organizationId: string | null;
            createdAt: Date;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            published: boolean;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
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
            organizationId: string | null;
            createdAt: Date;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            published: boolean;
        }[];
    } & {
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    addUser(organizationId: string, userId: string, req: any): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
