import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingListResponseDto } from '../dtos/shopping-list-response.dto';
import { ShoppingItemResponseDto } from '../dtos/shopping-item-response.dto';
import { computeListTotals } from '../utils/totals.util';

export class ShoppingListMapper {
  static toResponse(list: ShoppingList): ShoppingListResponseDto {
    const totals = computeListTotals(list.items, list.ivaEnabled);

    const dto = new ShoppingListResponseDto();
    dto.id = list.id;
    dto.userId = list.userId;
    dto.name = list.name;
    dto.storeName = list.storeName;
    dto.listType = list.listType;
    dto.countryCode = list.countryCode;
    dto.currencyCode = list.currencyCode;
    dto.exchangeRateSnapshot = list.exchangeRateSnapshot;
    dto.ivaEnabled = list.ivaEnabled;
    dto.scheduledDate = list.scheduledDate;
    dto.latitude = list.latitude;
    dto.longitude = list.longitude;
    dto.isActive = list.isActive;
    dto.subtotalLocal = totals.subtotalLocal;
    dto.subtotalUsd = totals.subtotalUsd;
    dto.ivaLocal = totals.ivaLocal;
    dto.ivaUsd = totals.ivaUsd;
    dto.totalLocal = totals.totalLocal;
    dto.totalUsd = totals.totalUsd;
    dto.items = list.items.map((item) => this.toItemResponse(item));
    return dto;
  }

  static toItemResponse(item: ShoppingItem): ShoppingItemResponseDto {
    const dto = new ShoppingItemResponseDto();
    dto.id = item.id;
    dto.listId = item.listId;
    dto.productName = item.productName;
    dto.category = item.category;
    dto.quantity = item.quantity;
    dto.unitPriceLocal = item.unitPriceLocal;
    dto.unitPriceUsd = item.unitPriceUsd;
    dto.isChecked = item.isChecked;
    return dto;
  }
}
