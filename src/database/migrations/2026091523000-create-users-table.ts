import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable2026091523000 implements MigrationInterface {
  name = 'CreateUsersTable2026091523000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "email" varchar(254) NOT NULL,
        "password_hash" text NOT NULL,
        "role" varchar(30) NOT NULL,
        "created_at" timestamptz NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_users_role"
          CHECK ("role" IN ('ADMIN', 'FINANCE_MANAGER', 'VIEWER')),
        CONSTRAINT "FK_users_organization"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_normalized_email"
      ON "users" (LOWER(TRIM("email")))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_organization_id"
      ON "users" ("organization_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
