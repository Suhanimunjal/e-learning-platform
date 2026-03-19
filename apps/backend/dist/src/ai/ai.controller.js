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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./services/ai.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const ai_content_dto_1 = require("./dto/ai-content.dto");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generateOutline(req, body) {
        return this.aiService.generateCourseOutline(body.topic, req.user.id);
    }
    async generateLessons(req, courseId) {
        return this.aiService.generateLessons(courseId, req.user.id);
    }
    async getJobStatus(jobId) {
        return this.aiService.getJobStatus(jobId);
    }
    async generateQuiz(req, moduleId) {
        return this.aiService.generateQuiz(moduleId, req.user.id);
    }
    async generateFlashcards(req, moduleId) {
        return this.aiService.generateFlashcards(moduleId, req.user.id);
    }
    async generateAssignment(dto) {
        return this.aiService.generateAssignment(dto.topic, dto.tone || 'formal');
    }
    async generateExamples(dto) {
        return this.aiService.generateExamples(dto.topic, dto.tone || 'casual');
    }
    async summarizeContent(dto) {
        return this.aiService.summarizeContent(dto.content, dto.tone || 'simplified');
    }
    async gradeSubmission(submissionId) {
        return this.aiService.gradeSubmission(submissionId);
    }
    async getFeedback(submissionId) {
        return this.aiService.getGradingFeedback(submissionId);
    }
    async overrideGrade(submissionId, body) {
        return this.aiService.overrideGrade(submissionId, body.score, body.feedback);
    }
    async getRecommendations(studentId) {
        return this.aiService.getRecommendations(studentId);
    }
    async trackProgress(body) {
        return this.aiService.trackProgress(body.studentId, body.topic, body.score);
    }
    async translate(dto) {
        return this.aiService.translateText(dto.text, dto.targetLang, dto.sourceLang);
    }
    async detectLanguage(dto) {
        return this.aiService.detectLanguage(dto.text);
    }
    async search(query, filters) {
        return this.aiService.search(query, filters);
    }
    async getSuggestions(query) {
        return this.aiService.getSearchSuggestions(query);
    }
    async chat(dto) {
        return this.aiService.chat(dto.message, dto.sessionId, dto.courseId);
    }
    async getChatHistory(sessionId) {
        return this.aiService.getChatHistory(sessionId);
    }
    async createSession(body) {
        return this.aiService.createChatSession(body?.courseId);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate-outline'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateOutline", null);
__decorate([
    (0, common_1.Post)('generate-lessons/:courseId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateLessons", null);
__decorate([
    (0, common_1.Get)('job/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Post)('generate-quiz/:moduleId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateQuiz", null);
__decorate([
    (0, common_1.Post)('generate-flashcards/:moduleId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFlashcards", null);
__decorate([
    (0, common_1.Post)('generate-assignment'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.GenerateAssignmentDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateAssignment", null);
__decorate([
    (0, common_1.Post)('generate-examples'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.GenerateExamplesDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateExamples", null);
__decorate([
    (0, common_1.Post)('summarize-content'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.SummarizeContentDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "summarizeContent", null);
__decorate([
    (0, common_1.Post)('grade/:submissionId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "gradeSubmission", null);
__decorate([
    (0, common_1.Get)('grade/:submissionId/feedback'),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getFeedback", null);
__decorate([
    (0, common_1.Post)('grade/:submissionId/override'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "overrideGrade", null);
__decorate([
    (0, common_1.Get)('recommendations/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Post)('recommendations/track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "trackProgress", null);
__decorate([
    (0, common_1.Post)('translate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.TranslateTextDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "translate", null);
__decorate([
    (0, common_1.Post)('detect-language'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.DetectLanguageDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "detectLanguage", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('search/suggestions'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_content_dto_1.ChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('chat/history/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Post)('chat/session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "createSession", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map