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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AnthropicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const ai_config_1 = require("../ai.config");
let AnthropicService = AnthropicService_1 = class AnthropicService {
    constructor() {
        this.logger = new common_1.Logger(AnthropicService_1.name);
        const apiKey = process.env.ANTHROPIC_API_KEY;
        this.isConfigured = apiKey && apiKey !== 'your-anthropic-api-key' && apiKey.length > 20;
        if (this.isConfigured) {
            this.anthropic = new sdk_1.default({
                apiKey: apiKey,
            });
        }
        else {
            this.logger.warn('Anthropic API key not configured. AI features will be disabled.');
        }
    }
    ensureConfigured() {
        if (!this.isConfigured) {
            throw new Error('AI features are disabled. Please configure ANTHROPIC_API_KEY in .env');
        }
    }
    async generateCourseOutline(topic) {
        this.ensureConfigured();
        try {
            const prompt = ai_config_1.AI_CONFIG.prompts.courseOutline(topic);
            const response = await this.anthropic.messages.create({
                model: ai_config_1.AI_CONFIG.anthropic.model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return this.parseJSONResponse(content.text);
            }
        }
        catch (error) {
            this.logger.error('Error generating course outline:', error);
            throw error;
        }
    }
    async generateLessonContent(moduleTitle, lessonTitle, description) {
        this.ensureConfigured();
        try {
            const prompt = ai_config_1.AI_CONFIG.prompts.lessonContent(moduleTitle, lessonTitle, description);
            const response = await this.anthropic.messages.create({
                model: ai_config_1.AI_CONFIG.anthropic.model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return this.parseJSONResponse(content.text);
            }
        }
        catch (error) {
            this.logger.error('Error generating lesson content:', error);
            throw error;
        }
    }
    async generateQuiz(lessonContent, lessonTitle) {
        this.ensureConfigured();
        try {
            const prompt = ai_config_1.AI_CONFIG.prompts.quiz(lessonContent, lessonTitle);
            const response = await this.anthropic.messages.create({
                model: ai_config_1.AI_CONFIG.anthropic.model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return this.parseJSONResponse(content.text);
            }
        }
        catch (error) {
            this.logger.error('Error generating quiz:', error);
            throw error;
        }
    }
    async generateFlashcards(lessonContent, lessonTitle) {
        this.ensureConfigured();
        try {
            const prompt = ai_config_1.AI_CONFIG.prompts.flashcards(lessonContent, lessonTitle);
            const response = await this.anthropic.messages.create({
                model: ai_config_1.AI_CONFIG.anthropic.model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return this.parseJSONResponse(content.text);
            }
        }
        catch (error) {
            this.logger.error('Error generating flashcards:', error);
            throw error;
        }
    }
    parseJSONResponse(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            }
            catch (e) {
                return { rawText: text };
            }
        }
        return { rawText: text };
    }
};
exports.AnthropicService = AnthropicService;
exports.AnthropicService = AnthropicService = AnthropicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AnthropicService);
//# sourceMappingURL=anthropic.service.js.map