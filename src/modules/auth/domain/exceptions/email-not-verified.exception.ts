import { ForbiddenException } from '../../../../shared-kernel/domain/exceptions/forbidden.exception';

export class EmailNotVerifiedException extends ForbiddenException {
  constructor() {
    super(
      'Debes verificar tu correo electronico antes de iniciar sesion. Revisa tu bandeja de entrada.',
    );
  }
}
