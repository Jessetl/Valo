import { DomainException } from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Correo electronico o contraseña invalidos');
  }
}
