import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { User } from '@prisma/client';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrganizationDto: CreateOrganizationDto, user: User): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(user: User): Promise<({
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
    findOne(id: string, user: User): Promise<{
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
    addUserToOrganization(organizationId: string, userId: string, user: User): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
