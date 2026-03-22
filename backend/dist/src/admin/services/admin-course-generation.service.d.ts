import { PrismaService } from '../../prisma/prisma.service';
import { ContentGeneratorEnhancedService } from '../../ai/content-generator-enhanced.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { GenerateAiCourseDto } from '../dto/generate-ai-course.dto';
export declare class AdminCourseGenerationService {
    private prisma;
    private contentGenerator;
    private activityLogService;
    constructor(prisma: PrismaService, contentGenerator: ContentGeneratorEnhancedService, activityLogService: ActivityLogService);
    startGeneration(input: GenerateAiCourseDto, adminUserId: string): Promise<{
        jobId: string;
        status: string;
    }>;
    getJob(jobId: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        type: string;
        status: string;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        retryCount: number;
        version: string;
        tenantId: string | null;
        updatedAt: Date;
    }>;
    private executeGeneration;
    private normalizeModules;
    private generateUniqueCourseSlug;
    private toSlug;
}
