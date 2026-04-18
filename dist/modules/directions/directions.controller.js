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
exports.DirectionController = void 0;
const common_1 = require("@nestjs/common");
const directions_service_1 = require("./directions.service");
const create_direction_dto_1 = require("./dto/create-direction.dto");
const update_direction_dto_1 = require("./dto/update-direction.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let DirectionController = class DirectionController {
    directionService;
    constructor(directionService) {
        this.directionService = directionService;
    }
    create(dto) {
        return this.directionService.create(dto);
    }
    findAll() {
        return this.directionService.findAll();
    }
    findOne(id) {
        return this.directionService.findOne(id);
    }
    update(id, dto) {
        return this.directionService.update(id, dto);
    }
    remove(id) {
        return this.directionService.remove(id);
    }
};
exports.DirectionController = DirectionController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_direction_dto_1.CreateDirectionDto]),
    __metadata("design:returntype", void 0)
], DirectionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DirectionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DirectionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_direction_dto_1.UpdateDirectionDto]),
    __metadata("design:returntype", void 0)
], DirectionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DirectionController.prototype, "remove", null);
exports.DirectionController = DirectionController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('directions'),
    __metadata("design:paramtypes", [directions_service_1.DirectionService])
], DirectionController);
//# sourceMappingURL=directions.controller.js.map