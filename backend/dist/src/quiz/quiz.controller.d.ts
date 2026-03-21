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
    startQuiz(id: string, req: any): Promise<{
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
    submitQuiz(id: string, body: {
        answers: {
            questionId: string;
            answer: string | string[];
        }[];
        timeSpent: number;
    }, req: any): Promise<{
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
    getQuizAttempts(id: string, req: any): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        id: string;
        quizId: string;
        userId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
        completedAt: Date | null;
    })[]>;
    getQuizAttempt(id: string, attemptId: string, req: any): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
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
        quizId: string;
        userId: string;
        answers: import("@prisma/client/runtime/client").JsonValue;
        score: number | null;
        percentage: number | null;
        passed: boolean | null;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    getQuizSubmissions(id: string): Promise<{
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
    getAllPendingSubmissions(req: any): Promise<{
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
    gradeQuizAttempt(id: string, attemptId: string, body: {
        grades: Record<string, {
            points: number;
            feedback: string;
        }>;
    }, req: any): Promise<{
        success: boolean;
        attemptId: string;
        grades: Record<string, {
            points: number;
            feedback: string;
        }>;
        finalScore: number;
    }>;
}
