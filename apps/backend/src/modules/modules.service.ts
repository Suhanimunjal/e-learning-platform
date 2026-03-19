import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { User, Role, ContentStatus, VideoStatus } from '@prisma/client';
import { AnalyticsTrackingService, AnalyticsEventType } from '../analytics/services/analytics-tracking.service';
import { TTSService } from '../ai/tts.service';
import { ContentGeneratorEnhancedService, StructuredContent } from '../ai/content-generator-enhanced.service';
import { QuizVerificationService } from '../ai/quiz-verification.service';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    private analyticsTracking: AnalyticsTrackingService,
    private ttsService: TTSService,
    private contentGenerator: ContentGeneratorEnhancedService,
    private quizVerifier: QuizVerificationService,
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

  async generateContent(moduleId: string, topic: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    await this.prisma.module.update({
      where: { id: moduleId },
      data: {
        topic,
        contentStatus: ContentStatus.GENERATING,
      },
    });

    try {
      const content = await this.contentGenerator.generateFullContent(topic, module.title);

      await this.prisma.module.update({
        where: { id: moduleId },
        data: {
          generatedContent: content as any,
          contentStatus: ContentStatus.GENERATED,
          contentGeneratedAt: new Date(),
        },
      });

      // Return standardized format
      return {
        status: 'GENERATED',
        content: content as any,
        audioUrl: null,
        videoUrl: null,
        quiz: content.quiz?.questions || [],
        assignment: content.assignment || null,
      };
    } catch (error) {
      console.error('Content generation error:', error);
      await this.prisma.module.update({
        where: { id: moduleId },
        data: {
          contentStatus: ContentStatus.PENDING,
        },
      });
      const message = error?.message || 'Failed to generate content';
      throw new BadRequestException(message);
    }
  }

  async updateContent(moduleId: string, content: Partial<StructuredContent>, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    const existingContent = module.generatedContent as any || {};
    const updatedContent = { ...existingContent, ...content };

    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        generatedContent: updatedContent as any,
        contentStatus: ContentStatus.GENERATED,
      },
    });
  }

  async approveContent(moduleId: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    if (module.contentStatus !== ContentStatus.GENERATED) {
      throw new BadRequestException('Content must be generated before approval');
    }

    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        contentStatus: ContentStatus.APPROVED,
        videoStatus: VideoStatus.PENDING,
      },
    });
  }

  async getVideoStatus(moduleId: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Return standardized format with hasVideo flag
    return {
      moduleId: module.id,
      topic: module.topic,
      content: module.generatedContent,
      contentStatus: module.contentStatus,
      videoStatus: module.videoStatus,
      audioUrl: module.audioUrl,
      videoUrl: module.videoUrl,
      transcript: module.transcript,
      retryCount: module.retryCount,
      canRetry: module.retryCount < 2,
      canGenerateVideo: module.contentStatus === ContentStatus.APPROVED,
      hasVideo: module.hasVideo, // CRITICAL: Include hasVideo flag
    };
  }

  async generateVideo(moduleId: string, voiceId: string | undefined, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    if (module.contentStatus !== ContentStatus.APPROVED) {
      throw new BadRequestException('Content must be approved before video generation');
    }

    if (module.retryCount >= 2) {
      throw new BadRequestException('Maximum retry limit reached. Please regenerate content.');
    }

    const selectedVoice = voiceId 
      ? this.ttsService.getVoiceById(voiceId)
      : this.ttsService.getAvailableVoices()[0];

    if (!selectedVoice) {
      throw new BadRequestException('Invalid voice selected');
    }

    await this.prisma.module.update({
      where: { id: moduleId },
      data: {
        videoStatus: VideoStatus.GENERATING,
        voiceId: selectedVoice.id,
      },
    });

    try {
      const content = module.generatedContent as unknown as StructuredContent;
      const narrativeText = this.contentGenerator.convertToNarrativeText(content);
      
      const audioResult = await this.ttsService.generateAudio(narrativeText, {
        languageCode: selectedVoice.languageCode,
        name: selectedVoice.name,
        ssmlGender: selectedVoice.gender as any,
      });

      // Update module with audio and set hasVideo = true
      await this.prisma.module.update({
        where: { id: moduleId },
        data: {
          audioUrl: audioResult.audioUrl,
          transcript: audioResult.transcript,
          videoUrl: audioResult.audioUrl, // Using audio URL as video URL for now
          videoStatus: VideoStatus.APPROVED,
          videoGeneratedAt: new Date(),
          hasVideo: true, // CRITICAL FIX: Set hasVideo flag to true
        },
      });

      // Return standardized format
      return {
        status: 'COMPLETED',
        content: content as any,
        audioUrl: audioResult.audioUrl,
        videoUrl: audioResult.audioUrl,
        duration: audioResult.duration,
        transcript: audioResult.transcript,
        quiz: content.quiz?.questions || [],
        assignment: content.assignment || null,
      };
    } catch (error) {
      await this.prisma.module.update({
        where: { id: moduleId },
        data: {
          videoStatus: VideoStatus.FAILED,
        },
      });
      throw error;
    }
  }

  async getVideoPreview(moduleId: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (!module.audioUrl) {
      throw new BadRequestException('Video not yet generated');
    }

    return {
      audioUrl: module.audioUrl,
      transcript: module.transcript,
    };
  }

  async approveVideo(moduleId: string, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        section: {
          include: {
            course: {
              include: {
                sections: {
                  include: {
                    modules: {
                      orderBy: { order: 'asc' },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    if (module.videoStatus !== VideoStatus.APPROVED) {
      throw new BadRequestException('Video must be generated before approval');
    }

    const allModules = module.section.course.sections.flatMap(s => s.modules);
    const currentIndex = allModules.findIndex(m => m.id === moduleId);
    const nextModule = allModules[currentIndex + 1];

    if (nextModule && nextModule.contentStatus === ContentStatus.PENDING) {
      await this.prisma.module.update({
        where: { id: nextModule.id },
        data: {
          contentStatus: ContentStatus.PENDING,
        },
      });
    }

    return {
      status: 'APPROVED',
      moduleComplete: true,
      nextModuleUnlocked: !!nextModule,
      nextModuleId: nextModule?.id,
    };
  }

  async rejectVideo(moduleId: string, reason: string | undefined, user: User) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own course modules');
    }

    if (module.retryCount >= 2) {
      throw new BadRequestException('Maximum retry limit reached');
    }

    const newRetryCount = module.retryCount + 1;

    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        videoStatus: VideoStatus.PENDING,
        retryCount: newRetryCount,
        rejectionReason: reason,
        audioUrl: null,
        transcript: null,
      },
    });
  }

  getAvailableVoices() {
    return this.ttsService.getAvailableVoices();
  }
}
