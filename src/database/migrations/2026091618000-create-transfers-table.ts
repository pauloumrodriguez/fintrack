import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransfersTable2026091618000 implements MigrationInterface {
  name = 'CreateTransfersTable2026091618000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "transfers" (
        "id" uuid NOT NULL PRIMARY KEY,
        "organization_id" uuid NOT NULL,
        "from_account_id" uuid NOT NULL,
        "to_account_id" uuid NOT NULL,
        "amount_in_cents" bigint NOT NULL,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "CHK_transfers_amount" CHECK ("amount_in_cents" > 0),
        CONSTRAINT "CHK_transfers_distinct_accounts" CHECK ("from_account_id" <> "to_account_id"),
        CONSTRAINT "FK_transfers_from_account_org" FOREIGN KEY ("organization_id", "from_account_id") REFERENCES "accounts"("organization_id", "id") ON DELETE RESTRICT,
        CONSTRAINT "FK_transfers_to_account_org" FOREIGN KEY ("organization_id", "to_account_id") REFERENCES "accounts"("organization_id", "id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_transfers_org_created" ON "transfers" ("organization_id", "created_at" DESC)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transfers"');
  }
}
