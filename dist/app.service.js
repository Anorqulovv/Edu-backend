"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("./common/config");
class App {
    static async main() {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        const PORT = config_1.envConfig.PORT || 7001;
        app.setGlobalPrefix('api');
        app.enableCors({
            origin: true,
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        }));
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Edu-Automation API')
            .setDescription('O‘quv markazi avtomatizatsiyasi — foydalanuvchilar, guruhlar, davomat, testlar, Telegram bot va boshqalar')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        }, 'access-token')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
            customSiteTitle: 'Edu-Automation API Documentation',
        });
        await app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📄 Swagger: http://localhost:${PORT}/api/docs`);
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.service.js.map