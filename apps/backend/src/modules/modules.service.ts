import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { User, Role } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../analytics/services/analytics-tracking.service';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    private analyticsTracking: AnalyticsTrackingService,
  ) {}

  async create(createModuleDto: CreateModuleDto, user: User) {
    // Get section to check course ownership
    const section = await this.prisma.section.findUnique({
      where: { id: createModuleDto.sectionId },
      include: { course: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot create modules');
    }

    if (user.role === Role.TEACHER && section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only create modules for your own courses');
    }

    return this.prisma.module.create({
      data: createModuleDto,
    });
  }

  async findAll(sectionId: string, user: User) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check access
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: section.courseId,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    return this.prisma.module.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check access
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: module.section.courseId,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    // Track module view for students
    if (user.role === Role.STUDENT) {
      this.analyticsTracking.trackEvent(user.id, AnalyticsEventType.MODULE_VIEWED, {
        courseId: module.section.courseId,
        moduleId: module.id,
      }).catch(err => console.error('Analytics tracking error:', err));
    }

    return module;
  }

  async update(id: string, updateModuleDto: any, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot update modules');
    }

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only update modules for your own courses');
    }

    return this.prisma.module.update({
      where: { id },
      data: updateModuleDto,
    });
  }

  async remove(id: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot delete modules');
    }

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only delete modules for your own courses');
    }

    return this.prisma.module.delete({ where: { id } });
  }
}
