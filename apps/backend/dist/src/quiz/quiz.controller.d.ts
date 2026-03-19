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
                    description: string;
                    updatedAt: Date;
                    organizationId: string | null;
                    createdAt: Date;
                    slug: string;
                    title: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                    published: boolean;
                };
            } & {
                id: string;
                title: string;
                courseId: string;
                order: number;
            };
        } & {
            id: string;
            title: string;
            order: number;
            sectionId: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
            topic: string | null;
            generatedContent: import("@prisma/client/runtime/client").JsonValue | null;
            contentStatus: import(".prisma/client").$Enums.ContentStatus;
            videoStatus: import(".prisma/client").$Enums.VideoStatus;
            audioUrl: string | null;
            transcript: string | null;
            voiceId: string | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
        };
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            userId: string;
            quizId: string;
            score: number | null;
            passed: boolean | null;
            answers: import("@prisma/client/runtime/client").JsonValue;
            percentage: number | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    getByModule(moduleId: string, req: any): Promise<{
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            userId: string;
            quizId: string;
            score: number | null;
            passed: boolean | null;
            answers: import("@prisma/client/runtime/client").JsonValue;
            percentage: number | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    getQuizzesByCourse(courseId: string, req: any): Promise<({
        module: {
            section: {
                id: string;
                title: string;
                courseId: string;
                order: number;
            };
        } & {
            id: string;
            title: string;
            order: number;
            sectionId: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
            topic: string | null;
            generatedContent: import("@prisma/client/runtime/client").JsonValue | null;
            contentStatus: import(".prisma/client").$Enums.ContentStatus;
            videoStatus: import(".prisma/client").$Enums.VideoStatus;
            audioUrl: string | null;
            transcript: string | null;
            voiceId: string | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
        };
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            userId: string;
            quizId: string;
            score: number | null;
            passed: boolean | null;
            answers: import("@prisma/client/runtime/client").JsonValue;
            percentage: number | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    })[]>;
    getQuiz(id: string, req: any): Promise<{
        module: {
            section: {
                course: {
                    id: string;
                    description: string;
                    updatedAt: Date;
                    organizationId: string | null;
                    createdAt: Date;
                    slug: string;
                    title: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                    published: boolean;
                };
            } & {
                id: string;
                title: string;
                courseId: string;
                order: number;
            };
        } & {
            id: string;
            title: string;
            order: number;
            sectionId: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            duration: number | null;
            isPreview: boolean;
            hasVideo: boolean;
            videoGenId: string | null;
            topic: string | null;
            generatedContent: import("@prisma/client/runtime/client").JsonValue | null;
            contentStatus: import(".prisma/client").$Enums.ContentStatus;
            videoStatus: import(".prisma/client").$Enums.VideoStatus;
            audioUrl: string | null;
            transcript: string | null;
            voiceId: string | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
        };
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
        attempts: {
            id: string;
            userId: string;
            quizId: string;
            score: number | null;
            passed: boolean | null;
            answers: import("@prisma/client/runtime/client").JsonValue;
            percentage: number | null;
            startedAt: Date;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    update(id: string, updateQuizDto: UpdateQuizDto, req: any): Promise<{
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    publish(id: string, req: any): Promise<{
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    unpublish(id: string, req: any): Promise<{
        questions: {
            id: string;
            order: number;
            type: string;
            quizId: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string | null;
            points: number;
        }[];
    } & {
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        createdAt: Date;
        title: string;
        published: boolean;
        moduleId: string;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
    }>;
    addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, req: any): Promise<{
        id: string;
        order: number;
        type: string;
        quizId: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    updateQuestion(questionId: string, updateQuestionDto: any, req: any): Promise<{
        id: string;
        order: number;
        type: string;
        quizId: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
    deleteQuestion(questionId: string, req: any): Promise<{
        id: string;
        order: number;
        type: string;
        quizId: string;
        text: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        points: number;
    }>;
}
