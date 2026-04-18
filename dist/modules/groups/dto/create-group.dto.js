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
exports.CreateGroupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const groupStatus_enum_1 = require("../../../common/enums/groupStatus.enum");
class CreateGroupDto {
    name;
    status = groupStatus_enum_1.GroupStatus.ACTIVE;
    teacherId;
    directionId;
}
exports.CreateGroupDto = CreateGroupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Frontend Group', description: 'Group name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ACTIVE', description: 'Group status' }),
    (0, class_validator_1.IsEnum)(groupStatus_enum_1.GroupStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: 'Teacher ID' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateGroupDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2, description: 'Direction ID' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateGroupDto.prototype, "directionId", void 0);
//# sourceMappingURL=create-group.dto.js.map