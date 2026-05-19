import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';
import { CancelFinancialNotificationsUseCase } from '../../../notifications/application/use-cases/cancel-financial-notifications.use-case';

interface DeleteFinancialRecordInput {
  userId: string;
  recordId: string;
}

@Injectable()
export class DeleteFinancialRecordUseCase implements UseCase<
  DeleteFinancialRecordInput,
  void
> {
  private readonly logger = new Logger(DeleteFinancialRecordUseCase.name);

  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Optional()
    private readonly cancelNotifications?: CancelFinancialNotificationsUseCase,
  ) {}

  async execute(input: DeleteFinancialRecordInput): Promise<void> {
    const existing = await this.recordRepository.findByIdAndUserId(
      input.recordId,
      input.userId,
    );

    if (!existing) {
      throw new FinancialRecordNotFoundException(input.recordId);
    }

    if (this.cancelNotifications) {
      try {
        await this.cancelNotifications.execute({ financialId: existing.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to cancel notifications: ${message}`);
      }
    }

    await this.recordRepository.delete(existing.id);
  }
}
