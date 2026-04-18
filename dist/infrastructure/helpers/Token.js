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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("../../common/config");
let TokenService = class TokenService {
    jwt;
    constructor(jwt) {
        this.jwt = jwt;
    }
    async generateAccessToken(payload) {
        return this.jwt.signAsync(payload, {
            secret: config_1.envConfig.TOKEN.ACCESS_TOKEN_KEY,
            expiresIn: config_1.envConfig.TOKEN.ACCESS_TOKEN_TIME,
        });
    }
    async generateRefreshToken(payload) {
        return this.jwt.signAsync(payload, {
            secret: config_1.envConfig.TOKEN.REFRESH_TOKEN_KEY,
            expiresIn: config_1.envConfig.TOKEN.REFRESH_TOKEN_TIME,
        });
    }
    async generateTokens(payload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
        ]);
        return { accessToken, refreshToken };
    }
    async checkAccessToken(token) {
        return this.jwt.verifyAsync(token, {
            secret: config_1.envConfig.TOKEN.ACCESS_TOKEN_KEY,
        });
    }
    async checkRefreshToken(token) {
        return this.jwt.verifyAsync(token, {
            secret: config_1.envConfig.TOKEN.REFRESH_TOKEN_KEY,
        });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TokenService);
//# sourceMappingURL=Token.js.map