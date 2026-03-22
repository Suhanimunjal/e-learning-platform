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
                email: string;
                name: string;
            };
            sections: ({
                modules: {
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
                }[];
            } & {
                id: string;
                title: string;
                order: number;
                courseId: string;
            })[];
        } & {
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
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: import(".prisma/client").$Enums.EnrollmentStatus;
    })[]>;
    getCourseStudents(courseId: string, req: any): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
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
