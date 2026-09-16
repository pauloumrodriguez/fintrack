import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionIdempotency2026091620000 implements MigrationInterface {
  name = 'AddTransactionIdempotency2026091620000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "transactions" ADD "idempotency_key" varchar(128)');
    await queryRunner.query('ALTER TABLE "transactions" ADD "request_hash" char(64)');
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "CHK_transactions_idempotency_pair"
      CHECK (("idempotency_key" IS NULL AND "request_hash" IS NULL) OR
             ("idempotency_key" IS NOT NULL AND "request_hash" IS NOT NULL))`);
    await queryRunner.query('CREATE UNIQUE INDEX "UQ_transactions_org_idempotency_key" ON "transactions" ("organization_id", "idempotency_key")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "UQ_transactions_org_idempotency_key"');
    await queryRunner.query('ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_idempotency_pair"');
    await queryRunner.query('ALTER TABLE "transactions" DROP COLUMN "request_hash"');
    await queryRunner.query('ALTER TABLE "transactions" DROP COLUMN "idempotency_key"');
  }
}
