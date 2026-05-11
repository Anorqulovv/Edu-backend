"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const admins_controller_1 = require("./admins.controller");
const teachers_controller_1 = require("./teachers.controller");
const supports_controller_1 = require("./supports.controller");
const teachers_service_1 = require("./teachers.service");
const dashboard_service_1 = require("./dashboard.service");
const user_entity_1 = require("../../databases/entities/user.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const test_entity_1 = require("../../databases/entities/test.entity");
const Crypto_1 = require("../../infrastructure/helpers/Crypto");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, student_entity_1.Student, group_entity_1.Group, test_entity_1.Test])],
        providers: [users_service_1.UsersService, teachers_service_1.TeachersService, dashboard_service_1.DashboardService, Crypto_1.CryptoService],
        controllers: [
            users_controller_1.UsersController,
            admins_controller_1.AdminsController,
            teachers_controller_1.TeachersController,
            supports_controller_1.SupportsController,
        ],
        exports: [users_service_1.UsersService, teachers_service_1.TeachersService, dashboard_service_1.DashboardService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map