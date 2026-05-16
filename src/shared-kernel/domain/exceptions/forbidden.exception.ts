import { DomainException } from './domain.exception';

export class ForbiddenException extends DomainException {
  constructor(message: string = 'Acceso denegado') {
    super(message);
  }
}
