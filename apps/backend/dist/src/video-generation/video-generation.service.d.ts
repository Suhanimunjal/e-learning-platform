import { PrismaService } from '../prisma/prisma.service';
import { TTSService } from '../ai/tts.service';
export declare class VideoGenerationService {
    private prisma;
    private ttsService;
    private readonly logger;
    constructor(prisma: PrismaService, ttsService: TTSService);
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
