import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'No autenticado') {
    super(message);
  }
}
