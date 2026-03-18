import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoGenerationService {
  constructor(private prisma: PrismaService) {}

  async generateVideo(moduleId: string): Promise<any> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { section: { include: { course: true } } },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.type !== 'LESSON') {
      throw new BadRequestException('Video can only be generated for LESSON modules');
    }

    let videoGen = await this.prisma.videoGeneration.findUnique({
      where: { moduleId },
    });

    if (videoGen && videoGen.status === 'COMPLETED') {
      return videoGen;
    }

    try {
      if (!videoGen) {
        videoGen = await this.prisma.videoGeneration.create({
          data: {
            moduleId,
            script: '',
            status: 'PENDING',
          },
        });
      } else {
        await this.prisma.videoGeneration.update({
          where: { id: videoGen.id },
          data: { status: 'PENDING' },
        });
      }

      const script = await this.generateScript(module);
      await this.prisma.videoGeneration.update({
        where: { id: videoGen.id },
        data: {
          script,
          status: 'SCRIPT_GENERATED',
        },
      });

      const audioUrl = await this.generateAudio(script);
      await this.prisma.videoGeneration.update({
        where: { id: videoGen.id },
        data: {
          audioUrl,
          status: 'AUDIO_GENERATED',
        },
      });

      await this.prisma.videoGeneration.update({
        where: { id: videoGen.id },
        data: {
          videoUrl: audioUrl,
          status: 'COMPLETED',
        },
      });

      await this.prisma.module.update({
        where: { id: moduleId },
        data: {
          videoGenId: videoGen.id,
          hasVideo: true,
          videoUrl: audioUrl,
        },
      });

      return this.findByModuleId(moduleId);
    } catch (error) {
      await this.prisma.videoGeneration.update({
        where: { id: videoGen.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Video generation failed',
        },
      });
      throw error;
    }
  }

  private async generateScript(module: any): Promise<string> {
    if (module.textContent) {
      return this.convertToNarrativeScript(module.textContent, module.title);
    }

    const content = module.content as any;
    if (content?.description) {
      return this.convertToNarrativeScript(content.description, module.title);
    }

    return this.generateDefaultScript(module.title);
  }

  private convertToNarrativeScript(text: string, title: string): string {
    const intro = `Welcome to this lesson on ${title}. `;
    const body = text.replace(/<[^>]*>/g, '').trim();
    const summary = ` In summary, we covered ${title}. Thank you for watching.`;

    const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const narrative = sentences
      .slice(0, 20)
      .map(s => s.trim())
      .join('. ');

    return `${intro}${narrative}${summary}`;
  }

  private generateDefaultScript(title: string): string {
    return `Welcome to this lesson on ${title}. In this lesson, we will explore the key concepts and fundamentals of ${title}. We will cover the main topics, discuss important points, and provide examples to help you understand better. By the end of this lesson, you should have a clear understanding of ${title}. Let's begin our learning journey.`;
  }

  private async generateAudio(script: string): Promise<string> {
    const mockAudioUrl = `https://storage.example.com/audio/${Date.now()}.mp3`;
    return mockAudioUrl;
  }

  async findByModuleId(moduleId: string): Promise<any> {
    const videoGen = await this.prisma.videoGeneration.findUnique({
      where: { moduleId },
    });

    if (!videoGen) {
      throw new NotFoundException('Video generation not found for this module');
    }

    return videoGen;
  }

  async findById(id: string): Promise<any> {
    const videoGen = await this.prisma.videoGeneration.findUnique({
      where: { id },
    });

    if (!videoGen) {
      throw new NotFoundException('Video generation not found');
    }

    return videoGen;
  }

  async findAllByCourse(courseId: string): Promise<any[]> {
    const modules = await this.prisma.module.findMany({
      where: {
        section: { courseId },
      },
      include: {
        section: true,
      },
    });

    const moduleIds = modules.map(m => m.id);

    const videoGens = await this.prisma.videoGeneration.findMany({
      where: {
        moduleId: { in: moduleIds },
      },
    });

    return modules.map(module => {
      const videoGen = videoGens.find(vg => vg.moduleId === module.id);
      return {
        module,
        videoGen: videoGen || null,
      };
    });
  }

  async retry(id: string): Promise<any> {
    const videoGen = await this.prisma.videoGeneration.findUnique({
      where: { id },
    });

    if (!videoGen) {
      throw new NotFoundException('Video generation not found');
    }

    return this.generateVideo(videoGen.moduleId);
  }

  async getStats(): Promise<any> {
    const [total, pending, completed, failed] = await Promise.all([
      this.prisma.videoGeneration.count(),
      this.prisma.videoGeneration.count({ where: { status: 'PENDING' } }),
      this.prisma.videoGeneration.count({ where: { status: 'COMPLETED' } }),
      this.prisma.videoGeneration.count({ where: { status: 'FAILED' } }),
    ]);

    return { total, pending, completed, failed };
  }
}
