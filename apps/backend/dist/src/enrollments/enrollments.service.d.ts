import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AnalyticsTrackingService } from '../analytics/services/analytics-tracking.service';
export declare class EnrollmentsService {
    private prisma;
    private analyticsTracking;
    constructor(prisma: PrismaService, analyticsTracking: AnalyticsTrackingService);
    enroll(courseId: string, user: User): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: string;
    }>;
    getMyCourses(user: User): Promise<({
        course: {
            instructor: {
                id: string;
                name: string;
                email: string;
            };
            sections: ({
                modules: {
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
                }[];
            } & {
                id: string;
                title: string;
                courseId: string;
                order: number;
            })[];
        } & {
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
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: string;
    })[]>;
    getCourseStudents(courseId: string, user: User): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        userId: string;
        accessStatus: string;
    })[]>;
}
