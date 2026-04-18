"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const parent_service_1 = require("./parent.service");
const parent_controller_1 = require("./parent.controller");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const users_module_1 = require("../users/users.module");
let ParentsModule = class ParentsModule {
};
exports.ParentsModule = ParentsModule;
exports.ParentsModule = ParentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([parent_entity_1.Parent, student_entity_1.Student]),
            users_module_1.UsersModule,
        ],
        providers: [parent_service_1.ParentsService],
        controllers: [parent_controller_1.ParentsController],
        exports: [parent_service_1.ParentsService],
    })
], ParentsModule);
//# sourceMappingURL=parent.module.js.map