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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const student_service_1 = require("./student.service");
let StudentController = class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }
    getDashboard(req) {
        return this.studentService.getDashboard(req.user.id);
    }
    getEnrolledCourses(req) {
        return this.studentService.getEnrolledCourses(req.user.id);
    }
    getCourseFull(req, courseId) {
        return this.studentService.getCourseFull(req.user.id, courseId);
    }
    getCertificates(req) {
        return this.studentService.getCertificates(req.user.id);
    }
    getCertificateDownload(req, certificateId) {
        return this.studentService.getCertificateDownload(req.user.id, certificateId);
    }
    getNotifications(req, limit, unreadOnly) {
        const parsedLimit = limit ? Number(limit) : 20;
        const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;
        const onlyUnread = unreadOnly === 'true';
        return this.studentService.getNotifications(req.user.id, safeLimit, onlyUnread);
    }
    getUnreadCount(req) {
        return this.studentService.getUnreadNotificationCount(req.user.id);
    }
    markNotificationRead(req, notificationId) {
        return this.studentService.markNotificationRead(req.user.id, notificationId);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('enrolled'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getEnrolledCourses", null);
__decorate([
    (0, common_1.Get)('course/:courseId/full'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCourseFull", null);
__decorate([
    (0, common_1.Get)('certificates'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCertificates", null);
__decorate([
    (0, common_1.Get)('certificates/:certificateId/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('certificateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getCertificateDownload", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('notifications/:notificationId/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "markNotificationRead", null);
exports.StudentController = StudentController = __decorate([
    (0, common_1.Controller)('student'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map