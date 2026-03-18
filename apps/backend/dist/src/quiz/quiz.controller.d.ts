import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto } from './dto';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    create(req: any, createQuizDto: CreateQuizDto): Promise<{
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
    getByModule(moduleId: string, req: any): Promise<{
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
    getQuizzesByCourse(courseId: string, req: any): Promise<({
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
    getQuiz(id: string, req: any): Promise<{
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
    update(id: string, updateQuizDto: UpdateQuizDto, req: any): Promise<{
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
    publish(id: string, req: any): Promise<{
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
    unpublish(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, req: any): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    updateQuestion(questionId: string, updateQuestionDto: any, req: any): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    deleteQuestion(questionId: string, req: any): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
}
