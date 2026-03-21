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
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            instructorId: string;
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
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            instructorId: string;
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
            organizationId: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            slug: string;
            title: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            instructorId: string;
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
