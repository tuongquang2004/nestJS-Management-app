import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToLike1776309348435 implements MigrationInterface {
  name = 'AddUniqueToLike1776309348435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_74b9b8cd79a1014e50135f266f\` ON \`likes\` (\`userId\`, \`postId\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_74b9b8cd79a1014e50135f266f\` ON \`likes\``,
    );
  }
}
