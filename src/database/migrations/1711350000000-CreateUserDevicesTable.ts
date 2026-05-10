import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUserDevicesTable1711350000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_devices',
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
            name: 'device_id',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'device_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'firebase_fcm_token',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'firebase_refresh_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'app_version',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_active_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_devices',
      new TableForeignKey({
        name: 'FK_user_devices_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_devices');
  }
}
