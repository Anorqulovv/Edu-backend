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
    const isProduction = process.env.NODE_ENV === 'production';

    app.setGlobalPrefix('api');

    // JSON va URL-encoded body limitini oshirish (rasm base64 uchun)
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

    // CORS — production'da faqat ruxsat etilgan domenlar
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [];

    app.enableCors({
      origin: isProduction
        ? (origin, callback) => {
            // Origin yo'q bo'lsa (server-to-server) ruxsat
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error(`CORS: ${origin} ruxsat etilmagan`), false);
          }
        : true, // Development'da hamma domen
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
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

    // Swagger faqat development'da
    if (!isProduction) {
      const config = new DocumentBuilder()
        .setTitle('Edu-Automation API')
        .setDescription(
          "O'quv markazi avtomatizatsiyasi — foydalanuvchilar, guruhlar, davomat, testlar, Telegram bot va boshqalar",
        )
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: "JWT tokenni quyidagicha kiriting: Bearer <token>",
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
    }

    await app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      if (!isProduction) {
        console.log(`📄 Swagger Docs: http://localhost:${PORT}/api/docs`);
      }
    });
  }
}
