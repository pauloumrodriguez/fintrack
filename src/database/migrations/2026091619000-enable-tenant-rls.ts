import type { MigrationInterface, QueryRunner } from 'typeorm';

const tables = [
  ['organizations', 'id'],
  ['users', 'organization_id'],
  ['accounts', 'organization_id'],
  ['categories', 'organization_id'],
  ['transactions', 'organization_id'],
  ['transfers', 'organization_id'],
] as const;

export class EnableTenantRls2026091619000 implements MigrationInterface {
  name = 'EnableTenantRls2026091619000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fintrack_app') THEN
        CREATE ROLE fintrack_app NOLOGIN NOBYPASSRLS;
      END IF;
    END $$`);
    await queryRunner.query('GRANT USAGE ON SCHEMA public TO fintrack_app');
    for (const [table, column] of tables) {
      await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO fintrack_app`);
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);
      await queryRunner.query(`CREATE POLICY "tenant_isolation_${table}" ON "${table}"
        FOR ALL TO fintrack_app
        USING ("${column}" = NULLIF(current_setting('fintrack.organization_id', true), '')::uuid)
        WITH CHECK ("${column}" = NULLIF(current_setting('fintrack.organization_id', true), '')::uuid)`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table] of [...tables].reverse()) {
      await queryRunner.query(`DROP POLICY "tenant_isolation_${table}" ON "${table}"`);
      await queryRunner.query(`ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
      await queryRunner.query(`REVOKE SELECT, INSERT, UPDATE, DELETE ON "${table}" FROM fintrack_app`);
    }
    await queryRunner.query('REVOKE USAGE ON SCHEMA public FROM fintrack_app');
  }
}
