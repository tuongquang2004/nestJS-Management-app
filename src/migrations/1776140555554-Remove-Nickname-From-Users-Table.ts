import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNicknameFromUsersTable1776140555554 implements MigrationInterface {
  name = 'RemoveNicknameFromUsersTable1776140555554';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL`,
    );
  }
}
