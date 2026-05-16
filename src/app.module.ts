import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { FirebaseAdminModule } from './shared-kernel/infrastructure/firebase/firebase-admin.module';
import { FirebaseAuthGuard } from './shared-kernel/infrastructure/guards/firebase-auth.guard';
import { AllExceptionsFilter } from './shared-kernel/infrastructure/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './shared-kernel/infrastructure/filters/http-exception.filter';
import { DomainExceptionFilter } from './shared-kernel/infrastructure/filters/domain-exception.filter';
import { LoggingInterceptor } from './shared-kernel/infrastructure/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './shared-kernel/infrastructure/interceptors/response-transform.interceptor';
import { getDatabaseConfig } from './shared-kernel/infrastructure/config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { DebtsModule } from './modules/debts/debts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Configuracion global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // PostgreSQL con TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Firebase Admin SDK (global)
    FirebaseAdminModule,

    // Modulos de dominio
    AuthModule,
    ShoppingListsModule,
    ExchangeRatesModule,
    DebtsModule,
    NotificationsModule,

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Cache en memoria
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
      max: 100,
    }),
  ],
  controllers: [AppController],
  providers: [
    // Guard global: verifica Firebase ID Token
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    // Guard global: rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Filters globales (orden: AllExceptions < HttpException < DomainException)
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // Interceptor global: logging de requests
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Interceptor global: envuelve respuestas en formato estandar
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
