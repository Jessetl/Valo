import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ConflictException } from '../../domain/exceptions/conflict.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';
import { UnauthorizedException } from '../../domain/exceptions/unauthorized.exception';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { ExternalServiceException } from '../../domain/exceptions/external-service.exception';
import { buildErrorResponse } from './error-response';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DomainException');

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.resolveStatus(exception);

    this.logger.warn(`${exception.constructor.name}: ${exception.message}`);

    const fields =
      exception instanceof ValidationException ? exception.fields : undefined;

    response
      .status(status)
      .json(buildErrorResponse(status, exception.message, fields));
  }

  private resolveStatus(exception: DomainException): number {
    if (exception instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ConflictException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof ValidationException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (exception instanceof UnauthorizedException) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof ForbiddenException) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof ExternalServiceException) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
