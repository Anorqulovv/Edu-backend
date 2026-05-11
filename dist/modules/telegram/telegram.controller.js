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
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_guard_1 = require("../../common/guards/auth.guard");
const role_enum_1 = require("../../common/enums/role.enum");
const roles_guard_1 = require("../../common/guards/roles.guard");
const class_validator_1 = require("class-validator");
class SendNotifyAllDto {
    message;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendNotifyAllDto.prototype, "message", void 0);
let TelegramController = class TelegramController {
    telegramService;
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async sendNotify(dto) {
        await this.telegramService.sendNotification(dto.telegramId, dto.message);
        return { success: true };
    }
    async sendNotifyAll(dto) {
        await this.telegramService.broadcastFromAdmin(dto.message);
        return { success: true };
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('notify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendNotify", null);
__decorate([
    (0, common_1.Post)('notify-all'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendNotifyAllDto]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendNotifyAll", null);
exports.TelegramController = TelegramController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.AccessRoles)(role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN),
    (0, common_1.Controller)('telegram'),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map