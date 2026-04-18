"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_service_1 = require("./student.service");
const student_controller_1 = require("./student.controller");
const student_entity_1 = require("../../databases/entities/student.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const users_module_1 = require("../users/users.module");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([student_entity_1.Student, group_entity_1.Group]),
            users_module_1.UsersModule,
        ],
        controllers: [student_controller_1.StudentsController],
        providers: [student_service_1.StudentsService],
        exports: [student_service_1.StudentsService],
    })
], StudentsModule);
//# sourceMappingURL=student.module.js.map