import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentGeneratorEnhancedService } from '../../ai/content-generator-enhanced.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { GenerateAiCourseDto } from '../dto/generate-ai-course.dto';

interface OutlineModule {
  title: string;
  description?: string;
  lessons: string[];
}

@Injectable()
export class AdminCourseGenerationService {
  constructor(
    private prisma: PrismaService,
    private contentGenerator: ContentGeneratorEnhancedService,
    private activityLogService: ActivityLogService,
  ) {}

  async startGeneration(input: GenerateAiCourseDto, adminUserId: string) {
    const courseName = input.courseName?.trim();
    const difficulty = input.difficulty?.trim();

    if (!courseName) {
      throw new BadRequestException('courseName is required');
    }

    if (!difficulty) {
      throw new BadRequestException('difficulty is required');
    }

    if (!Number.isInteger(input.moduleCount) || input.moduleCount < 10) {
      throw new BadRequestException('moduleCount must be an integer greater than or equal to 10');
    }

    const job = await this.prisma.aIGenerationJob.create({
      data: {
        type: 'course-generation',
        status: 'pending',
        input: {
          courseName,
          difficulty,
          moduleCount: input.moduleCount,
        },
        output: {
          progress: {
            totalModules: input.moduleCount,
            generatedModules: 0,
            percent: 0,
          },
        },
        version: 'gemini-2.0-flash',
        tenantId: adminUserId,
      },
    });

    void this.executeGeneration(job.id, courseName, difficulty, input.moduleCount, adminUserId);

    return {
      jobId: job.id,
      status: job.status,
    };
  }

  async getJob(jobId: string) {
    const job = await this.prisma.aIGenerationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Generation job not found');
    }

    return job;
  }

  private async executeGeneration(
    jobId: string,
    courseName: string,
    difficulty: string,
    moduleCount: number,
    adminUserId: string,
  ) {
    let courseId: string | undefined;

    try {
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: { status: 'running' },
      });

      const outline = await this.contentGenerator.generateCourseOutline(
        courseName,
        difficulty,
        moduleCount,
      );

      const modules = this.normalizeModules(outline, moduleCount);

      if (modules.length < moduleCount) {
        throw new Error(
          `Generated outline has ${modules.length} modules, but ${moduleCount} are required.`,
        );
      }

      const slug = await this.generateUniqueCourseSlug(courseName);
      const course = await this.prisma.course.create({
        data: {
          title: courseName,
          slug,
          description: `AI-generated ${difficulty} level course for ${courseName}`,
          instructorId: adminUserId,
          status: 'PENDING_APPROVAL',
        },
      });

      courseId = course.id;

      await this.activityLogService.log({
        action: 'COURSE_CREATED',
        entityType: 'COURSE',
        entityId: course.id,
        userId: adminUserId,
        targetUserId: adminUserId,
        metadata: {
          title: course.title,
          generatedBy: 'AI',
          difficulty,
          moduleCount,
          jobId,
        },
      });

      let generatedModules = 0;

      for (let idx = 0; idx < moduleCount; idx += 1) {
        const modulePlan = modules[idx];
        const section = await this.prisma.section.create({
          data: {
            courseId: course.id,
            title: `Module ${idx + 1}: ${modulePlan.title}`,
            order: idx,
          },
        });

        const module = await this.prisma.module.create({
          data: {
            sectionId: section.id,
            title: modulePlan.title,
            type: 'LESSON',
            order: 0,
            topic: modulePlan.lessons.join(', '),
            contentStatus: 'GENERATING',
          },
        });

        const generatedContent = await this.contentGenerator.generateFullContent(
          `${courseName}: ${modulePlan.title}. Lessons: ${modulePlan.lessons.join(', ')}`,
          modulePlan.title,
          difficulty,
        );

        await this.prisma.module.update({
          where: { id: module.id },
          data: {
            generatedContent: generatedContent as any,
            contentStatus: 'GENERATED',
            contentGeneratedAt: new Date(),
          },
        });

        generatedModules += 1;
        const percent = Math.round((generatedModules / moduleCount) * 100);

        await this.prisma.aIGenerationJob.update({
          where: { id: jobId },
          data: {
            output: {
              courseId: course.id,
              progress: {
                totalModules: moduleCount,
                generatedModules,
                percent,
              },
            },
          },
        });
      }

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: {
            courseId,
            progress: {
              totalModules: moduleCount,
              generatedModules: moduleCount,
              percent: 100,
            },
            completedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Course generation failed',
          output: {
            courseId,
            failedAt: new Date().toISOString(),
          },
        },
      });
    }
  }

  private normalizeModules(rawOutline: any, moduleCount: number): OutlineModule[] {
    const modulesCandidate = rawOutline?.modules || rawOutline?.course?.modules || [];

    if (!Array.isArray(modulesCandidate)) {
      return [];
    }

    const normalized = modulesCandidate
      .map((module: any, index: number): OutlineModule => {
        const title = String(
          module?.title || module?.module_title || module?.name || `Module ${index + 1}`,
        ).trim();

        const lessonsRaw = module?.lessons || module?.topics || [];
        const lessons = Array.isArray(lessonsRaw)
          ? lessonsRaw
              .map((lesson: any, lessonIndex: number) =>
                String(lesson?.title || lesson?.lesson_title || lesson || `Lesson ${lessonIndex + 1}`).trim(),
              )
              .filter(Boolean)
          : [];

        return {
          title,
          description: module?.description ? String(module.description) : undefined,
          lessons,
        };
      })
      .filter((module: OutlineModule) => module.title.length > 0);

    return normalized.slice(0, moduleCount);
  }

  private async generateUniqueCourseSlug(courseName: string): Promise<string> {
    const base = this.toSlug(courseName) || 'ai-course';
    let slug = base;
    let suffix = 1;

    while (await this.prisma.course.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
