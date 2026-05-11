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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const create_attendance_dto_1 = require("./dto/create-attendance.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    handleTurnstile(cardId) {
        return this.attendanceService.handleTurnstile(cardId);
    }
    create(dto, req) {
        return this.attendanceService.createByTeacher(dto, req.user);
    }
    markGroupAttendance(groupId, body, req) {
        return this.attendanceService.markGroupAttendance(groupId, body.attendances, req.user);
    }
    findAll() {
        return this.attendanceService.findAll();
    }
    getMyAttendance(req) {
        return this.attendanceService.findByStudentUserId(req.user.id);
    }
    getGroupAttendance(groupId, req) {
        return this.attendanceService.getGroupAttendance(groupId, req.user);
    }
    findOne(id) {
        return this.attendanceService.findOne(id);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('turnstile'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Karta orqali davomat (turnstile)' }),
    __param(0, (0, common_1.Body)('cardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "handleTurnstile", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: "Qo'lda davomat qo'shish — ustoz o'z guruhidagi o'quvchilar uchun" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_dto_1.CreateAttendanceDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('group/:groupId'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: "Guruh bo'yicha toplu yo'qlama — ustoz o'z guruhini belgilaydi" }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "markGroupAttendance", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER, role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Barcha davomatlar' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: "O'z davomati — o'quvchi uchun" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: "Guruh davomati ko'rish" }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getGroupAttendance", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: "ID bo'yicha davomat" }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findOne", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map