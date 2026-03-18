import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, user: User) {
    try {
      // Get module to check if it exists and verify course ownership
      const module = await this.prisma.module.findUnique({
        where: { id: createQuizDto.moduleId },
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
        throw new ForbiddenException('Students cannot create quizzes');
      }

      if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
        throw new ForbiddenException('You can only create quizzes for your own courses');
      }

      // Create quiz
      const quiz = await this.prisma.quiz.create({
        data: {
          moduleId: createQuizDto.moduleId,
          title: createQuizDto.title,
          description: createQuizDto.description,
          timeLimit: createQuizDto.timeLimit,
          maxAttempts: createQuizDto.maxAttempts || 1,
          passingScore: createQuizDto.passingScore || 50,
          shuffleQuestions: createQuizDto.shuffleQuestions || false,
          published: false,
        },
        include: { questions: true },
      });

      // Add questions if provided
      if (createQuizDto.questions && createQuizDto.questions.length > 0) {
        for (const question of createQuizDto.questions) {
          await this.prisma.question.create({
            data: {
              quizId: quiz.id,
              type: question.type,
              text: question.text,
              options: question.options,
              correctAnswer: question.correctAnswer,
              points: question.points || 1,
            },
          });
        }
      }

      return this.getQuiz(quiz.id, user);
    } catch (error) {
      console.error('Quiz creation error:', error);
      throw error;
    }
  }

  async getQuiz(quizId: string, user: User) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: {
          include: {
            section: {
              include: {
                course: true,
              },
            },
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
        attempts: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check access
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    if (user.role === Role.STUDENT) {
      // Students can only see published quizzes
      if (!quiz.published) {
        throw new ForbiddenException('This quiz is not yet published');
      }
    }

    return quiz;
  }

  async findByModule(moduleId: string, user: User) {
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

    // Check access
    if (user.role === Role.TEACHER && module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You do not have access to this module');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { moduleId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        attempts: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found for this module');
    }

    // Students can only see published quizzes
    if (user.role === Role.STUDENT && !quiz.published) {
      throw new ForbiddenException('This quiz is not yet published');
    }

    return quiz;
  }

  async update(quizId: string, updateQuizDto: UpdateQuizDto, user: User) {
    const quiz = await this.getQuiz(quizId, user);

    // Check permissions
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only update your own quizzes');
    }

    const updated = await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: updateQuizDto.title || quiz.title,
        description: updateQuizDto.description !== undefined ? updateQuizDto.description : quiz.description,
        timeLimit: updateQuizDto.timeLimit !== undefined ? updateQuizDto.timeLimit : quiz.timeLimit,
        maxAttempts: updateQuizDto.maxAttempts || quiz.maxAttempts,
        passingScore: updateQuizDto.passingScore || quiz.passingScore,
        shuffleQuestions: updateQuizDto.shuffleQuestions !== undefined ? updateQuizDto.shuffleQuestions : quiz.shuffleQuestions,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return updated;
  }

  async addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, user: User) {
    const quiz = await this.getQuiz(quizId, user);

    // Check permissions
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only add questions to your own quizzes');
    }

    const question = await this.prisma.question.create({
      data: {
        quizId,
        type: createQuestionDto.type,
        text: createQuestionDto.text,
        options: createQuestionDto.options,
        correctAnswer: createQuestionDto.correctAnswer,
        points: createQuestionDto.points || 1,
        order: createQuestionDto.order || 0,
      },
    });

    return question;
  }

  async updateQuestion(questionId: string, updateQuestionDto: any, user: User) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            module: {
              include: {
                section: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check permissions
    if (user.role === Role.TEACHER && question.quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only update questions in your own quizzes');
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: updateQuestionDto,
    });
  }

  async deleteQuestion(questionId: string, user: User) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            module: {
              include: {
                section: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check permissions
    if (user.role === Role.TEACHER && question.quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only delete questions from your own quizzes');
    }

    return this.prisma.question.delete({
      where: { id: questionId },
    });
  }

  async publishQuiz(quizId: string, user: User) {
    const quiz = await this.getQuiz(quizId, user);

    // Check permissions
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only publish your own quizzes');
    }

    // Check if quiz has questions
    if (quiz.questions.length === 0) {
      throw new ForbiddenException('Quiz must have at least one question to be published');
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: { published: true },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async unpublishQuiz(quizId: string, user: User) {
    const quiz = await this.getQuiz(quizId, user);

    // Check permissions
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only unpublish your own quizzes');
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: { published: false },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteQuiz(quizId: string, user: User) {
    const quiz = await this.getQuiz(quizId, user);

    // Check permissions
    if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
      throw new ForbiddenException('You can only delete your own quizzes');
    }

    // Delete all questions first
    await this.prisma.question.deleteMany({
      where: { quizId },
    });

    // Delete quiz
    return this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  async getQuizzesByCourse(courseId: string, user: User) {
    // Check access to course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === Role.TEACHER && course.instructorId !== user.id) {
      throw new ForbiddenException('You do not have access to this course');
    }

    return this.prisma.quiz.findMany({
      where: {
        module: {
          section: {
            courseId,
          },
        },
      },
      include: {
        module: {
          include: {
            section: true,
          },
        },
        questions: true,
        attempts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
