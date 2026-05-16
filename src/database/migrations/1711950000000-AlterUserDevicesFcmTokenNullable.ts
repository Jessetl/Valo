import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserDevicesFcmTokenNullable1711950000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_devices" ALTER COLUMN "firebase_fcm_token" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_devices" ALTER COLUMN "firebase_fcm_token" SET NOT NULL`,
    );
  }
}
