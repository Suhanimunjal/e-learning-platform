import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, user: User) {
    const data: any = {
      ...createCourseDto,
      instructorId: user.id,
    };

    if (user.role === Role.TEACHER || user.role === Role.MANAGER) {
      data.organizationId = user.organizationId;
    }

    return this.prisma.course.create({
      data,
    });
  }

  async findAll(user: User) {
    const where: any = { published: true };

    if (user) {
      if (user.role === Role.ADMIN) {
        // Admins can see all courses
      } else if (user.role === Role.MANAGER) {
        where.organizationId = user.organizationId;
      } else if (user.role === Role.TEACHER) {
        where.OR = [
          { instructorId: user.id },
          { organizationId: user.organizationId },
        ];
      } else if (user.role === Role.STUDENT) {
        // Students can see published courses
        where.organizationId = user.organizationId;
      }
    }
    // If no user (public), show only published courses

    return this.prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            modules: true,
          },
        },
      },
    });
  }

  async findOne(id: string, user: any) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: {
          include: {
            modules: true,
          },
        },
        enrollments: user ? {
          where: { userId: user.id },
        } : false,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is published for public access
    if (!course.published) {
      if (!user) {
        throw new ForbiddenException('Please login to view this course');
      }
      if (user.role === Role.STUDENT) {
        throw new ForbiddenException('You do not have access to this course');
      }
    }

    // Check enrollment for students
    const isEnrolled = user && course.enrollments && course.enrollments.length > 0;
    const isInstructor = user && course.instructorId === user.id;
    const isAdmin = user && user.role === Role.ADMIN;

    // For preview mode (logged in but not enrolled)
    if (user && !isEnrolled && !isInstructor && !isAdmin && user.role === Role.STUDENT) {
      // Return course with preview info
      return {
        ...course,
        isEnrolled: false,
        previewOnly: true,
        message: 'Please enroll to access full course content',
      };
    }

    return {
      ...course,
      isEnrolled,
      isInstructor,
      isAdmin,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: User) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot update courses');
    }

    if (user.role === Role.TEACHER && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only update your own courses');
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string, user: User) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot delete courses');
    }

    if (user.role === Role.TEACHER && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    return this.prisma.course.delete({ where: { id } });
  }
}
