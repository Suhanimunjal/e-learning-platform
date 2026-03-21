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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseEnrollmentGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CourseEnrollmentGuard = class CourseEnrollmentGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const params = request.params || {};
        const body = request.body || {};
        let courseId = params.courseId || params.id || body.courseId;
        if (!courseId && request.params.sectionId) {
            const section = await this.prisma.section.findUnique({
                where: { id: request.params.sectionId },
                select: { courseId: true },
            });
            if (section)
                courseId = section.courseId;
        }
        if (!courseId) {
            return true;
        }
        if (user.role === client_1.Role.ADMIN || user.role === client_1.Role.MANAGER) {
            return true;
        }
        if (user.role === client_1.Role.TEACHER) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
            });
            if (course && course.instructorId === user.id) {
                return true;
            }
        }
        if (user.role === client_1.Role.STUDENT) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: courseId,
                },
            });
            if (enrollment) {
                return true;
            }
        }
        throw new common_1.ForbiddenException('You do not have access to this course');
    }
};
exports.CourseEnrollmentGuard = CourseEnrollmentGuard;
exports.CourseEnrollmentGuard = CourseEnrollmentGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseEnrollmentGuard);
//# sourceMappingURL=course-enrollment.guard.js.map