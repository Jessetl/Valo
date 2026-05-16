import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { buildErrorResponse, getDefaultMessage } from './error-response';

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

    this.logger.error(
      detail || fallback,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(buildErrorResponse(status, fallback));
  }
}
