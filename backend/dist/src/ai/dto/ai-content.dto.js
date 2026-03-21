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
exports.TrackProgressDto = exports.ChatDto = exports.DetectLanguageDto = exports.TranslateTextDto = exports.SummarizeContentDto = exports.GenerateExamplesDto = exports.GenerateAssignmentDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateAssignmentDto {
}
exports.GenerateAssignmentDto = GenerateAssignmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateAssignmentDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateAssignmentDto.prototype, "tone", void 0);
class GenerateExamplesDto {
}
exports.GenerateExamplesDto = GenerateExamplesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateExamplesDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateExamplesDto.prototype, "tone", void 0);
class SummarizeContentDto {
}
exports.SummarizeContentDto = SummarizeContentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SummarizeContentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SummarizeContentDto.prototype, "tone", void 0);
class TranslateTextDto {
}
exports.TranslateTextDto = TranslateTextDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranslateTextDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranslateTextDto.prototype, "targetLang", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranslateTextDto.prototype, "sourceLang", void 0);
class DetectLanguageDto {
}
exports.DetectLanguageDto = DetectLanguageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetectLanguageDto.prototype, "text", void 0);
class ChatDto {
}
exports.ChatDto = ChatDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "courseId", void 0);
class TrackProgressDto {
}
exports.TrackProgressDto = TrackProgressDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackProgressDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackProgressDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], TrackProgressDto.prototype, "score", void 0);
//# sourceMappingURL=ai-content.dto.js.map