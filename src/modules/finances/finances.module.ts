import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialRecordOrmEntity } from './infrastructure/persistence/orm-entities/financial-record.orm-entity';
import { TypeOrmFinancialRecordRepository } from './infrastructure/persistence/repositories/typeorm-financial-record.repository';
import { FINANCIAL_RECORD_REPOSITORY } from './domain/interfaces/repositories/financial-record.repository.interface';
import { FinancesController } from './infrastructure/controllers/finances.controller';
import { CreateFinancialRecordUseCase } from './application/use-cases/create-financial-record.use-case';
import { UpdateFinancialRecordUseCase } from './application/use-cases/update-financial-record.use-case';
import { DeleteFinancialRecordUseCase } from './application/use-cases/delete-financial-record.use-case';
import { GetFinancialRecordByIdUseCase } from './application/use-cases/get-financial-record-by-id.use-case';
import { SearchFinancialRecordsUseCase } from './application/use-cases/search-financial-records.use-case';
import { GetFinancialSummaryUseCase } from './application/use-cases/get-financial-summary.use-case';
import { GenerateRecurringFinancialRecordsUseCase } from './application/use-cases/generate-recurring-financial-records.use-case';
import { RecurrenceScheduler } from './infrastructure/scheduling/recurrence.scheduler';
import { FinancialRecordReaderAdapter } from './infrastructure/ports/financial-record-reader.adapter';
import { FINANCIAL_RECORD_READER } from '../../shared-kernel/application/ports/financial-record-reader.port';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialRecordOrmEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [FinancesController],
  providers: [
    {
      provide: FINANCIAL_RECORD_REPOSITORY,
      useClass: TypeOrmFinancialRecordRepository,
    },
    {
      provide: FINANCIAL_RECORD_READER,
      useClass: FinancialRecordReaderAdapter,
    },
    CreateFinancialRecordUseCase,
    UpdateFinancialRecordUseCase,
    DeleteFinancialRecordUseCase,
    GetFinancialRecordByIdUseCase,
    SearchFinancialRecordsUseCase,
    GetFinancialSummaryUseCase,
    GenerateRecurringFinancialRecordsUseCase,
    RecurrenceScheduler,
  ],
  exports: [FINANCIAL_RECORD_REPOSITORY, FINANCIAL_RECORD_READER],
})
export class FinancesModule {}
