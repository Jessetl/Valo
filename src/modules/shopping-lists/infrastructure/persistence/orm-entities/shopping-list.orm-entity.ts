import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ShoppingItemOrmEntity } from './shopping-item.orm-entity';
import { ShoppingListType } from '../../../domain/enums/shopping-list-type.enum';

@Entity('shopping_lists')
export class ShoppingListOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'store_name', type: 'varchar', nullable: true })
  storeName!: string | null;

  @Column({
    name: 'list_type',
    type: 'enum',
    enum: ShoppingListType,
    enumName: 'shopping_lists_list_type_enum',
  })
  listType!: ShoppingListType;

  @Column({ name: 'country_code', type: 'varchar' })
  countryCode!: string;

  @Column({ name: 'currency_code', type: 'varchar' })
  currencyCode!: string;

  @Column({
    name: 'exchange_rate_snapshot',
    type: 'decimal',
    precision: 18,
    scale: 4,
  })
  exchangeRateSnapshot!: number;

  @Column({ name: 'iva_enabled', type: 'boolean', default: false })
  ivaEnabled!: boolean;

  @Column({ name: 'scheduled_date', type: 'timestamptz', nullable: true })
  scheduledDate!: Date | null;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude!: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ShoppingItemOrmEntity, (item) => item.shoppingList, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  items!: ShoppingItemOrmEntity[];
}
