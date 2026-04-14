import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNicknameToUsersTable1776140399373 implements MigrationInterface {
  name = 'AddNicknameToUsersTable1776140399373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
  }
}
