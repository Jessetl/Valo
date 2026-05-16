import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './shared-kernel/infrastructure/pipes/validation-exception.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';

  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Seguridad HTTP headers
  app.use(helmet());

  // Compresion de respuestas
  app.use(compression());

  // CORS
  app.enableCors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Validacion global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kashy API')
    .setDescription(
      'API de Kashy — Gestion inteligente de compras de supermercado con seguimiento de precios VES/USD y organizador de deudas/cobros personales.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'firebase-token',
    )
    .addTag(
      'Auth',
      'Registro, login, refresco de tokens y gestion de dispositivos de usuario',
    )
    .addTag(
      'Shopping Lists',
      'CRUD de listas de compras con items y conversion VES/USD',
    )
    .addTag(
      'Exchange Rates',
      'Tasa de cambio VES/USD oficial desde DolarAPI (endpoint publico)',
    )
    .addTag(
      'Debts',
      'CRUD de deudas y cobros personales en USD con prioridad, interes y vencimiento',
    )
    .addTag(
      'Notifications',
      'Notificaciones push de recordatorio de vencimiento de deudas via FCM + RabbitMQ',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/swagger', app, document);

  await app.listen(port, host);
  logger.log(`Application running on ${host}:${port}`);
  logger.log(`Swagger available at http://localhost:${port}/api/swagger`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Failed to start application: ${message}`);
  process.exit(1);
});
