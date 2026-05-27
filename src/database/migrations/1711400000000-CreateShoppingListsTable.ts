import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateShoppingListsTable1711400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shopping_lists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'store_name', type: 'varchar', isNullable: true },
          {
            name: 'list_type',
            type: 'enum',
            enumName: 'shopping_lists_list_type_enum',
            enum: ['TEMPLATE', 'RECEIPT', 'COMPLETED'],
            isNullable: false,
          },
          { name: 'country_code', type: 'varchar', isNullable: false },
          { name: 'currency_code', type: 'varchar', isNullable: false },
          {
            name: 'exchange_rate_snapshot',
            type: 'decimal',
            precision: 18,
            scale: 4,
            isNullable: false,
          },
          { name: 'iva_enabled', type: 'boolean', default: false },
          { name: 'scheduled_date', type: 'timestamptz', isNullable: true },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'shopping_lists',
      new TableForeignKey({
        name: 'FK_shopping_lists_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shopping_lists');
    await queryRunner.query(
      'DROP TYPE IF EXISTS "shopping_lists_list_type_enum"',
    );
  }
}
