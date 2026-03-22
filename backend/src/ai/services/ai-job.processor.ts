import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OllamaService } from './ollama.service';

@Processor('ai-jobs')
export class AiJobProcessor {
  private readonly logger = new Logger(AiJobProcessor.name);

  constructor(
    private prisma: PrismaService,
    private ollamaService: OllamaService,
  ) {}

  @Process('generate-outline')
  async generateOutline(job: Job<{ topic: string; jobId: string }>) {
    const { topic, jobId } = job.data;

    try {
      // Update job status
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: { status: 'processing' },
      });

      // Generate outline
      const outlinePrompt = `Generate a course outline for: ${topic}. Return JSON with structure: { "title": "Course Title", "description": "...", "modules": [{ "title": "...", "description": "..." }] }`;
      const outline = await this.ollamaService.generateStructuredResponse(outlinePrompt);

      // Update job with result
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: outline,
        },
      });

      return outline;
    } catch (error) {
      this.logger.error('Error in generate-outline job:', error);

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    }
  }

  @Process('generate-lessons')
  async generateLessons(job: Job<{ courseId: string; jobId: string }>) {
    const { courseId, jobId } = job.data;

    try {
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: { status: 'processing' },
      });

      // Get course with sections and modules
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          sections: {
            include: {
              modules: true,
            },
          },
        },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Generate content for each lesson module
      for (const section of course.sections) {
        for (const module of section.modules) {
          if (module.type === 'LESSON' && !module.textContent) {
            const lessonPrompt = `Generate lesson content for section "${section.title}", lesson "${module.title}". Return JSON with: { "content": "detailed lesson text", "duration": "estimated minutes" }`;
            const content = await this.ollamaService.generateStructuredResponse(lessonPrompt);

            await this.prisma.module.update({
              where: { id: module.id },
              data: {
                textContent: content.content,
                duration: content.duration,
              },
            });
          }
        }
      }

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: { message: 'Lessons generated successfully' },
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error in generate-lessons job:', error);

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    }
  }

  @Process('generate-quiz')
  async generateQuiz(job: Job<{ moduleId: string; jobId: string }>) {
    const { moduleId, jobId } = job.data;

    try {
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: { status: 'processing' },
      });

      // Get the lesson module
      const lessonModule = await this.prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          section: true,
        },
      });

      if (!lessonModule || lessonModule.type !== 'LESSON') {
        throw new Error('Lesson module not found');
      }

      if (!lessonModule.textContent) {
        throw new Error('Lesson content not generated yet');
      }

      // Generate quiz
      const quizPrompt = `Generate a quiz for this lesson. Return JSON: { "title": "Quiz Title", "description": "...", "questions": [{ "type": "multiple_choice", "text": "Question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }] }`;
      const quizData = await this.ollamaService.generateStructuredResponse(quizPrompt);

      // Create Quiz Module
      const quizModule = await this.prisma.module.create({
        data: {
          title: `Quiz: ${lessonModule.title}`,
          sectionId: lessonModule.sectionId,
          type: 'QUIZ',
          order: lessonModule.order + 1,
        },
      });

      // Create Quiz record
      const quiz = await this.prisma.quiz.create({
        data: {
          moduleId: quizModule.id,
          title: quizData.title,
          description: quizData.description,
          maxAttempts: 1,
          passingScore: 50,
        },
      });

      // Create Questions
      for (const q of quizData.questions) {
        await this.prisma.question.create({
          data: {
            quizId: quiz.id,
            type: q.type,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 1,
          },
        });
      }

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: { message: 'Quiz generated successfully', moduleId: quizModule.id },
        },
      });

      return { success: true, moduleId: quizModule.id };
    } catch (error) {
      this.logger.error('Error in generate-quiz job:', error);

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    }
  }

  @Process('generate-flashcards')
  async generateFlashcards(job: Job<{ moduleId: string; jobId: string }>) {
    const { moduleId, jobId } = job.data;

    try {
      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: { status: 'processing' },
      });

      // Get the lesson module
      const lessonModule = await this.prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          section: true,
        },
      });

      if (!lessonModule || lessonModule.type !== 'LESSON') {
        throw new Error('Lesson module not found');
      }

      if (!lessonModule.textContent) {
        throw new Error('Lesson content not generated yet');
      }

      // Generate flashcards
      const flashcardPrompt = `Generate 10 flashcards. Return JSON array: [{ "front": "question", "back": "answer" }]`;
      const flashcardsData = await this.ollamaService.generateStructuredResponse(flashcardPrompt);

      // Create Flashcard Module
      const flashcardModule = await this.prisma.module.create({
        data: {
          title: `Flashcards: ${lessonModule.title}`,
          sectionId: lessonModule.sectionId,
          type: 'LESSON', // Using LESSON type but storing flashcards in content
          order: lessonModule.order + 1,
          content: flashcardsData, // Store flashcards in JSON content
        },
      });

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: { message: 'Flashcards generated successfully', moduleId: flashcardModule.id },
        },
      });

      return { success: true, moduleId: flashcardModule.id };
    } catch (error) {
      this.logger.error('Error in generate-flashcards job:', error);

      await this.prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      throw error;
    }
  }
}
