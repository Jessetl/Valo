import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} con identificador "${id}" no encontrado`);
  }
}
