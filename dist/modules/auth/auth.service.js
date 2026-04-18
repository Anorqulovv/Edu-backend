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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Crypto_1 = require("../../infrastructure/helpers/Crypto");
const Token_1 = require("../../infrastructure/helpers/Token");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const user_entity_1 = require("../../databases/entities/user.entity");
let AuthService = class AuthService {
    userRepo;
    crypto;
    token;
    constructor(userRepo, crypto, token) {
        this.userRepo = userRepo;
        this.crypto = crypto;
        this.token = token;
    }
    async signIn(dto) {
        const { username, password } = dto;
        const user = await this.userRepo.findOne({
            where: { username },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isMatch = await this.crypto.comparePassword(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            id: user.id,
            role: user.role,
            username: user.username,
            isActive: user.isActive,
        };
        const token = await this.token.generateTokens(payload);
        const { password: _pw, ...safeUser } = user;
        return (0, succes_res_1.succesRes)({
            token,
            user: safeUser,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        Crypto_1.CryptoService,
        Token_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map