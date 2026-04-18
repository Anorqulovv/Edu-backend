"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.envConfig = {
    PORT: Number(process.env.PORT),
    DB_URL: String(process.env.DB_URL),
    JWT_SECRET: String(process.env.JWT_SECRET),
    BOT_TOKEN: String(process.env.BOT_TOKEN),
    REDIS_HOST: String(process.env.REDIS_HOST),
    REDIS_PORT: Number(process.env.REDIS_PORT),
    TOKEN: {
        ACCESS_TOKEN_KEY: String(process.env.ACCESS_TOKEN_KEY),
        ACCESS_TOKEN_TIME: Number(process.env.ACCESS_TOKEN_TIME),
        REFRESH_TOKEN_KEY: String(process.env.REFRESH_TOKEN_KEY),
        REFRESH_TOKEN_TIME: Number(process.env.REFRESH_TOKEN_TIME)
    },
    SUPERADMIN: {
        USERNAME: String(process.env.SUPERADMIN_USERNAME),
        PASSWORD: String(process.env.SUPERADMIN_PASSWORD),
        SUPERADMIN_EMAIL: String(process.env.SUPERADMIN_EMAIL),
        PHONE: String(process.env.SUPERADMIN_PHONE),
    }
};
//# sourceMappingURL=index.js.map