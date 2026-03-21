import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User, Role } from '@prisma/client';
import { ActivityLogService } from '../common/services/activity-log.service';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: User) {
    const data: any = {
      ...createCourseDto,
      instructorId: user.id,
    };

    if (user.role === Role.TEACHER || user.role === Role.MANAGER) {
      data.organizationId = user.organizationId;
    }

    const course = await this.prisma.course.create({
      data,
    });

    await this.activityLogService.log({
      action: 'COURSE_CREATED',
      entityType: 'COURSE',
      entityId: course.id,
      userId: user.id,
      targetUserId: user.id,
      metadata: { title: course.title },
    });

    return course;
  }

  async findAll(user: User) {
    const where: any = {};

    if (user) {
      if (user.role === Role.ADMIN) {
        // Admins can see all courses (no filter)
      } else if (user.role === Role.MANAGER) {
        where.organizationId = user.organizationId;
        where.status = 'APPROVED';
      } else if (user.role === Role.TEACHER) {
        where.instructorId = user.id;
      } else if (user.role === Role.STUDENT) {
        where.status = 'APPROVED';
        where.organizationId = user.organizationId;
      }
    } else {
      where.status = 'APPROVED';
    }

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

    // Check if course is approved for public access
    if (course.status !== 'APPROVED') {
      if (!user) {
        throw new ForbiddenException('Please login to view this course');
      }
      
      // Teachers can see their own pending/rejected courses
      // Admins can see all courses
      const isInstructor = user && course.instructorId === user.id;
      const isAdmin = user && user.role === Role.ADMIN;
      
      if (user.role === Role.STUDENT && !isInstructor && !isAdmin) {
        throw new ForbiddenException('You do not have access to this course');
      }
    }

    // Check enrollment for students
    const isEnrolled = user && course.enrollments && course.enrollments.length > 0;
    const isInstructor = user && course.instructorId === user.id;
    const isAdmin = user && user.role === Role.ADMIN;

    // For preview mode (logged in but not enrolled)
    if (user && !isEnrolled && !isInstructor && !isAdmin && user.role === Role.STUDENT) {
      await this.activityLogService.log({
        action: 'COURSE_ACCESSED',
        entityType: 'COURSE',
        entityId: course.id,
        userId: user.id,
        targetUserId: course.instructorId,
        metadata: { title: course.title, previewOnly: true },
      });

      // Return course with preview info
      return {
        ...course,
        isEnrolled: false,
        previewOnly: true,
        message: 'Please enroll to access full course content',
      };
    }

    if (user) {
      await this.activityLogService.log({
        action: 'COURSE_ACCESSED',
        entityType: 'COURSE',
        entityId: course.id,
        userId: user.id,
        targetUserId: course.instructorId,
        metadata: { title: course.title, previewOnly: false },
      });
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
