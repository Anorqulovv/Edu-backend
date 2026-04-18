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
exports.AdminsController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const dashboard_service_1 = require("./dashboard.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const role_enum_1 = require("../../common/enums/role.enum");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let AdminsController = class AdminsController {
    usersService;
    dashboardService;
    constructor(usersService, dashboardService) {
        this.usersService = usersService;
        this.dashboardService = dashboardService;
    }
    create(dto) {
        return this.usersService.createUser(dto, role_enum_1.UserRole.ADMIN);
    }
    findAll() {
        return this.usersService.findAllByRole(role_enum_1.UserRole.ADMIN);
    }
    getStats() {
        return this.dashboardService.getStats();
    }
    findOne(id) {
        return this.usersService.findOneByRole(id, role_enum_1.UserRole.ADMIN);
    }
    update(id, dto) {
        return this.usersService.updateUser(id, dto);
    }
    remove(id) {
        return this.usersService.removeUser(id);
    }
};
exports.AdminsController = AdminsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminsController.prototype, "remove", null);
exports.AdminsController = AdminsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admins'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        dashboard_service_1.DashboardService])
], AdminsController);
//# sourceMappingURL=admins.controller.js.map