import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GenerateRecurringFinancialRecordsUseCase } from '../../application/use-cases/generate-recurring-financial-records.use-case';

@Injectable()
export class RecurrenceScheduler {
  private readonly logger = new Logger(RecurrenceScheduler.name);

  constructor(
    @Optional()
    private readonly generateRecurring?: GenerateRecurringFinancialRecordsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleRecurringGeneration(): Promise<void> {
    if (!this.generateRecurring) {
      return;
    }

    this.logger.debug('Running recurring financial records generation...');
    try {
      const created = await this.generateRecurring.execute();
      if (created > 0) {
        this.logger.log(`Generated ${created} recurring financial records`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Recurrence cron error: ${message}`);
    }
  }
}
