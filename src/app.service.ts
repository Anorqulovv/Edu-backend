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

    // CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Validation
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
        },
        'access-token', 
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
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