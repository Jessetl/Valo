import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';

interface DeleteShoppingListInput {
  listId: string;
  userId: string;
}

@Injectable()
export class DeleteShoppingListUseCase implements UseCase<
  DeleteShoppingListInput,
  void
> {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly shoppingListRepository: IShoppingListRepository,
  ) {}

  async execute(input: DeleteShoppingListInput): Promise<void> {
    const existing = await this.shoppingListRepository.findByIdAndUserId(
      input.listId,
      input.userId,
    );

    if (!existing) {
      throw new ShoppingListNotFoundException(input.listId);
    }

    await this.shoppingListRepository.delete(input.listId, input.userId);
  }
}
