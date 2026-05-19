import { ShoppingList } from '../../entities/shopping-list.entity';
import { ShoppingListType } from '../../enums/shopping-list-type.enum';

export const SHOPPING_LIST_REPOSITORY = Symbol('SHOPPING_LIST_REPOSITORY');

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ShoppingListSearchFilters {
  listType?: ShoppingListType;
  storeName?: string;
  isActive?: boolean;
  scheduledDateFrom?: Date;
  scheduledDateTo?: Date;
}

export interface IShoppingListRepository {
  findById(id: string): Promise<ShoppingList | null>;
  findByIdAndUserId(id: string, userId: string): Promise<ShoppingList | null>;
  findByIdsAndUserId(ids: string[], userId: string): Promise<ShoppingList[]>;
  searchByUserId(
    userId: string,
    filters: ShoppingListSearchFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ShoppingList>>;
  save(shoppingList: ShoppingList): Promise<ShoppingList>;
  delete(id: string, userId: string): Promise<void>;
}
