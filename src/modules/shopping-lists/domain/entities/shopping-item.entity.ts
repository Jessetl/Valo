import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';

interface ShoppingItemProps {
  listId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPriceLocal: number | null;
  unitPriceUsd: number | null;
  isChecked: boolean;
}

export class ShoppingItem extends BaseEntity {
  readonly listId: string;
  readonly productName: string;
  readonly category: string;
  readonly quantity: number;
  readonly unitPriceLocal: number | null;
  readonly unitPriceUsd: number | null;
  readonly isChecked: boolean;

  private constructor(id: string, props: ShoppingItemProps) {
    super(id);
    this.listId = props.listId;
    this.productName = props.productName;
    this.category = props.category;
    this.quantity = props.quantity;
    this.unitPriceLocal = props.unitPriceLocal;
    this.unitPriceUsd = props.unitPriceUsd;
    this.isChecked = props.isChecked;
  }

  /**
   * @param unitPriceUsd Si es null y rateLocalPerUsd esta disponible, se calcula desde unitPriceLocal.
   * @param rateLocalPerUsd Tasa local/USD vigente para conversion automatica.
   * @param isChecked Estado de compra (default false para items nuevos).
   */
  static create(
    id: string,
    listId: string,
    productName: string,
    category: string,
    unitPriceLocal: number | null,
    quantity: number,
    unitPriceUsd: number | null = null,
    rateLocalPerUsd: number | null = null,
    isChecked: boolean = false,
  ): ShoppingItem {
    let resolvedUnitPriceUsd = unitPriceUsd;
    if (
      resolvedUnitPriceUsd === null &&
      unitPriceLocal !== null &&
      rateLocalPerUsd !== null &&
      rateLocalPerUsd > 0
    ) {
      resolvedUnitPriceUsd = unitPriceLocal / rateLocalPerUsd;
    }

    return new ShoppingItem(id, {
      listId,
      productName,
      category,
      quantity,
      unitPriceLocal,
      unitPriceUsd: resolvedUnitPriceUsd,
      isChecked,
    });
  }

  togglePurchased(): ShoppingItem {
    return new ShoppingItem(this.id, {
      listId: this.listId,
      productName: this.productName,
      category: this.category,
      quantity: this.quantity,
      unitPriceLocal: this.unitPriceLocal,
      unitPriceUsd: this.unitPriceUsd,
      isChecked: !this.isChecked,
    });
  }

  update(
    productName: string,
    category: string,
    unitPriceLocal: number | null,
    quantity: number,
    unitPriceUsd: number | null,
    rateLocalPerUsd: number | null,
    isChecked: boolean,
  ): ShoppingItem {
    return ShoppingItem.create(
      this.id,
      this.listId,
      productName,
      category,
      unitPriceLocal,
      quantity,
      unitPriceUsd,
      rateLocalPerUsd,
      isChecked,
    );
  }

  static reconstitute(id: string, props: ShoppingItemProps): ShoppingItem {
    return new ShoppingItem(id, props);
  }
}
