"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const groups_module_1 = require("./modules/groups/groups.module");
const telegram_module_1 = require("./modules/telegram/telegram.module");
const tests_module_1 = require("./modules/tests/tests.module");
const users_module_1 = require("./modules/users/users.module");
const student_module_1 = require("./modules/student/student.module");
const parent_module_1 = require("./modules/parent/parent.module");
const directions_module_1 = require("./modules/directions/directions.module");
const config_2 = require("./common/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: config_2.envConfig.DB_URL,
                synchronize: true,
                autoLoadEntities: true,
            }),
            auth_module_1.AuthModule,
            attendance_module_1.AttendanceModule,
            groups_module_1.GroupsModule,
            telegram_module_1.TelegramModule,
            tests_module_1.TestsModule,
            users_module_1.UsersModule,
            student_module_1.StudentsModule,
            parent_module_1.ParentsModule,
            directions_module_1.DirectionModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map