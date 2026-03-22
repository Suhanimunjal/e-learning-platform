import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { User } from '@prisma/client';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrganizationDto: CreateOrganizationDto, user: User): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(user: User): Promise<({
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
    findOne(id: string, user: User): Promise<{
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
    addUserToOrganization(organizationId: string, userId: string, user: User): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
