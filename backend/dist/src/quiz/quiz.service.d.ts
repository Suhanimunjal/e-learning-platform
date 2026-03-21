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
                    status: import(".prisma/client").$Enums.CourseStatus;
                    organizationId: string | null;
                    rejectionReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string;
                    approvedBy: string | null;
                    slug: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                };
            } & {
                id: string;
                order: number;
                title: string;
                courseId: string;
            };
        } & {
            id: string;
            rejectionReason: string | null;
            order: number;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
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
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
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
            userId: string;
            quizId: string;
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
                    status: import(".prisma/client").$Enums.CourseStatus;
                    organizationId: string | null;
                    rejectionReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string;
                    approvedBy: string | null;
                    slug: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                };
            } & {
                id: string;
                order: number;
                title: string;
                courseId: string;
            };
        } & {
            id: string;
            rejectionReason: string | null;
            order: number;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
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
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
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
            userId: string;
            quizId: string;
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
            userId: string;
            quizId: string;
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
                order: number;
                title: string;
                courseId: string;
            };
        } & {
            id: string;
            rejectionReason: string | null;
            order: number;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            sectionId: string;
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
            contentGeneratedAt: Date | null;
            videoGeneratedAt: Date | null;
            retryCount: number;
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
            userId: string;
            quizId: string;
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
    startQuizAttempt(quizId: string, user: User): Promise<{
        attemptId: string;
        quizId: string;
        title: string;
        questions: {
            id: string;
            type: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
        }[];
        timeLimit: number;
        maxAttempts: number;
        currentAttempt: number;
        startedAt: Date;
    }>;
    submitQuizAttempt(quizId: string, user: User, answers: {
        questionId: string;
        answer: string | string[];
    }[], timeSpent: number): Promise<{
        attemptId: string;
        score: number;
        maxScore: number;
        percentage: number;
        passed: boolean;
        passingScore: number;
        completedAt: Date;
        gradedAnswers: Record<string, {
            earned: number;
            max: number;
            correct: boolean;
        }>;
        timeSpent: number;
    }>;
    getQuizAttempts(quizId: string, user: User): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
        completedAt: Date | null;
    })[]>;
    getQuizAttempt(quizId: string, attemptId: string, user: User): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        quiz: {
            module: {
                section: {
                    course: {
                        id: string;
                        status: import(".prisma/client").$Enums.CourseStatus;
                        organizationId: string | null;
                        rejectionReason: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        title: string;
                        description: string;
                        approvedBy: string | null;
                        slug: string;
                        thumbnail: string | null;
                        videoIntro: string | null;
                        price: number;
                        instructorId: string;
                    };
                } & {
                    id: string;
                    order: number;
                    title: string;
                    courseId: string;
                };
            } & {
                id: string;
                rejectionReason: string | null;
                order: number;
                title: string;
                type: import(".prisma/client").$Enums.ModuleType;
                sectionId: string;
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
                contentGeneratedAt: Date | null;
                videoGeneratedAt: Date | null;
                retryCount: number;
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
        };
    } & {
        id: string;
        userId: string;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    getQuizSubmissions(quizId: string): Promise<{
        quiz: {
            module: {
                section: {
                    course: {
                        id: string;
                        status: import(".prisma/client").$Enums.CourseStatus;
                        organizationId: string | null;
                        rejectionReason: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        title: string;
                        description: string;
                        approvedBy: string | null;
                        slug: string;
                        thumbnail: string | null;
                        videoIntro: string | null;
                        price: number;
                        instructorId: string;
                    };
                } & {
                    id: string;
                    order: number;
                    title: string;
                    courseId: string;
                };
            } & {
                id: string;
                rejectionReason: string | null;
                order: number;
                title: string;
                type: import(".prisma/client").$Enums.ModuleType;
                sectionId: string;
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
                contentGeneratedAt: Date | null;
                videoGeneratedAt: Date | null;
                retryCount: number;
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
        };
        submissions: {
            id: any;
            studentId: any;
            studentName: any;
            studentEmail: any;
            quizTitle: string;
            courseName: string;
            questions: {
                id: string;
                type: string;
                questionText: string;
                options: import("@prisma/client/runtime/client").JsonValue;
                correctAnswer: string;
                points: number;
            }[];
            studentAnswers: {
                id: string;
                answer: string | string[];
            }[];
            submittedAt: any;
            score: any;
            percentage: any;
            passed: any;
            status: string;
        }[];
        totalSubmissions: number;
        gradedCount: number;
        pendingCount: number;
    }>;
    gradeQuizAttempt(quizId: string, attemptId: string, grades: Record<string, {
        points: number;
        feedback: string;
    }>, user: User): Promise<{
        success: boolean;
        attemptId: string;
        grades: Record<string, {
            points: number;
            feedback: string;
        }>;
        finalScore: number;
    }>;
}
