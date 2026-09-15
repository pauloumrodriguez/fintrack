import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CreateOrganizationsTable2026091522000 } from './migrations/2026091522000-create-organizations-table.js';
import { CreateUsersTable2026091523000 } from './migrations/2026091523000-create-users-table.js';
import { OrganizationOrmEntity } from '../modules/organizations/infrastructure/database/typeorm/organization.orm-entity.js';
import { UserOrmEntity } from '../modules/users/infrastructure/database/typeorm/user.orm-entity.js';

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // Em produção, a variável costuma ser fornecida pelo próprio ambiente.
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [OrganizationOrmEntity, UserOrmEntity],
  migrations: [
    CreateOrganizationsTable2026091522000,
    CreateUsersTable2026091523000,
  ],
  synchronize: false,
});
