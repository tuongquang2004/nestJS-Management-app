import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDB1775637292947 implements MigrationInterface {
  name = 'UpdateDB1775637292947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL`,
    );
  }
}
