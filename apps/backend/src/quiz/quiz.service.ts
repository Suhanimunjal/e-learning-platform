import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto';
import { User, Role, ModuleType, ContentStatus } from '@prisma/client';

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

      // VALIDATION 1: Check module type is QUIZ
      if (module.type !== ModuleType.QUIZ) {
        throw new BadRequestException(
          `Module must be of type QUIZ to create a quiz. Current module type: ${module.type}`
        );
      }

      // VALIDATION 2: Check content approval status
      if (module.contentStatus !== ContentStatus.APPROVED) {
        throw new BadRequestException(
          `Module content must be approved before creating a quiz. Current status: ${module.contentStatus}. ` +
          `Please generate and approve the content first.`
        );
      }

      // VALIDATION 3: Check if quiz already exists for this module
      const existingQuiz = await this.prisma.quiz.findUnique({
        where: { moduleId: createQuizDto.moduleId },
      });

      if (existingQuiz) {
        throw new BadRequestException('Quiz already exists for this module. Delete the existing quiz to create a new one.');
      }

      // VALIDATION 4: Validate questions if provided
      if (createQuizDto.questions && createQuizDto.questions.length > 0) {
        for (let i = 0; i < createQuizDto.questions.length; i++) {
          const question = createQuizDto.questions[i];
          const questionIndex = i + 1;

          // Validate text
          if (!question.text || question.text.trim().length === 0) {
            throw new BadRequestException(`Question ${questionIndex}: Text cannot be empty`);
          }

          // Validate multiple choice requirements
          if (question.type === 'multiple_choice') {
            if (!question.options || question.options.length < 2) {
              throw new BadRequestException(
                `Question ${questionIndex}: Multiple choice questions must have at least 2 options`
              );
            }

            if (!question.correctAnswer) {
              throw new BadRequestException(`Question ${questionIndex}: Multiple choice questions must have a correct answer`);
            }

            if (!question.options.includes(question.correctAnswer)) {
              throw new BadRequestException(
                `Question ${questionIndex}: Correct answer must be one of the provided options`
              );
            }
          }

          // Validate short answer requirements
          if (question.type === 'short_answer') {
            if (!question.correctAnswer) {
              throw new BadRequestException(`Question ${questionIndex}: Short answer questions must have a correct answer`);
            }
          }
        }
      }

      // Create quiz and questions in a single atomic transaction (all or nothing)
      const quiz = await this.prisma.$transaction(async (tx) => {
        // Create quiz
        const newQuiz = await tx.quiz.create({
          data: {
            moduleId: createQuizDto.moduleId,
            title: createQuizDto.title,
            description: createQuizDto.description || '',
            timeLimit: createQuizDto.timeLimit || null,
            maxAttempts: createQuizDto.maxAttempts || 1,
            passingScore: createQuizDto.passingScore || 50,
            shuffleQuestions: createQuizDto.shuffleQuestions || false,
            published: false,
          },
          include: { questions: true },
        });

        // Add questions if provided (all in transaction - if any fails, all rollback)
        if (createQuizDto.questions && createQuizDto.questions.length > 0) {
          for (const question of createQuizDto.questions) {
            await tx.question.create({
              data: {
                quizId: newQuiz.id,
                type: question.type,
                text: question.text,
                options: question.options || [],
                correctAnswer: question.correctAnswer || '',
                points: question.points || 1,
                order: question.order || 0,
              },
            });
          }
        }

        return newQuiz;
      });

      return this.getQuiz(quiz.id, user);
    } catch (error) {
      console.error('Quiz creation error:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create quiz: ' + error?.message || 'Unknown error');
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
