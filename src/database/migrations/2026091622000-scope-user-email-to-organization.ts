import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeUserEmailToOrganization2026091622000 implements MigrationInterface {
  name = 'ScopeUserEmailToOrganization2026091622000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "UQ_users_normalized_email"');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_users_org_normalized_email" ON "users" ("organization_id", LOWER(TRIM("email")))',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "UQ_users_org_normalized_email"');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_users_normalized_email" ON "users" (LOWER(TRIM("email")))',
    );
  }
}
