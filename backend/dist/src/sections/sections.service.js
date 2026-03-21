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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SectionsService = class SectionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSectionDto, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: createSectionDto.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot create sections');
        }
        if (user.role === client_1.Role.TEACHER && course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only create sections for your own courses');
        }
        return this.prisma.section.create({
            data: createSectionDto,
        });
    }
    async findAll(courseId, user) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: user.id,
                    courseId: courseId,
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You are not enrolled in this course');
            }
        }
        return this.prisma.section.findMany({
            where: { courseId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
    }
    async update(id, updateSectionDto, user) {
        const section = await this.prisma.section.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot update sections');
        }
        if (user.role === client_1.Role.TEACHER && section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only update sections for your own courses');
        }
        return this.prisma.section.update({
            where: { id },
            data: updateSectionDto,
        });
    }
    async remove(id, user) {
        const section = await this.prisma.section.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        if (user.role === client_1.Role.STUDENT) {
            throw new common_1.ForbiddenException('Students cannot delete sections');
        }
        if (user.role === client_1.Role.TEACHER && section.course.instructorId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete sections for your own courses');
        }
        return this.prisma.section.delete({ where: { id } });
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map