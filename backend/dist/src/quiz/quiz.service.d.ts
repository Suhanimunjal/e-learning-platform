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
                    rejectionReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    organizationId: string | null;
                    slug: string;
                    title: string;
                    approvedBy: string | null;
                    description: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                    materials: import("@prisma/client/runtime/client").JsonValue | null;
                    youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
                };
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            };
        } & {
            id: string;
            rejectionReason: string | null;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            order: number;
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
            sectionId: string;
        };
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
        attempts: {
            id: string;
            userId: string;
            completedAt: Date | null;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    getQuiz(quizId: string, user: User): Promise<{
        module: {
            section: {
                course: {
                    id: string;
                    status: import(".prisma/client").$Enums.CourseStatus;
                    rejectionReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    organizationId: string | null;
                    slug: string;
                    title: string;
                    approvedBy: string | null;
                    description: string;
                    thumbnail: string | null;
                    videoIntro: string | null;
                    price: number;
                    instructorId: string;
                    materials: import("@prisma/client/runtime/client").JsonValue | null;
                    youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
                };
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            };
        } & {
            id: string;
            rejectionReason: string | null;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            order: number;
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
            sectionId: string;
        };
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
        attempts: {
            id: string;
            userId: string;
            completedAt: Date | null;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    findByModule(moduleId: string, user: User): Promise<{
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
        attempts: {
            id: string;
            userId: string;
            completedAt: Date | null;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    update(quizId: string, updateQuizDto: UpdateQuizDto, user: User): Promise<{
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, user: User): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
    }>;
    updateQuestion(questionId: string, updateQuestionDto: any, user: User): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
    }>;
    deleteQuestion(questionId: string, user: User): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
    }>;
    publishQuiz(quizId: string, user: User): Promise<{
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    unpublishQuiz(quizId: string, user: User): Promise<{
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
    }>;
    deleteQuiz(quizId: string, user: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
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
            rejectionReason: string | null;
            title: string;
            type: import(".prisma/client").$Enums.ModuleType;
            videoUrl: string | null;
            textContent: string | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            order: number;
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
            sectionId: string;
        };
        questions: {
            id: string;
            type: string;
            order: number;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            text: string;
            correctAnswer: string | null;
            points: number;
            quizId: string;
        }[];
        attempts: {
            id: string;
            userId: string;
            completedAt: Date | null;
            quizId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            score: number | null;
            percentage: number | null;
            passed: boolean | null;
            startedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        description: string | null;
        timeLimit: number | null;
        maxAttempts: number;
        passingScore: number;
        shuffleQuestions: boolean;
        published: boolean;
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
        completedAt: Date | null;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
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
                        rejectionReason: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        organizationId: string | null;
                        slug: string;
                        title: string;
                        approvedBy: string | null;
                        description: string;
                        thumbnail: string | null;
                        videoIntro: string | null;
                        price: number;
                        instructorId: string;
                        materials: import("@prisma/client/runtime/client").JsonValue | null;
                        youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
                    };
                } & {
                    id: string;
                    title: string;
                    order: number;
                    courseId: string;
                };
            } & {
                id: string;
                rejectionReason: string | null;
                title: string;
                type: import(".prisma/client").$Enums.ModuleType;
                videoUrl: string | null;
                textContent: string | null;
                content: import("@prisma/client/runtime/client").JsonValue | null;
                order: number;
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
                sectionId: string;
            };
            questions: {
                id: string;
                type: string;
                order: number;
                options: import("@prisma/client/runtime/client").JsonValue | null;
                text: string;
                correctAnswer: string | null;
                points: number;
                quizId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            moduleId: string;
            description: string | null;
            timeLimit: number | null;
            maxAttempts: number;
            passingScore: number;
            shuffleQuestions: boolean;
            published: boolean;
        };
    } & {
        id: string;
        userId: string;
        completedAt: Date | null;
        quizId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
    }>;
    getQuizSubmissions(quizId: string): Promise<{
        quiz: {
            module: {
                section: {
                    course: {
                        id: string;
                        status: import(".prisma/client").$Enums.CourseStatus;
                        rejectionReason: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        organizationId: string | null;
                        slug: string;
                        title: string;
                        approvedBy: string | null;
                        description: string;
                        thumbnail: string | null;
                        videoIntro: string | null;
                        price: number;
                        instructorId: string;
                        materials: import("@prisma/client/runtime/client").JsonValue | null;
                        youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
                    };
                } & {
                    id: string;
                    title: string;
                    order: number;
                    courseId: string;
                };
            } & {
                id: string;
                rejectionReason: string | null;
                title: string;
                type: import(".prisma/client").$Enums.ModuleType;
                videoUrl: string | null;
                textContent: string | null;
                content: import("@prisma/client/runtime/client").JsonValue | null;
                order: number;
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
                sectionId: string;
            };
            questions: {
                id: string;
                type: string;
                order: number;
                options: import("@prisma/client/runtime/client").JsonValue | null;
                text: string;
                correctAnswer: string | null;
                points: number;
                quizId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            moduleId: string;
            description: string | null;
            timeLimit: number | null;
            maxAttempts: number;
            passingScore: number;
            shuffleQuestions: boolean;
            published: boolean;
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
    getAllPendingSubmissions(user: User): Promise<{
        submissions: {
            id: string;
            quizId: string;
            quizTitle: string;
            courseId: string;
            courseTitle: string;
            userId: string;
            userName: string;
            userEmail: string;
            score: number;
            percentage: number;
            completedAt: Date;
            status: string;
        }[];
        total: number;
        pendingCount: number;
    }>;
}
