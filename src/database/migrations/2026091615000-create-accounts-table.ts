import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountsTable2026091615000 implements MigrationInterface {
  name = 'CreateAccountsTable2026091615000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "balance_in_cents" bigint NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "PK_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_accounts_organization"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_accounts_organization_normalized_name"
      ON "accounts" ("organization_id", LOWER(TRIM("name")))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_organization_id"
      ON "accounts" ("organization_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "accounts"');
  }
}
