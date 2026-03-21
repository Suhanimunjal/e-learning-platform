"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooksService = void 0;
const common_1 = require("@nestjs/common");
let HooksService = HooksService_1 = class HooksService {
    constructor() {
        this.logger = new common_1.Logger(HooksService_1.name);
        this.hooks = new Map();
    }
    register(event, handler) {
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        this.logger.log(`Hook registered for event: ${event}`);
    }
    async trigger(event, data) {
        const eventHooks = this.hooks.get(event) || [];
        for (const hook of eventHooks) {
            try {
                await hook(data);
            }
            catch (error) {
                this.logger.error(`Hook ${event} failed:`, error);
            }
        }
    }
    unregister(event, handler) {
        const eventHooks = this.hooks.get(event) || [];
        const index = eventHooks.indexOf(handler);
        if (index > -1) {
            eventHooks.splice(index, 1);
        }
    }
};
exports.HooksService = HooksService;
exports.HooksService = HooksService = HooksService_1 = __decorate([
    (0, common_1.Injectable)()
], HooksService);
//# sourceMappingURL=hooks.service.js.map