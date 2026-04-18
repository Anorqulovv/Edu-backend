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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("../config");
let AuthGuard = class AuthGuard {
    jwt;
    constructor(jwt) {
        this.jwt = jwt;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization;
        if (!auth) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        const bearar = auth.split(' ')[0];
        const token = auth.split(' ')[1];
        if (bearar !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        try {
            const data = this.jwt.verify(token, {
                secret: config_1.envConfig.TOKEN.ACCESS_TOKEN_KEY,
            });
            if (!data || !data.isActive) {
                throw new common_1.UnauthorizedException('token expired or user is not active');
            }
            req.user = data;
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token expired');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map