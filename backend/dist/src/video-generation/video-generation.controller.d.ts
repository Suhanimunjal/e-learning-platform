import { VideoGenerationService } from './video-generation.service';
export declare class VideoGenerationController {
    private readonly videoGenService;
    constructor(videoGenService: VideoGenerationService);
    getStats(): Promise<any>;
    generateVideo(moduleId: string): Promise<any>;
    getByModuleId(moduleId: string): Promise<any>;
    getByCourse(courseId: string): Promise<any[]>;
    getById(id: string): Promise<any>;
    retry(id: string): Promise<any>;
}
