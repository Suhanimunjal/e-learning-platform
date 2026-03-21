"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let QuizService = class QuizService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuizDto, user) {
        try {
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
                throw new common_1.NotFoundException('Module not found');
            }
            if (user.role === client_1.Role.STUDENT) {
                throw new common_1.ForbiddenException('Students cannot create quizzes');
            }
            if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
                throw new common_1.ForbiddenException('You can only create quizzes for your own courses');
            }
            if (module.type !== client_1.ModuleType.QUIZ) {
                throw new common_1.BadRequestException(`Module must be of type QUIZ to create a quiz. Current module type: ${module.type}`);
            }
            if (module.contentStatus !== client_1.ContentStatus.APPROVED) {
                throw new common_1.BadRequestException(`Module content must be approved before creating a quiz. Current status: ${module.contentStatus}. ` +
                    `Please generate and approve the content first.`);
            }
            const existingQuiz = await this.prisma.quiz.findUnique({
                where: { moduleId: createQuizDto.moduleId },
            });
            if (existingQuiz) {
                throw new common_1.BadRequestException('Quiz already exists for this module. Delete the existing quiz to create a new one.');
            }
            if (createQuizDto.questions && createQuizDto.questions.length > 0) {
                for (let i = 0; i < createQuizDto.questions.length; i++) {
                    const question = createQuizDto.questions[i];
                    const questionIndex = i + 1;
                    if (!question.text || question.text.trim().length === 0) {
                        throw new common_1.BadRequestException(`Question ${questionIndex}: Text cannot be empty`);
                    }
                    if (question.type === 'multiple_choice') {
                        if (!question.options || question.options.length < 2) {
                            throw new common_1.BadRequestException(`Question ${questionIndex}: Multiple choice questions must have at least 2 options`);
                        }
                        if (!question.correctAnswer) {
                            throw new common_1.BadRequestException(`Question ${questionIndex}: Multiple choice questions must have a correct answer`);
                        }
                        if (!question.options.includes(question.correctAnswer)) {
                            throw new common_1.BadRequestException(`Question ${questionIndex}: Correct answer must be one of the provided options`);
                        }
                    }
                    if (question.type === 'short_answer') {
                        if (!question.correctAnswer) {
                            throw new common_1.BadRequestException(`Question ${questionIndex}: Short answer questions must have a correct answer`);
                        }
                    }
                }
            }
            const quiz = await this.prisma.$transaction(async (tx) => {
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
        }
        catch (error) {
            console.error('Quiz creation error:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create quiz: ' + error?.message || 'Unknown error');
        }
    }
    async getQuiz(quizId, user) {
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
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You do not have access to this quiz');
        }
        if (user.role === client_1.Role.STUDENT) {
            if (!quiz.published) {
                throw new common_1.ForbiddenException('This quiz is not yet published');
            }
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: quiz.module.section.course.id,
                    accessStatus: 'APPROVED',
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You must be enrolled in this course to access this quiz');
            }
        }
        return quiz;
    }
    async findByModule(moduleId, user) {
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
            throw new common_1.NotFoundException('Module not found');
        }
        if (user.role === client_1.Role.TEACHER && module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You do not have access to this module');
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
            throw new common_1.NotFoundException('Quiz not found for this module');
        }
        if (user.role === client_1.Role.STUDENT) {
            if (!quiz.published) {
                throw new common_1.ForbiddenException('This quiz is not yet published');
            }
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: module.section.course.id,
                    accessStatus: 'APPROVED',
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You must be enrolled in this course to access this quiz');
            }
        }
        return quiz;
    }
    async update(quizId, updateQuizDto, user) {
        const quiz = await this.getQuiz(quizId, user);
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own quizzes');
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
    async addQuestion(quizId, createQuestionDto, user) {
        const quiz = await this.getQuiz(quizId, user);
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only add questions to your own quizzes');
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
    async updateQuestion(questionId, updateQuestionDto, user) {
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
            throw new common_1.NotFoundException('Question not found');
        }
        if (user.role === client_1.Role.TEACHER && question.quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only update questions in your own quizzes');
        }
        return this.prisma.question.update({
            where: { id: questionId },
            data: updateQuestionDto,
        });
    }
    async deleteQuestion(questionId, user) {
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
            throw new common_1.NotFoundException('Question not found');
        }
        if (user.role === client_1.Role.TEACHER && question.quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete questions from your own quizzes');
        }
        return this.prisma.question.delete({
            where: { id: questionId },
        });
    }
    async publishQuiz(quizId, user) {
        const quiz = await this.getQuiz(quizId, user);
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only publish your own quizzes');
        }
        if (quiz.questions.length === 0) {
            throw new common_1.ForbiddenException('Quiz must have at least one question to be published');
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
    async unpublishQuiz(quizId, user) {
        const quiz = await this.getQuiz(quizId, user);
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only unpublish your own quizzes');
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
    async deleteQuiz(quizId, user) {
        const quiz = await this.getQuiz(quizId, user);
        if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete your own quizzes');
        }
        await this.prisma.question.deleteMany({
            where: { quizId },
        });
        return this.prisma.quiz.delete({
            where: { id: quizId },
        });
    }
    async getQuizzesByCourse(courseId, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === client_1.Role.TEACHER && course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You do not have access to this course');
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
    async startQuizAttempt(quizId, user) {
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
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (user.role === client_1.Role.STUDENT && !quiz.published) {
            throw new common_1.ForbiddenException('This quiz is not available');
        }
        if (user.role === client_1.Role.STUDENT) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: quiz.module.section.course.id,
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You must be enrolled in this course to take the quiz');
            }
        }
        const existingAttempts = await this.prisma.quizAttempt.count({
            where: {
                userId: user.id,
                quizId: quizId,
            },
        });
        if (existingAttempts >= quiz.maxAttempts) {
            throw new common_1.BadRequestException(`You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz`);
        }
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
    async submitQuizAttempt(quizId, user, answers, timeSpent) {
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
            throw new common_1.NotFoundException('Quiz not found');
        }
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
            throw new common_1.NotFoundException('No active quiz attempt found. Please start the quiz first.');
        }
        let totalScore = 0;
        let maxScore = 0;
        const gradedAnswers = {};
        for (const question of quiz.questions) {
            maxScore += question.points;
            const answer = answers.find(a => a.questionId === question.id);
            if (answer) {
                let isCorrect = false;
                if (question.type === 'multiple_choice') {
                    isCorrect = answer.answer === question.correctAnswer;
                }
                else if (question.type === 'short_answer' || question.type === 'essay') {
                    isCorrect = false;
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
        const updatedAttempt = await this.prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
                answers: answers,
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
    async getQuizAttempts(quizId, user) {
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
            throw new common_1.NotFoundException('Quiz not found');
        }
        const whereClause = { quizId };
        if (user.role === client_1.Role.STUDENT) {
            whereClause.userId = user.id;
        }
        else {
            if (user.role === client_1.Role.TEACHER && quiz.module.section.course.instructorId !== user.id) {
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
    async getQuizAttempt(quizId, attemptId, user) {
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
            throw new common_1.NotFoundException('Quiz attempt not found');
        }
        if (attempt.quizId !== quizId) {
            throw new common_1.NotFoundException('Quiz attempt does not belong to this quiz');
        }
        if (user.role === client_1.Role.STUDENT && attempt.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only view your own quiz attempts');
        }
        if (user.role === client_1.Role.TEACHER) {
            if (attempt.userId !== user.id && attempt.quiz.module.section.course.instructorId !== user.id) {
                throw new common_1.ForbiddenException('You do not have access to this quiz attempt');
            }
        }
        return attempt;
    }
    async getQuizSubmissions(quizId) {
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
            throw new common_1.NotFoundException('Quiz not found');
        }
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
        const latestAttemptsByStudent = new Map();
        for (const attempt of attempts) {
            if (!latestAttemptsByStudent.has(attempt.userId)) {
                latestAttemptsByStudent.set(attempt.userId, attempt);
            }
        }
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
            studentAnswers: Object.entries(attempt.answers || {}).map(([questionId, answerData]) => ({
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
    async gradeQuizAttempt(quizId, attemptId, grades, user) {
        const attempt = await this.getQuizAttempt(quizId, attemptId, user);
        const updatedAttempt = await this.prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                answers: {
                    ...attempt.answers,
                    teacherGrades: grades,
                },
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
    async getAllPendingSubmissions(user) {
        const teacherCourses = await this.prisma.course.findMany({
            where: { instructorId: user.id },
            select: { id: true, title: true },
        });
        const courseIds = teacherCourses.map(c => c.id);
        const quizzes = await this.prisma.quiz.findMany({
            where: {
                module: {
                    section: {
                        courseId: { in: courseIds },
                    },
                },
            },
            select: {
                id: true,
                title: true,
                module: {
                    select: {
                        title: true,
                        section: {
                            select: {
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const quizIds = quizzes.map(q => q.id);
        const attempts = await this.prisma.quizAttempt.findMany({
            where: {
                quizId: { in: quizIds },
                completedAt: { not: null },
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { completedAt: 'desc' },
        });
        const pendingSubmissions = attempts.map(attempt => {
            const quiz = quizzes.find(q => q.id === attempt.quizId);
            return {
                id: attempt.id,
                quizId: attempt.quizId,
                quizTitle: quiz?.title || 'Unknown Quiz',
                courseId: quiz?.module.section.course.id,
                courseTitle: quiz?.module.section.course.title || 'Unknown Course',
                userId: attempt.user.id,
                userName: attempt.user.name,
                userEmail: attempt.user.email,
                score: attempt.score,
                percentage: attempt.percentage,
                completedAt: attempt.completedAt,
                status: attempt.passed ? 'graded' : 'pending',
            };
        });
        return {
            submissions: pendingSubmissions,
            total: pendingSubmissions.length,
            pendingCount: pendingSubmissions.filter(s => s.status === 'pending').length,
        };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map