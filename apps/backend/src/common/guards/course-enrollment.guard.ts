import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class CourseEnrollmentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Get course ID from params or body
    const params = request.params || {};
    const body = request.body || {};
    let courseId = params.courseId || params.id || body.courseId;
    
    // If still not found, check if we can infer from module/section routes
    if (!courseId && request.params.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: request.params.sectionId },
        select: { courseId: true },
      });
      if (section) courseId = section.courseId;
    }
    
    if (!courseId) {
      // If no course ID is found, skip this guard (might be a list route)
      return true;
    }

    // Admins and Managers can access everything
    if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
      return true;
    }

    // Teachers can access their own courses
    if (user.role === Role.TEACHER) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });
      
      if (course && course.instructorId === user.id) {
        return true;
      }
    }

    // Students must be enrolled
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: courseId,
        },
      });

      if (enrollment) {
        return true;
      }
    }

    throw new ForbiddenException('You do not have access to this course');
  }
}
