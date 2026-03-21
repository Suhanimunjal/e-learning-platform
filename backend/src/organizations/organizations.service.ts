import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { User } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto, user: User) {
    // Check if slug is already taken
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: createOrganizationDto.slug },
    });

    if (existingOrg) {
      throw new ConflictException('Organization slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        users: {
          connect: { id: user.id },
        },
      },
    });
  }

  async findAll(user: User) {
    // Admins can see all organizations
    if (user.role === 'ADMIN') {
      return this.prisma.organization.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          courses: true,
        },
      });
    }

    // Others can only see their organization
    if (user.organizationId) {
      return this.prisma.organization.findUnique({
        where: { id: user.organizationId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          courses: true,
        },
      });
    }

    return [];
  }

  async findOne(id: string, user: User) {
    // Admins can see any organization
    if (user.role === 'ADMIN') {
      return this.prisma.organization.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          courses: true,
        },
      });
    }

    // Others can only see their own organization
    if (user.organizationId === id) {
      return this.prisma.organization.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          courses: true,
        },
      });
    }

    return null;
  }

  async addUserToOrganization(organizationId: string, userId: string, user: User) {
    // Only admins or organization managers can add users
    if (user.role !== 'ADMIN' && user.organizationId !== organizationId) {
      throw new Error('Not authorized');
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
  }
}
