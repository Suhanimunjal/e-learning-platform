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
      
      // Check if student is enrolled in the course
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: quiz.module.section.course.id,
          accessStatus: 'APPROVED',
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled in this course to access this quiz');
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

    // Students can only see published quizzes and must be enrolled
    if (user.role === Role.STUDENT) {
      if (!quiz.published) {
        throw new ForbiddenException('This quiz is not yet published');
      }
      
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: module.section.course.id,
          accessStatus: 'APPROVED',
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled in this course to access this quiz');
      }
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

  async startQuizAttempt(quizId: string, user: User) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
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
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (user.role === Role.STUDENT && !quiz.published) {
      throw new ForbiddenException('This quiz is not available');
    }

    // Check if user is enrolled (for students)
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: quiz.module.section.course.id,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled in this course to take the quiz');
      }
    }

    // Check max attempts
    const existingAttempts = await this.prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId: quizId,
      },
    });

    if (existingAttempts >= quiz.maxAttempts) {
      throw new BadRequestException(`You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz`);
    }

    // Create a new attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        answers: {},
        startedAt: new Date(),
      },
    });

    return {
      attemptId: attempt.id,
      quizId: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        id: q.id,
        type: q.type,
        text: q.text,
        options: q.options,
        points: q.points,
      })),
      timeLimit: quiz.timeLimit,
      maxAttempts: quiz.maxAttempts,
      currentAttempt: existingAttempts + 1,
      startedAt: attempt.startedAt,
    };
  }

  async submitQuizAttempt(
    quizId: string,
    user: User,
    answers: { questionId: string; answer: string | string[] }[],
    timeSpent: number,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
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
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Find the user's latest attempt
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId: quizId,
        completedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!attempt) {
      throw new NotFoundException('No active quiz attempt found. Please start the quiz first.');
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers: Record<string, { earned: number; max: number; correct: boolean }> = {};

    for (const question of quiz.questions) {
      maxScore += question.points;
      const answer = answers.find(a => a.questionId === question.id);
      
      if (answer) {
        let isCorrect = false;
        
        if (question.type === 'multiple_choice') {
          isCorrect = answer.answer === question.correctAnswer;
        } else if (question.type === 'short_answer' || question.type === 'essay') {
          // For short answer/essay, we'll mark as pending teacher grading
          // or use AI grading later
          isCorrect = false; // Needs manual/AI grading
        }

        const earnedPoints = isCorrect ? question.points : 0;
        totalScore += earnedPoints;
        
        gradedAnswers[question.id] = {
          earned: earnedPoints,
          max: question.points,
          correct: isCorrect,
        };
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Update the attempt
    const updatedAttempt = await this.prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: answers as any,
        score: totalScore,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        completedAt: new Date(),
      },
    });

    return {
      attemptId: updatedAttempt.id,
      score: totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      passingScore: quiz.passingScore,
      completedAt: updatedAttempt.completedAt,
      gradedAnswers,
      timeSpent,
    };
  }

  async getQuizAttempts(quizId: string, user: User) {
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
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // For students, only return their own attempts
    // For teachers/admins, return all attempts
    const whereClause: any = { quizId };
    
    if (user.role === Role.STUDENT) {
      whereClause.userId = user.id;
    } else {
      // Check if teacher owns the course
      if (user.role === Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
        whereClause.userId = user.id;
      }
    }

    const attempts = await this.prisma.quizAttempt.findMany({
      where: whereClause,
      orderBy: { startedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return attempts;
  }

  async getQuizAttempt(quizId: string, attemptId: string, user: User) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
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

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.quizId !== quizId) {
      throw new NotFoundException('Quiz attempt does not belong to this quiz');
    }

    // Students can only view their own attempts
    if (user.role === Role.STUDENT && attempt.userId !== user.id) {
      throw new ForbiddenException('You can only view your own quiz attempts');
    }

    // Teachers can only view attempts for their courses
    if (user.role === Role.TEACHER) {
      if (attempt.userId !== user.id && attempt.quiz.module.section.course.instructorId !== user.id) {
        throw new ForbiddenException('You do not have access to this quiz attempt');
      }
    }

    return attempt;
  }

  async getQuizSubmissions(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
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
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Get all completed attempts
    const attempts = await this.prisma.quizAttempt.findMany({
      where: {
        quizId,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by student, keeping only the latest attempt per student
    const latestAttemptsByStudent = new Map<string, any>();
    for (const attempt of attempts) {
      if (!latestAttemptsByStudent.has(attempt.userId)) {
        latestAttemptsByStudent.set(attempt.userId, attempt);
      }
    }

    // Format submissions for grading dashboard
    const submissions = Array.from(latestAttemptsByStudent.values()).map(attempt => ({
      id: attempt.id,
      studentId: attempt.user.id,
      studentName: attempt.user.name,
      studentEmail: attempt.user.email,
      quizTitle: quiz.title,
      courseName: quiz.module.section.course.title,
      questions: quiz.questions.map(q => ({
        id: q.id,
        type: q.type,
        questionText: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
      studentAnswers: Object.entries(attempt.answers as Record<string, { answer: string | string[] }> || {}).map(([questionId, answerData]) => ({
        id: questionId,
        answer: answerData.answer,
      })),
      submittedAt: attempt.completedAt,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      status: attempt.passed ? 'graded' : 'pending',
    }));

    return {
      quiz,
      submissions,
      totalSubmissions: submissions.length,
      gradedCount: submissions.filter(s => s.passed).length,
      pendingCount: submissions.filter(s => !s.passed).length,
    };
  }

  async gradeQuizAttempt(
    quizId: string,
    attemptId: string,
    grades: Record<string, { points: number; feedback: string }>,
    user: User,
  ) {
    const attempt = await this.getQuizAttempt(quizId, attemptId, user);

    // Update the attempt with the grades
    const updatedAttempt = await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        answers: {
          ...(attempt.answers as object),
          teacherGrades: grades,
        } as any,
        score: Object.values(grades).reduce((sum, g) => sum + g.points, 0),
      },
    });

    return {
      success: true,
      attemptId: updatedAttempt.id,
      grades,
      finalScore: updatedAttempt.score,
    };
  }
}
