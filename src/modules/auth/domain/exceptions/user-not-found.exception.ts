import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';

export class UserNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super('Usuario', identifier);
  }
}
