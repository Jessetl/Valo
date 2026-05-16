import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import type { AuthUser } from '../guards/jwt-auth.guard';

type RequestWithUser = Request & {
  user?: AuthUser;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url } = request;
    const userId = request.user?.userId || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${Date.now() - now}ms [user: ${userId}]`,
        );
      }),
    );
  }
}
