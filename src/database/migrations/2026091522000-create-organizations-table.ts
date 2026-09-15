import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationsTable2026091522000
  implements MigrationInterface
{
  name = 'CreateOrganizationsTable2026091522000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_organizations_normalized_name"
      ON "organizations" (LOWER(TRIM("name")))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "organizations"');
  }
}
