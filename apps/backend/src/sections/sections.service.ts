import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto, user: User) {
    const course = await this.prisma.course.findUnique({
      where: { id: createSectionDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot create sections');
    }

    if (user.role === Role.TEACHER && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only create sections for your own courses');
    }

    return this.prisma.section.create({
      data: createSectionDto,
    });
  }

  async findAll(courseId: string, user: User) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check access
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: courseId,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    return this.prisma.section.findMany({
      where: { courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, updateSectionDto: any, user: User) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot update sections');
    }

    if (user.role === Role.TEACHER && section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only update sections for your own courses');
    }

    return this.prisma.section.update({
      where: { id },
      data: updateSectionDto,
    });
  }

  async remove(id: string, user: User) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot delete sections');
    }

    if (user.role === Role.TEACHER && section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only delete sections for your own courses');
    }

    return this.prisma.section.delete({ where: { id } });
  }
}
