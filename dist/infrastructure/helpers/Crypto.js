"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const bcrypt_1 = require("bcrypt");
class CryptoService {
    async hashPassword(password) {
        return (0, bcrypt_1.hash)(password, 7);
    }
    async comparePassword(password, hashed) {
        return (0, bcrypt_1.compare)(password, hashed);
    }
}
exports.CryptoService = CryptoService;
//# sourceMappingURL=Crypto.js.map