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
exports.BlacklistCourseBodyDto = exports.RejectCourseBodyDto = exports.BlacklistUserBodyDto = exports.RejectUserBodyDto = exports.RegisterTeacherBodyDto = void 0;
const class_validator_1 = require("class-validator");
class RegisterTeacherBodyDto {
}
exports.RegisterTeacherBodyDto = RegisterTeacherBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], RegisterTeacherBodyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterTeacherBodyDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterTeacherBodyDto.prototype, "password", void 0);
class RejectUserBodyDto {
}
exports.RejectUserBodyDto = RejectUserBodyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectUserBodyDto.prototype, "reason", void 0);
class BlacklistUserBodyDto {
}
exports.BlacklistUserBodyDto = BlacklistUserBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], BlacklistUserBodyDto.prototype, "reason", void 0);
class RejectCourseBodyDto {
}
exports.RejectCourseBodyDto = RejectCourseBodyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectCourseBodyDto.prototype, "reason", void 0);
class BlacklistCourseBodyDto {
}
exports.BlacklistCourseBodyDto = BlacklistCourseBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], BlacklistCourseBodyDto.prototype, "reason", void 0);
//# sourceMappingURL=admin.dto.js.map