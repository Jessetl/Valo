import { DomainException } from './domain.exception';

export interface ValidationFieldError {
  field: string;
  value: unknown;
  error: string;
}

export class ValidationException extends DomainException {
  readonly fields: ValidationFieldError[];

  constructor(
    message: string = 'Los datos enviados no son validos.',
    fields: ValidationFieldError[] = [],
  ) {
    super(message);
    this.fields = fields;
  }
}
