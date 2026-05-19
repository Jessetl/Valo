import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ShoppingListOrmEntity } from './shopping-list.orm-entity';

@Entity('shopping_items')
export class ShoppingItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'list_id', type: 'uuid' })
  listId!: string;

  @Column({ name: 'product_name', type: 'varchar' })
  productName!: string;

  @Column({ name: 'category', type: 'varchar' })
  category!: string;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @Column({
    name: 'unit_price_local',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  unitPriceLocal!: number | null;

  @Column({
    name: 'unit_price_usd',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  unitPriceUsd!: number | null;

  @Column({ name: 'is_checked', type: 'boolean', default: false })
  isChecked!: boolean;

  @ManyToOne(() => ShoppingListOrmEntity, (list) => list.items, {
    onDelete: 'CASCADE',
    nullable: false,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'list_id' })
  shoppingList!: ShoppingListOrmEntity;
}
