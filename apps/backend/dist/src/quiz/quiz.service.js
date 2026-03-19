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
        if (user.role === client_1.Role.STUDENT && !quiz.published) {
            throw new common_1.ForbiddenException('This quiz is not yet published');
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
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map