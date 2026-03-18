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
exports.PluginsController = void 0;
const common_1 = require("@nestjs/common");
const plugins_service_1 = require("./plugins.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PluginsController = class PluginsController {
    constructor(pluginsService) {
        this.pluginsService = pluginsService;
    }
    getInstalledPlugins() {
        return this.pluginsService.getInstalledPlugins();
    }
    getAvailablePlugins(category) {
        return this.pluginsService.getAvailablePlugins(category);
    }
    getCategories() {
        return this.pluginsService.getCategories();
    }
    getPluginStats() {
        return this.pluginsService.getPluginStats();
    }
    getPlugin(pluginId) {
        return this.pluginsService.getPluginById(pluginId);
    }
    installPlugin(body) {
        return this.pluginsService.installPlugin(body.pluginId);
    }
    uninstallPlugin(pluginId) {
        return this.pluginsService.uninstallPlugin(pluginId);
    }
    togglePlugin(pluginId, body) {
        return this.pluginsService.togglePlugin(pluginId, body.enabled);
    }
    configurePlugin(pluginId, config) {
        return this.pluginsService.configurePlugin(pluginId, config);
    }
};
exports.PluginsController = PluginsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getInstalledPlugins", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getAvailablePlugins", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPluginStats", null);
__decorate([
    (0, common_1.Get)(':pluginId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('pluginId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPlugin", null);
__decorate([
    (0, common_1.Post)('install'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "installPlugin", null);
__decorate([
    (0, common_1.Post)('uninstall/:pluginId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('pluginId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "uninstallPlugin", null);
__decorate([
    (0, common_1.Patch)(':pluginId/toggle'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('pluginId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "togglePlugin", null);
__decorate([
    (0, common_1.Patch)(':pluginId/configure'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('pluginId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "configurePlugin", null);
exports.PluginsController = PluginsController = __decorate([
    (0, common_1.Controller)('plugins'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [plugins_service_1.PluginsService])
], PluginsController);
//# sourceMappingURL=plugins.controller.js.map