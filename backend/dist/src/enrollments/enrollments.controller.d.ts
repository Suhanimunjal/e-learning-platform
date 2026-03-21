import { EnrollmentsService } from './enrollments.service';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    enroll(courseId: string, req: any): Promise<{
        message: string;
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    getMyCourses(req: any): Promise<({
        course: {
            instructor: {
                id: string;
                name: string;
                email: string;
            };
            sections: ({
                modules: {
                    id: string;
                    rejectionReason: string | null;
                    title: string;
                    approvedBy: string | null;
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
                    contentGeneratedAt: Date | null;
                    videoGeneratedAt: Date | null;
                    retryCount: number;
                }[];
            } & {
                id: string;
                title: string;
                courseId: string;
                order: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            updatedAt: Date;
            organizationId: string | null;
            slug: string;
            title: string;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            instructorId: string;
            approvedBy: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    getPendingEnrollments(req: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        course: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    approveEnrollment(enrollmentId: string, req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    rejectEnrollment(enrollmentId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    }>;
    getCourseStudents(courseId: string, req: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        courseId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
}
