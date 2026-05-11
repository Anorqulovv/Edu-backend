"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../databases/entities/user.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const attendance_entity_1 = require("../../databases/entities/attendance.entity");
const test_result_entity_1 = require("../../databases/entities/test-result.entity");
const test_entity_1 = require("../../databases/entities/test.entity");
const telegram_controller_1 = require("./telegram.controller");
const telegram_service_1 = require("./telegram.service");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, student_entity_1.Student, parent_entity_1.Parent, group_entity_1.Group, attendance_entity_1.Attendance, test_result_entity_1.TestResult, test_entity_1.Test]),
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [telegram_service_1.TelegramService],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map