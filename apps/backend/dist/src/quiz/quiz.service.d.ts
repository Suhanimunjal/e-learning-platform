import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto';
import { User } from '@prisma/client';
export declare class QuizService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createQuizDto: CreateQuizDto, user: User): Promise<{
        module: {
            section: {
                course: {
                    id: string;
                    organizationId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string;
                    published: boolean;
                    slug: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                };
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            };
        } & {
            id: string;
            title: string;
            order: number;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
        };
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            quizId: string;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    getQuiz(quizId: string, user: User): Promise<{
        module: {
            section: {
                course: {
                    id: string;
                    organizationId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string;
                    published: boolean;
                    slug: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                };
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            };
        } & {
            id: string;
            title: string;
            order: number;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
        };
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            quizId: string;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    findByModule(moduleId: string, user: User): Promise<{
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            quizId: string;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    update(quizId: string, updateQuizDto: UpdateQuizDto, user: User): Promise<{
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, user: User): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    updateQuestion(questionId: string, updateQuestionDto: any, user: User): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    deleteQuestion(questionId: string, user: User): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    publishQuiz(quizId: string, user: User): Promise<{
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    unpublishQuiz(quizId: string, user: User): Promise<{
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    deleteQuiz(quizId: string, user: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    }>;
    getQuizzesByCourse(courseId: string, user: User): Promise<({
        module: {
            section: {
                id: string;
                title: string;
                order: number;
                courseId: string;
            };
        } & {
            id: string;
            title: string;
            order: number;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
        };
        questions: {
            id: string;
            order: number;
            quizId: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            quizId: string;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
        moduleId: string;
    })[]>;
}
