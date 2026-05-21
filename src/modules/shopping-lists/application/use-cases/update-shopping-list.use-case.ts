import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { UpdateShoppingListDto } from '../dtos/update-shopping-list.dto';
import { ShoppingListResponseDto } from '../dtos/shopping-list-response.dto';
import { ShoppingListMapper } from '../mappers/shopping-list.mapper';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { ExchangeRateSnapshotValidator } from '../services/exchange-rate-snapshot.validator';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ValidationException } from '../../../../shared-kernel/domain/exceptions/validation.exception';

interface UpdateShoppingListInput {
  listId: string;
  userId: string;
  dto: UpdateShoppingListDto;
}

@Injectable()
export class UpdateShoppingListUseCase implements UseCase<
  UpdateShoppingListInput,
  ShoppingListResponseDto
> {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly shoppingListRepository: IShoppingListRepository,
    private readonly exchangeRateValidator: ExchangeRateSnapshotValidator,
  ) {}

  async execute(
    input: UpdateShoppingListInput,
  ): Promise<ShoppingListResponseDto> {
    const existing = await this.shoppingListRepository.findByIdAndUserId(
      input.listId,
      input.userId,
    );

    if (!existing) {
      throw new ShoppingListNotFoundException(input.listId);
    }

    if (input.dto.exchangeRateSnapshot !== undefined) {
      if (existing.listType === ShoppingListType.RECEIPT) {
        throw new ValidationException(
          'exchangeRateSnapshot es inmutable en listas tipo RECEIPT.',
          [
            {
              field: 'exchangeRateSnapshot',
              value: input.dto.exchangeRateSnapshot,
              error:
                'El snapshot de tasa solo puede actualizarse en listas TEMPLATE.',
            },
          ],
        );
      }
      await this.exchangeRateValidator.validate(input.dto.exchangeRateSnapshot);
    }

    const rate =
      input.dto.exchangeRateSnapshot ?? existing.exchangeRateSnapshot;
    const itemsChanged = input.dto.items !== undefined;

    let items: ShoppingItem[] = existing.items;

    if (itemsChanged) {
      const existingItemsMap = new Map(
        existing.items.map((item) => [item.id, item]),
      );

      items = (input.dto.items ?? []).map((itemDto) => {
        if (itemDto.id && existingItemsMap.has(itemDto.id)) {
          const existingItem = existingItemsMap.get(itemDto.id)!;
          return ShoppingItem.create(
            existingItem.id,
            existing.id,
            itemDto.productName,
            itemDto.category,
            itemDto.unitPriceLocal,
            itemDto.quantity ?? 1,
            itemDto.unitPriceUsd ?? null,
            rate,
            itemDto.isChecked ?? existingItem.isChecked,
          );
        }

        return ShoppingItem.create(
          randomUUID(),
          existing.id,
          itemDto.productName,
          itemDto.category,
          itemDto.unitPriceLocal,
          itemDto.quantity ?? 1,
          itemDto.unitPriceUsd ?? null,
          rate,
          itemDto.isChecked ?? false,
        );
      });
    }

    const updated = ShoppingList.reconstitute(existing.id, {
      userId: existing.userId,
      name: input.dto.name ?? existing.name,
      storeName:
        input.dto.storeName !== undefined
          ? input.dto.storeName
          : existing.storeName,
      listType: input.dto.listType ?? existing.listType,
      countryCode: existing.countryCode,
      currencyCode: input.dto.currencyCode ?? existing.currencyCode,
      exchangeRateSnapshot: rate,
      ivaEnabled: input.dto.ivaEnabled ?? existing.ivaEnabled,
      scheduledDate:
        input.dto.scheduledDate !== undefined
          ? input.dto.scheduledDate
            ? new Date(input.dto.scheduledDate)
            : null
          : existing.scheduledDate,
      latitude:
        input.dto.latitude !== undefined
          ? input.dto.latitude
          : existing.latitude,
      longitude:
        input.dto.longitude !== undefined
          ? input.dto.longitude
          : existing.longitude,
      isActive: input.dto.isActive ?? existing.isActive,
      items,
    });

    const saved = await this.shoppingListRepository.save(updated);
    return ShoppingListMapper.toResponse(saved);
  }
}
