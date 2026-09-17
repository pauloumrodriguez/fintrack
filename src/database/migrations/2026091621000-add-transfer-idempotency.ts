import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransferIdempotency2026091621000 implements MigrationInterface {
  name = 'AddTransferIdempotency2026091621000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "transfers" ADD "idempotency_key" varchar(128)',
    );
    await queryRunner.query(
      'ALTER TABLE "transfers" ADD "request_hash" char(64)',
    );
    await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "CHK_transfers_idempotency_pair"
      CHECK (("idempotency_key" IS NULL AND "request_hash" IS NULL) OR
             ("idempotency_key" IS NOT NULL AND "request_hash" IS NOT NULL))`);
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_transfers_org_idempotency_key" ON "transfers" ("organization_id", "idempotency_key")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "UQ_transfers_org_idempotency_key"');
    await queryRunner.query(
      'ALTER TABLE "transfers" DROP CONSTRAINT "CHK_transfers_idempotency_pair"',
    );
    await queryRunner.query(
      'ALTER TABLE "transfers" DROP COLUMN "request_hash"',
    );
    await queryRunner.query(
      'ALTER TABLE "transfers" DROP COLUMN "idempotency_key"',
    );
  }
}
