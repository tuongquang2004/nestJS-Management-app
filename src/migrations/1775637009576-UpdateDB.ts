import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDB1775637009576 implements MigrationInterface {
  name = 'UpdateDB1775637009576';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
  }
}
