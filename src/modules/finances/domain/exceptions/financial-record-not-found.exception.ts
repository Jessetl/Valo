import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';

export class FinancialRecordNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('FinancialRecord', id);
  }
}
