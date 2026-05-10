import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateNotificationsTable1711800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'financial_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'scheduled_at',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'sent_at',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'notifications_status_enum',
            enum: ['PENDING', 'SENT', 'FAILED'],
            default: `'PENDING'`,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notifications_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notifications_financial_record',
        columnNames: ['financial_id'],
        referencedTableName: 'financial_records',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query('DROP TYPE IF EXISTS "notifications_status_enum"');
  }
}
