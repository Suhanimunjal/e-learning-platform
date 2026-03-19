"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./services/ai.service");
const anthropic_service_1 = require("./services/anthropic.service");
const ai_job_processor_1 = require("./services/ai-job.processor");
const prisma_service_1 = require("../prisma/prisma.service");
const tts_service_1 = require("./tts.service");
const content_generator_enhanced_service_1 = require("./content-generator-enhanced.service");
const quiz_verification_service_1 = require("./quiz-verification.service");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'ai-jobs',
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            }),
        ],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            anthropic_service_1.AnthropicService,
            ai_job_processor_1.AiJobProcessor,
            prisma_service_1.PrismaService,
            tts_service_1.TTSService,
            content_generator_enhanced_service_1.ContentGeneratorEnhancedService,
            quiz_verification_service_1.QuizVerificationService,
        ],
        exports: [ai_service_1.AiService, tts_service_1.TTSService, content_generator_enhanced_service_1.ContentGeneratorEnhancedService, quiz_verification_service_1.QuizVerificationService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map