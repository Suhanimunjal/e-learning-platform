import { PrismaService } from '../prisma/prisma.service';
export declare class VideoGenerationService {
    private prisma;
    constructor(prisma: PrismaService);
    generateVideo(moduleId: string): Promise<any>;
    private generateScript;
    private convertToNarrativeScript;
    private generateDefaultScript;
    private generateAudio;
    findByModuleId(moduleId: string): Promise<any>;
    findById(id: string): Promise<any>;
    findAllByCourse(courseId: string): Promise<any[]>;
    retry(id: string): Promise<any>;
    getStats(): Promise<any>;
}
