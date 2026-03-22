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
exports.ModulesController = void 0;
const common_1 = require("@nestjs/common");
const modules_service_1 = require("./modules.service");
const create_module_dto_1 = require("./dto/create-module.dto");
const update_module_dto_1 = require("./dto/update-module.dto");
const generate_content_dto_1 = require("./dto/generate-content.dto");
const module_body_dto_1 = require("./dto/module-body.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const course_enrollment_guard_1 = require("../common/guards/course-enrollment.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ModulesController = class ModulesController {
    constructor(modulesService) {
        this.modulesService = modulesService;
    }
    create(req, createModuleDto) {
        return this.modulesService.create(createModuleDto, req.user);
    }
    findAll(sectionId, req) {
        return this.modulesService.findAll(sectionId, req.user);
    }
    findOne(id, req) {
        return this.modulesService.findOne(id, req.user);
    }
    update(id, updateModuleDto, req) {
        return this.modulesService.update(id, updateModuleDto, req.user);
    }
    remove(id, req) {
        return this.modulesService.remove(id, req.user);
    }
    generateContent(id, body, req) {
        return this.modulesService.generateContent(id, body.topic, req.user);
    }
    updateContent(id, body, req) {
        return this.modulesService.updateContent(id, body.content, req.user);
    }
    approveContent(id, req) {
        return this.modulesService.approveContent(id, req.user);
    }
    getVideoStatus(id, req) {
        return this.modulesService.getVideoStatus(id, req.user);
    }
    generateVideo(id, body, req) {
        return this.modulesService.generateVideo(id, body.voiceId, req.user);
    }
    getVideoPreview(id, req) {
        return this.modulesService.getVideoPreview(id, req.user);
    }
    approveVideo(id, req) {
        return this.modulesService.approveVideo(id, req.user);
    }
    rejectVideo(id, body, req) {
        return this.modulesService.rejectVideo(id, body.reason, req.user);
    }
    getVoices() {
        return this.modulesService.getAvailableVoices();
    }
};
exports.ModulesController = ModulesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_module_dto_1.CreateModuleDto]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('section/:sectionId'),
    (0, common_1.UseGuards)(course_enrollment_guard_1.CourseEnrollmentGuard),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(course_enrollment_guard_1.CourseEnrollmentGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_module_dto_1.UpdateModuleDto, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/generate-content'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_content_dto_1.GenerateContentDto, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "generateContent", null);
__decorate([
    (0, common_1.Patch)(':id/content'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, module_body_dto_1.UpdateContentBodyDto, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Post)(':id/approve-content'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "approveContent", null);
__decorate([
    (0, common_1.Get)(':id/video-status'),
    (0, common_1.UseGuards)(course_enrollment_guard_1.CourseEnrollmentGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "getVideoStatus", null);
__decorate([
    (0, common_1.Post)(':id/generate-video'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, module_body_dto_1.GenerateVideoBodyDto, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Get)(':id/video-preview'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "getVideoPreview", null);
__decorate([
    (0, common_1.Post)(':id/approve-video'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "approveVideo", null);
__decorate([
    (0, common_1.Post)(':id/reject-video'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, module_body_dto_1.RejectVideoBodyDto, Object]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "rejectVideo", null);
__decorate([
    (0, common_1.Get)('voices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "getVoices", null);
exports.ModulesController = ModulesController = __decorate([
    (0, common_1.Controller)('modules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [modules_service_1.ModulesService])
], ModulesController);
//# sourceMappingURL=modules.controller.js.map