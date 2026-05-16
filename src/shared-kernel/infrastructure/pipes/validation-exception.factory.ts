import { ValidationError } from 'class-validator';
import {
  ValidationException,
  ValidationFieldError,
} from '../../domain/exceptions/validation.exception';

export function validationExceptionFactory(
  errors: ValidationError[],
): ValidationException {
  const fields: ValidationFieldError[] = [];
  flatten(errors, '', fields);
  return new ValidationException('Los datos enviados no son validos.', fields);
}

function flatten(
  errors: ValidationError[],
  prefix: string,
  out: ValidationFieldError[],
): void {
  for (const err of errors) {
    const path = prefix ? `${prefix}.${err.property}` : err.property;

    if (err.constraints) {
      const messages = Object.values(err.constraints);
      for (const message of messages) {
        out.push({
          field: path,
          value: normalizeValue(err.value),
          error: message,
        });
      }
    }

    if (err.children && err.children.length > 0) {
      flatten(err.children, path, out);
    }
  }
}

function normalizeValue(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }
  return value;
}
