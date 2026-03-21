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
exports.VideoGenerationController = void 0;
const common_1 = require("@nestjs/common");
const video_generation_service_1 = require("./video-generation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let VideoGenerationController = class VideoGenerationController {
    constructor(videoGenService) {
        this.videoGenService = videoGenService;
    }
    async getStats() {
        return this.videoGenService.getStats();
    }
    async generateVideo(moduleId) {
        return this.videoGenService.generateVideo(moduleId);
    }
    async getByModuleId(moduleId) {
        return this.videoGenService.findByModuleId(moduleId);
    }
    async getByCourse(courseId) {
        return this.videoGenService.findAllByCourse(courseId);
    }
    async getById(id) {
        return this.videoGenService.findById(id);
    }
    async retry(id) {
        return this.videoGenService.retry(id);
    }
};
exports.VideoGenerationController = VideoGenerationController;
__decorate([
    (0, common_1.Get)('stats/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('generate/:moduleId'),
    __param(0, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Get)('module/:moduleId'),
    __param(0, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "getByModuleId", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "getByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "retry", null);
exports.VideoGenerationController = VideoGenerationController = __decorate([
    (0, common_1.Controller)('video-generation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [video_generation_service_1.VideoGenerationService])
], VideoGenerationController);
//# sourceMappingURL=video-generation.controller.js.map