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
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
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
    addUserToOrganization(organizationId: string, userId: string, user: User): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        slug: string;
        domain: string | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
    }>;
}
