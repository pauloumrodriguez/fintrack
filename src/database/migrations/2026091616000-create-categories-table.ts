import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable2026091616000 implements MigrationInterface {
  name = 'CreateCategoriesTable2026091616000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(10) NOT NULL,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_org_id" UNIQUE ("organization_id", "id"),
        CONSTRAINT "CHK_categories_type"
          CHECK ("type" IN ('INCOME', 'EXPENSE')),
        CONSTRAINT "FK_categories_organization"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_categories_org_type_name"
      ON "categories" ("organization_id", "type", LOWER(TRIM("name")))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_categories_organization_id"
      ON "categories" ("organization_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "categories"');
  }
}
