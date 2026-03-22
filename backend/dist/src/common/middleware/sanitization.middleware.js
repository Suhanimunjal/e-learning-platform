"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationMiddleware = void 0;
const common_1 = require("@nestjs/common");
function sanitizeValue(value) {
    if (typeof value === 'string') {
        let sanitized = value.replace(/\0/g, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        sanitized = sanitized.replace(/';|--|\/\*|\*\//g, '');
        return sanitized;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value)) {
            result[key] = sanitizeValue(value[key]);
        }
        return result;
    }
    return value;
}
let SanitizationMiddleware = class SanitizationMiddleware {
    use(req, res, next) {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeValue(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            for (const key of Object.keys(req.query)) {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = sanitizeValue(req.query[key]);
                }
            }
        }
        next();
    }
};
exports.SanitizationMiddleware = SanitizationMiddleware;
exports.SanitizationMiddleware = SanitizationMiddleware = __decorate([
    (0, common_1.Injectable)()
], SanitizationMiddleware);
//# sourceMappingURL=sanitization.middleware.js.map