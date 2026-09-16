import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable2026091617000
  implements MigrationInterface
{
  name = 'CreateTransactionsTable2026091617000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts"
      ADD CONSTRAINT "UQ_accounts_org_id" UNIQUE ("organization_id", "id")
    `);
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "account_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "amount_in_cents" bigint NOT NULL,
        "type" varchar(10) NOT NULL,
        "description" varchar(200) NOT NULL DEFAULT '',
        "occurred_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_transactions_amount" CHECK ("amount_in_cents" > 0),
        CONSTRAINT "CHK_transactions_type"
          CHECK ("type" IN ('INCOME', 'EXPENSE')),
        CONSTRAINT "FK_transactions_account_org"
          FOREIGN KEY ("organization_id", "account_id")
          REFERENCES "accounts"("organization_id", "id")
          ON DELETE RESTRICT,
        CONSTRAINT "FK_transactions_category_org"
          FOREIGN KEY ("organization_id", "category_id")
          REFERENCES "categories"("organization_id", "id")
          ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_org_occurred"
      ON "transactions" ("organization_id", "occurred_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_account_id"
      ON "transactions" ("account_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transactions"');
    await queryRunner.query(
      'ALTER TABLE "accounts" DROP CONSTRAINT "UQ_accounts_org_id"',
    );
  }
}
