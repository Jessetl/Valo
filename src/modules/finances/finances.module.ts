import { Module, forwardRef } from '@nestjs/common';
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
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialRecordOrmEntity]),
    ScheduleModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [FinancesController],
  providers: [
    {
      provide: FINANCIAL_RECORD_REPOSITORY,
      useClass: TypeOrmFinancialRecordRepository,
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
  exports: [FINANCIAL_RECORD_REPOSITORY],
})
export class FinancesModule {}
