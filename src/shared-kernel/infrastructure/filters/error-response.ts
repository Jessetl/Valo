import { HttpStatus } from '@nestjs/common';
import type { ValidationFieldError } from '../../domain/exceptions/validation.exception';

export interface ErrorResponseBody {
  error: string;
  message: string;
  fields?: ValidationFieldError[];
}

const HTTP_STATUS_LABEL: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

const DEFAULT_MESSAGE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'La solicitud no es valida.',
  [HttpStatus.UNAUTHORIZED]:
    'Credenciales invalidas. Verifique su usuario y contrasena.',
  [HttpStatus.FORBIDDEN]: 'No tienes permiso para acceder a este recurso.',
  [HttpStatus.NOT_FOUND]: 'El recurso solicitado no existe.',
  [HttpStatus.CONFLICT]: 'Conflicto con el estado actual del recurso.',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Los datos enviados no son validos.',
  [HttpStatus.TOO_MANY_REQUESTS]:
    'Demasiadas solicitudes. Intenta de nuevo mas tarde.',
  [HttpStatus.INTERNAL_SERVER_ERROR]:
    'Ha ocurrido un error inesperado. Intente mas tarde.',
  [HttpStatus.SERVICE_UNAVAILABLE]:
    'El servicio no esta disponible en este momento.',
};

export function getStatusLabel(status: number): string {
  return HTTP_STATUS_LABEL[status] ?? 'Error';
}

export function getDefaultMessage(status: number): string {
  return DEFAULT_MESSAGE[status] ?? 'Ha ocurrido un error inesperado.';
}

export function buildErrorResponse(
  status: number,
  message: string,
  fields?: ValidationFieldError[],
): ErrorResponseBody {
  const body: ErrorResponseBody = {
    error: getStatusLabel(status),
    message,
  };
  if (fields && fields.length > 0) {
    body.fields = fields;
  }
  return body;
}
