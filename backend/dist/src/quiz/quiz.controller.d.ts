import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto } from './dto';
import { SubmitQuizDto, GradeQuizAttemptDto } from './dto/quiz-body.dto';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    create(req: any, createQuizDto: CreateQuizDto): Promise<{
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
    getByModule(moduleId: string, req: any): Promise<{
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
    getQuiz(id: string, req: any): Promise<{
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
    update(id: string, updateQuizDto: UpdateQuizDto, req: any): Promise<{
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
    publish(id: string, req: any): Promise<{
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
    unpublish(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, req: any): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
    }>;
    updateQuestion(questionId: string, updateQuestionDto: UpdateQuestionDto, req: any): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
    }>;
    deleteQuestion(questionId: string, req: any): Promise<{
        id: string;
        type: string;
        order: number;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        text: string;
        correctAnswer: string | null;
        points: number;
        quizId: string;
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
    submitQuiz(id: string, body: SubmitQuizDto, req: any): Promise<{
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
    getQuizAttempt(id: string, attemptId: string, req: any): Promise<{
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
    getQuizSubmissions(id: string): Promise<{
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
    gradeQuizAttempt(id: string, attemptId: string, body: GradeQuizAttemptDto, req: any): Promise<{
        success: boolean;
        attemptId: string;
        grades: Record<string, {
            points: number;
            feedback: string;
        }>;
        finalScore: number;
    }>;
}
