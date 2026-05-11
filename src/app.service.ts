import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { envConfig } from './common/config';

export class App {
  static async main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const PORT = envConfig.PORT || 7001;

    app.setGlobalPrefix('api');

    // JSON va URL-encoded body limitini oshirish (rasm base64 uchun)
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

    // CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global Validation
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );

    // ==================== SWAGGER ====================
    const config = new DocumentBuilder()
      .setTitle('Edu-Automation API')
      .setDescription(
        'O‘quv markazi avtomatizatsiyasi — foydalanuvchilar, guruhlar, davomat, testlar, Telegram bot va boshqalar',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT tokenni quyidagicha kiriting: Bearer <token>',
        },
        'access-token', 
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,     
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
      customSiteTitle: 'Edu-Automation API Documentation',
      customCss: '.swagger-ui .topbar { display: none }', 
    });

    await app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api/docs`);
    });
  }
}