import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { buildErrorResponse, getDefaultMessage } from './error-response';

const IS_DEV = process.env.NODE_ENV !== 'production';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('UnhandledException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const fallback = getDefaultMessage(status);
    const detail =
      exception instanceof Error ? exception.message : String(exception);
    const errorId = randomUUID();

    if (IS_DEV) {
      this.logger.error(
        `[${errorId}] ${detail || fallback}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.error(`[${errorId}] ${detail || fallback}`);
    }

    response.status(status).json(buildErrorResponse(status, fallback));
  }
}
