import { ConflictException } from '../../../../shared-kernel/domain/exceptions/conflict.exception';

export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`Ya existe un usuario con el correo "${email}"`);
  }
}
