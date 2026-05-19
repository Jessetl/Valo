import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../../domain/entities/shopping-item.entity';
import { ShoppingListOrmEntity } from '../orm-entities/shopping-list.orm-entity';
import { ShoppingItemOrmEntity } from '../orm-entities/shopping-item.orm-entity';

export class ShoppingListPersistenceMapper {
  static toDomain(orm: ShoppingListOrmEntity): ShoppingList {
    const items = (orm.items ?? []).map((itemOrm) =>
      ShoppingItem.reconstitute(itemOrm.id, {
        listId: itemOrm.listId,
        productName: itemOrm.productName,
        category: itemOrm.category,
        quantity: itemOrm.quantity,
        unitPriceLocal:
          itemOrm.unitPriceLocal !== null
            ? Number(itemOrm.unitPriceLocal)
            : null,
        unitPriceUsd:
          itemOrm.unitPriceUsd !== null ? Number(itemOrm.unitPriceUsd) : null,
        isChecked: itemOrm.isChecked,
      }),
    );

    return ShoppingList.reconstitute(orm.id, {
      userId: orm.userId,
      name: orm.name,
      storeName: orm.storeName,
      listType: orm.listType,
      countryCode: orm.countryCode,
      currencyCode: orm.currencyCode,
      exchangeRateSnapshot: Number(orm.exchangeRateSnapshot),
      ivaEnabled: orm.ivaEnabled,
      scheduledDate: orm.scheduledDate,
      latitude: orm.latitude !== null ? Number(orm.latitude) : null,
      longitude: orm.longitude !== null ? Number(orm.longitude) : null,
      isActive: orm.isActive,
      items,
    });
  }

  static toOrm(list: ShoppingList): ShoppingListOrmEntity {
    const orm = new ShoppingListOrmEntity();
    orm.id = list.id;
    orm.userId = list.userId;
    orm.name = list.name;
    orm.storeName = list.storeName;
    orm.listType = list.listType;
    orm.countryCode = list.countryCode;
    orm.currencyCode = list.currencyCode;
    orm.exchangeRateSnapshot = list.exchangeRateSnapshot;
    orm.ivaEnabled = list.ivaEnabled;
    orm.scheduledDate = list.scheduledDate;
    orm.latitude = list.latitude;
    orm.longitude = list.longitude;
    orm.isActive = list.isActive;
    orm.items = list.items.map((item) => this.toItemOrm(item));
    return orm;
  }

  static toItemOrm(item: ShoppingItem): ShoppingItemOrmEntity {
    const orm = new ShoppingItemOrmEntity();
    orm.id = item.id;
    orm.listId = item.listId;
    orm.productName = item.productName;
    orm.category = item.category;
    orm.quantity = item.quantity;
    orm.unitPriceLocal = item.unitPriceLocal;
    orm.unitPriceUsd = item.unitPriceUsd;
    orm.isChecked = item.isChecked;
    return orm;
  }
}
