"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsModule = void 0;
const common_1 = require("@nestjs/common");
const plugin_loader_service_1 = require("./plugin-loader.service");
const plugins_service_1 = require("./plugins.service");
const plugins_controller_1 = require("./plugins.controller");
const hooks_service_1 = require("../common/services/hooks.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PluginsModule = class PluginsModule {
};
exports.PluginsModule = PluginsModule;
exports.PluginsModule = PluginsModule = __decorate([
    (0, common_1.Module)({
        controllers: [plugins_controller_1.PluginsController],
        providers: [plugin_loader_service_1.PluginLoaderService, plugins_service_1.PluginsService, hooks_service_1.HooksService, prisma_service_1.PrismaService],
        exports: [plugin_loader_service_1.PluginLoaderService, plugins_service_1.PluginsService, hooks_service_1.HooksService],
    })
], PluginsModule);
//# sourceMappingURL=plugins.module.js.map