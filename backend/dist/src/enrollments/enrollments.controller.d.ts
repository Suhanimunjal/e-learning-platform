import { EnrollmentsService } from './enrollments.service';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    enroll(courseId: string, req: any): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
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
                    sectionId: string;
                }[];
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            })[];
        } & {
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CourseStatus;
            rejectionReason: string | null;
            organizationId: string | null;
            title: string;
            description: string;
            thumbnail: string | null;
            videoIntro: string | null;
            price: number;
            approvedBy: string | null;
            materials: import("@prisma/client/runtime/client").JsonValue | null;
            youtubeLinks: import("@prisma/client/runtime/client").JsonValue | null;
            instructorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    getCourseStudents(courseId: string, req: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            rollNo: string;
            year: string;
            branch: string;
            course: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    removeStudent(enrollmentId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
