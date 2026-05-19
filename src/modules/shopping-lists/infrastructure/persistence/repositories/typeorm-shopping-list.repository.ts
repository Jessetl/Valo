import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import type {
  IShoppingListRepository,
  PaginatedResult,
  ShoppingListSearchFilters,
} from '../../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListOrmEntity } from '../orm-entities/shopping-list.orm-entity';
import { ShoppingListPersistenceMapper } from '../mappers/shopping-list-persistence.mapper';

type FindWhere = Record<string, unknown>;

@Injectable()
export class TypeOrmShoppingListRepository implements IShoppingListRepository {
  constructor(
    @InjectRepository(ShoppingListOrmEntity)
    private readonly ormRepository: Repository<ShoppingListOrmEntity>,
  ) {}

  async findById(id: string): Promise<ShoppingList | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    return orm ? ShoppingListPersistenceMapper.toDomain(orm) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ShoppingList | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, userId },
      relations: ['items'],
    });
    return orm ? ShoppingListPersistenceMapper.toDomain(orm) : null;
  }

  async findByIdsAndUserId(
    ids: string[],
    userId: string,
  ): Promise<ShoppingList[]> {
    if (ids.length === 0) return [];

    const orms = await this.ormRepository.find({
      where: { id: In(ids), userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return orms.map((orm) => ShoppingListPersistenceMapper.toDomain(orm));
  }

  async searchByUserId(
    userId: string,
    filters: ShoppingListSearchFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ShoppingList>> {
    const where: FindWhere = { userId };

    if (filters.listType !== undefined) where.listType = filters.listType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.storeName) {
      const escaped = filters.storeName
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
      where.storeName = ILike(`%${escaped}%`);
    }

    if (filters.scheduledDateFrom && filters.scheduledDateTo) {
      where.scheduledDate = Between(
        filters.scheduledDateFrom,
        filters.scheduledDateTo,
      );
    } else if (filters.scheduledDateFrom) {
      where.scheduledDate = MoreThanOrEqual(filters.scheduledDateFrom);
    } else if (filters.scheduledDateTo) {
      where.scheduledDate = LessThanOrEqual(filters.scheduledDateTo);
    }

    const [orms, total] = await this.ormRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: orms.map((orm) => ShoppingListPersistenceMapper.toDomain(orm)),
      total,
      page,
      limit,
    };
  }

  async save(shoppingList: ShoppingList): Promise<ShoppingList> {
    const orm = ShoppingListPersistenceMapper.toOrm(shoppingList);
    const saved = await this.ormRepository.save(orm);

    const reloaded = await this.ormRepository.findOne({
      where: { id: saved.id },
      relations: ['items'],
    });

    return ShoppingListPersistenceMapper.toDomain(reloaded!);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.ormRepository.delete({ id, userId });
  }
}
