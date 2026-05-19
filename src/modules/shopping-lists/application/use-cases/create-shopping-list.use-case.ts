import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { CreateShoppingListDto } from '../dtos/create-shopping-list.dto';
import { ShoppingListResponseDto } from '../dtos/shopping-list-response.dto';
import { ShoppingListMapper } from '../mappers/shopping-list.mapper';

interface CreateShoppingListInput {
  userId: string;
  dto: CreateShoppingListDto;
}

@Injectable()
export class CreateShoppingListUseCase implements UseCase<
  CreateShoppingListInput,
  ShoppingListResponseDto
> {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly shoppingListRepository: IShoppingListRepository,
  ) {}

  async execute(
    input: CreateShoppingListInput,
  ): Promise<ShoppingListResponseDto> {
    const listId = randomUUID();
    const rate = input.dto.exchangeRateSnapshot;

    const items = (input.dto.items ?? []).map((itemDto) =>
      ShoppingItem.create(
        randomUUID(),
        listId,
        itemDto.productName,
        itemDto.category,
        itemDto.unitPriceLocal,
        itemDto.quantity ?? 1,
        itemDto.unitPriceUsd ?? null,
        rate,
        itemDto.isChecked ?? false,
      ),
    );

    const list = ShoppingList.create({
      id: listId,
      userId: input.userId,
      name: input.dto.name,
      storeName: input.dto.storeName ?? null,
      listType: input.dto.listType,
      countryCode: input.dto.countryCode,
      currencyCode: input.dto.currencyCode,
      exchangeRateSnapshot: rate,
      ivaEnabled: input.dto.ivaEnabled,
      scheduledDate: input.dto.scheduledDate
        ? new Date(input.dto.scheduledDate)
        : null,
      latitude: input.dto.latitude ?? null,
      longitude: input.dto.longitude ?? null,
      items,
    });

    const saved = await this.shoppingListRepository.save(list);
    return ShoppingListMapper.toResponse(saved);
  }
}
