import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string = 'Conflicto con el estado actual del recurso.') {
    super(message);
  }
}
