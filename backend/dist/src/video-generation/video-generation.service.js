"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VideoGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoGenerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tts_service_1 = require("../ai/tts.service");
let VideoGenerationService = VideoGenerationService_1 = class VideoGenerationService {
    constructor(prisma, ttsService) {
        this.prisma = prisma;
        this.ttsService = ttsService;
        this.logger = new common_1.Logger(VideoGenerationService_1.name);
    }
    async generateVideo(moduleId) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: { section: { include: { course: true } } },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (module.type !== 'LESSON') {
            throw new common_1.BadRequestException('Video can only be generated for LESSON modules');
        }
        let videoGen = await this.prisma.videoGeneration.findUnique({
            where: { moduleId },
        });
        if (videoGen && videoGen.status === 'COMPLETED') {
            return videoGen;
        }
        try {
            if (!videoGen) {
                videoGen = await this.prisma.videoGeneration.create({
                    data: {
                        moduleId,
                        script: '',
                        status: 'PENDING',
                    },
                });
            }
            else {
                await this.prisma.videoGeneration.update({
                    where: { id: videoGen.id },
                    data: { status: 'PENDING' },
                });
            }
            const script = await this.generateScript(module);
            await this.prisma.videoGeneration.update({
                where: { id: videoGen.id },
                data: {
                    script,
                    status: 'SCRIPT_GENERATED',
                },
            });
            const audioUrl = await this.generateAudio(script);
            await this.prisma.videoGeneration.update({
                where: { id: videoGen.id },
                data: {
                    audioUrl,
                    status: 'AUDIO_GENERATED',
                },
            });
            await this.prisma.videoGeneration.update({
                where: { id: videoGen.id },
                data: {
                    videoUrl: audioUrl,
                    status: 'COMPLETED',
                },
            });
            await this.prisma.module.update({
                where: { id: moduleId },
                data: {
                    videoGenId: videoGen.id,
                    hasVideo: true,
                    videoUrl: audioUrl,
                },
            });
            return this.findByModuleId(moduleId);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Video generation failed';
            await this.prisma.videoGeneration.update({
                where: { id: videoGen.id },
                data: {
                    status: 'FAILED',
                    errorMessage,
                },
            });
            throw error;
        }
    }
    async generateScript(module) {
        if (module.textContent) {
            return this.convertToNarrativeScript(module.textContent, module.title);
        }
        const content = module.content;
        if (content?.description) {
            return this.convertToNarrativeScript(content.description, module.title);
        }
        return this.generateDefaultScript(module.title);
    }
    convertToNarrativeScript(text, title) {
        const intro = `Welcome to this lesson on ${title}. `;
        const body = text.replace(/<[^>]*>/g, '').trim();
        const summary = ` In summary, we covered ${title}. Thank you for watching.`;
        const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const narrative = sentences
            .slice(0, 20)
            .map(s => s.trim())
            .join('. ');
        return `${intro}${narrative}${summary}`;
    }
    generateDefaultScript(title) {
        return `Welcome to this lesson on ${title}. In this lesson, we will explore the key concepts and fundamentals of ${title}. We will cover the main topics, discuss important points, and provide examples to help you understand better. By the end of this lesson, you should have a clear understanding of ${title}. Let's begin our learning journey.`;
    }
    async generateAudio(script, voiceId) {
        const voice = voiceId
            ? this.ttsService.getVoiceById(voiceId)
            : this.ttsService.getAvailableVoices()[0];
        if (!voice) {
            throw new common_1.BadRequestException('Voice not found or not configured');
        }
        const voiceConfig = {
            languageCode: voice.languageCode,
            name: voice.name,
            ssmlGender: voice.gender,
        };
        const result = await this.ttsService.generateAudio(script, voiceConfig);
        return result.audioUrl;
    }
    async findByModuleId(moduleId) {
        const videoGen = await this.prisma.videoGeneration.findUnique({
            where: { moduleId },
        });
        if (!videoGen) {
            throw new common_1.NotFoundException('Video generation not found for this module');
        }
        return videoGen;
    }
    async findById(id) {
        const videoGen = await this.prisma.videoGeneration.findUnique({
            where: { id },
        });
        if (!videoGen) {
            throw new common_1.NotFoundException('Video generation not found');
        }
        return videoGen;
    }
    async findAllByCourse(courseId) {
        const modules = await this.prisma.module.findMany({
            where: {
                section: { courseId },
            },
            include: {
                section: true,
            },
        });
        const moduleIds = modules.map(m => m.id);
        const videoGens = await this.prisma.videoGeneration.findMany({
            where: {
                moduleId: { in: moduleIds },
            },
        });
        return modules.map(module => {
            const videoGen = videoGens.find(vg => vg.moduleId === module.id);
            return {
                module,
                videoGen: videoGen || null,
            };
        });
    }
    async retry(id) {
        const videoGen = await this.prisma.videoGeneration.findUnique({
            where: { id },
        });
        if (!videoGen) {
            throw new common_1.NotFoundException('Video generation not found');
        }
        return this.generateVideo(videoGen.moduleId);
    }
    async getStats() {
        const [total, pending, completed, failed] = await Promise.all([
            this.prisma.videoGeneration.count(),
            this.prisma.videoGeneration.count({ where: { status: 'PENDING' } }),
            this.prisma.videoGeneration.count({ where: { status: 'COMPLETED' } }),
            this.prisma.videoGeneration.count({ where: { status: 'FAILED' } }),
        ]);
        return { total, pending, completed, failed };
    }
};
exports.VideoGenerationService = VideoGenerationService;
exports.VideoGenerationService = VideoGenerationService = VideoGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tts_service_1.TTSService])
], VideoGenerationService);
//# sourceMappingURL=video-generation.service.js.map