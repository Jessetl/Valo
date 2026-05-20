import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { FinancialRecord } from '../../../domain/entities/financial-record.entity';
import { FinancialType } from '../../../domain/enums/financial-type.enum';
import type {
  IFinancialRecordRepository,
  MonthlyTotals,
  PaginatedFinancialRecords,
  SearchFinancialRecordsParams,
} from '../../../domain/interfaces/repositories/financial-record.repository.interface';
import { FinancialRecordOrmEntity } from '../orm-entities/financial-record.orm-entity';
import { FinancialRecordPersistenceMapper } from '../mappers/financial-record-persistence.mapper';

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

@Injectable()
export class TypeOrmFinancialRecordRepository implements IFinancialRecordRepository {
  constructor(
    @InjectRepository(FinancialRecordOrmEntity)
    private readonly ormRepository: Repository<FinancialRecordOrmEntity>,
  ) {}

  async findById(id: string): Promise<FinancialRecord | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? FinancialRecordPersistenceMapper.toDomain(orm) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<FinancialRecord | null> {
    const orm = await this.ormRepository.findOne({ where: { id, userId } });
    return orm ? FinancialRecordPersistenceMapper.toDomain(orm) : null;
  }

  async findByIds(ids: string[]): Promise<FinancialRecord[]> {
    if (ids.length === 0) return [];
    const orms = await this.ormRepository.find({ where: { id: In(ids) } });
    return orms.map((orm) => FinancialRecordPersistenceMapper.toDomain(orm));
  }

  async search(
    params: SearchFinancialRecordsParams,
  ): Promise<PaginatedFinancialRecords> {
    const { userId, page, limit, filters } = params;
    const qb = this.ormRepository
      .createQueryBuilder('r')
      .where('r.user_id = :userId', { userId });

    if (filters?.type) {
      qb.andWhere('r.type = :type', { type: filters.type });
    }
    if (filters?.priority) {
      qb.andWhere('r.priority = :priority', { priority: filters.priority });
    }
    if (filters?.isRecurring !== null && filters?.isRecurring !== undefined) {
      qb.andWhere('r.is_recurring = :isRecurring', {
        isRecurring: filters.isRecurring,
      });
    }
    if (filters?.dateFrom) {
      qb.andWhere('r.date >= :dateFrom', {
        dateFrom: toDateOnly(filters.dateFrom),
      });
    }
    if (filters?.dateTo) {
      qb.andWhere('r.date <= :dateTo', {
        dateTo: toDateOnly(filters.dateTo),
      });
    }

    qb.orderBy('r.date', 'DESC').addOrderBy('r.id', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [orms, total] = await qb.getManyAndCount();

    return {
      data: orms.map((orm) => FinancialRecordPersistenceMapper.toDomain(orm)),
      total,
    };
  }

  async save(record: FinancialRecord): Promise<FinancialRecord> {
    const orm = FinancialRecordPersistenceMapper.toOrm(record);
    const saved = await this.ormRepository.save(orm);
    return FinancialRecordPersistenceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async monthlyTotals(
    userId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<MonthlyTotals> {
    interface TotalsRow {
      income_local: string;
      income_usd: string;
      expense_local: string;
      expense_usd: string;
    }

    const row = await this.ormRepository
      .createQueryBuilder('r')
      .select([
        `COALESCE(SUM(CASE WHEN r.type = 'INCOME' THEN r.amount_local END), 0) AS income_local`,
        `COALESCE(SUM(CASE WHEN r.type = 'INCOME' THEN r.amount_usd END), 0) AS income_usd`,
        `COALESCE(SUM(CASE WHEN r.type = 'EXPENSE' THEN r.amount_local END), 0) AS expense_local`,
        `COALESCE(SUM(CASE WHEN r.type = 'EXPENSE' THEN r.amount_usd END), 0) AS expense_usd`,
      ])
      .where('r.user_id = :userId', { userId })
      .andWhere('r.date >= :start', { start: toDateOnly(monthStart) })
      .andWhere('r.date < :end', { end: toDateOnly(monthEnd) })
      .getRawOne<TotalsRow>();

    return {
      totalIncomeLocal: Number(row?.income_local ?? 0),
      totalIncomeUsd: Number(row?.income_usd ?? 0),
      totalExpenseLocal: Number(row?.expense_local ?? 0),
      totalExpenseUsd: Number(row?.expense_usd ?? 0),
    };
  }

  async upcomingExpenses(
    userId: string,
    fromDate: Date,
    toDate: Date,
    limit: number,
  ): Promise<FinancialRecord[]> {
    const orms = await this.ormRepository
      .createQueryBuilder('r')
      .where('r.user_id = :userId', { userId })
      .andWhere('r.type = :type', { type: FinancialType.EXPENSE })
      .andWhere(
        new Brackets((qb) => {
          qb.where('r.date >= :from', { from: toDateOnly(fromDate) }).andWhere(
            'r.date < :to',
            { to: toDateOnly(toDate) },
          );
        }),
      )
      .orderBy('r.date', 'ASC')
      .addOrderBy('r.id', 'ASC')
      .limit(limit)
      .getMany();

    return orms.map((orm) => FinancialRecordPersistenceMapper.toDomain(orm));
  }

  async findActiveRecurring(): Promise<FinancialRecord[]> {
    const orms = await this.ormRepository.find({
      where: { isRecurring: true },
    });
    return orms.map((orm) => FinancialRecordPersistenceMapper.toDomain(orm));
  }

  async existsForMonth(params: {
    userId: string;
    title: string;
    type: FinancialType;
    monthStart: Date;
    monthEnd: Date;
  }): Promise<boolean> {
    const count = await this.ormRepository
      .createQueryBuilder('r')
      .where('r.user_id = :userId', { userId: params.userId })
      .andWhere('r.title = :title', { title: params.title })
      .andWhere('r.type = :type', { type: params.type })
      .andWhere('r.date >= :start', { start: toDateOnly(params.monthStart) })
      .andWhere('r.date < :end', { end: toDateOnly(params.monthEnd) })
      .getCount();
    return count > 0;
  }
}
