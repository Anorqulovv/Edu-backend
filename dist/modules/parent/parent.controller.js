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
exports.ParentsController = void 0;
const common_1 = require("@nestjs/common");
const parent_service_1 = require("./parent.service");
const create_parent_dto_1 = require("./dto/create-parent.dto");
const update_parent_dto_1 = require("./dto/update-parent.dto");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let ParentsController = class ParentsController {
    parentsService;
    constructor(parentsService) {
        this.parentsService = parentsService;
    }
    create(userDto) {
        return this.parentsService.createWithUser(userDto);
    }
    linkUser(dto) {
        return this.parentsService.create(dto);
    }
    findAll() {
        return this.parentsService.findAll();
    }
    getMyChildren(req) {
        return this.parentsService.getMyChildren(req.user.id);
    }
    findOne(id) {
        return this.parentsService.findOne(id);
    }
    update(id, dto) {
        return this.parentsService.update(id, dto);
    }
    remove(id) {
        return this.parentsService.remove(id);
    }
};
exports.ParentsController = ParentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('link-user'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parent_dto_1.CreateParentDto]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "linkUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.SUPPORT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-children'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.PARENT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "getMyChildren", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.SUPPORT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_parent_dto_1.UpdateParentDto]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ParentsController.prototype, "remove", null);
exports.ParentsController = ParentsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('parents'),
    __metadata("design:paramtypes", [parent_service_1.ParentsService])
], ParentsController);
//# sourceMappingURL=parent.controller.js.map