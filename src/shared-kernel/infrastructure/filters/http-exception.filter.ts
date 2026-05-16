import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { buildErrorResponse, getDefaultMessage } from './error-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = this.extractMessage(exception, status);

    this.logger.warn(`${exception.constructor.name}: ${message}`);

    response.status(status).json(buildErrorResponse(status, message));
  }

  private extractMessage(exception: HttpException, status: number): string {
    const raw = exception.getResponse();

    if (typeof raw === 'string') return raw;

    if (raw && typeof raw === 'object') {
      const rawMessage = (raw as Record<string, unknown>).message;
      if (typeof rawMessage === 'string' && rawMessage.length > 0) {
        return rawMessage;
      }
      if (Array.isArray(rawMessage) && rawMessage.length > 0) {
        return rawMessage
          .filter((m): m is string => typeof m === 'string')
          .join(', ');
      }
    }

    return exception.message || getDefaultMessage(status);
  }
}
