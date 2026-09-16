import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CreateOrganizationsTable2026091522000 } from './migrations/2026091522000-create-organizations-table.js';
import { CreateUsersTable2026091523000 } from './migrations/2026091523000-create-users-table.js';
import { CreateAccountsTable2026091615000 } from './migrations/2026091615000-create-accounts-table.js';
import { OrganizationOrmEntity } from '../modules/organizations/infrastructure/database/typeorm/organization.orm-entity.js';
import { UserOrmEntity } from '../modules/users/infrastructure/database/typeorm/user.orm-entity.js';
import { AccountOrmEntity } from '../modules/accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { CreateCategoriesTable2026091616000 } from './migrations/2026091616000-create-categories-table.js';
import { CategoryOrmEntity } from '../modules/categories/infrastructure/database/typeorm/category.orm-entity.js';
import { CreateTransactionsTable2026091617000 } from './migrations/2026091617000-create-transactions-table.js';
import { TransactionOrmEntity } from '../modules/transactions/infrastructure/database/typeorm/transaction.orm-entity.js';
import { TransferOrmEntity } from '../modules/transfers/transfer.orm-entity.js';
import { CreateTransfersTable2026091618000 } from './migrations/2026091618000-create-transfers-table.js';
import { EnableTenantRls2026091619000 } from './migrations/2026091619000-enable-tenant-rls.js';
import { AddTransactionIdempotency2026091620000 } from './migrations/2026091620000-add-transaction-idempotency.js';

if (!process.env.MIGRATION_DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // Em produção, a variável costuma ser fornecida pelo próprio ambiente.
  }
}

const databaseUrl = process.env.MIGRATION_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('MIGRATION_DATABASE_URL is required');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [
    OrganizationOrmEntity,
    UserOrmEntity,
    AccountOrmEntity,
    CategoryOrmEntity,
    TransactionOrmEntity,
    TransferOrmEntity,
  ],
  migrations: [
    CreateOrganizationsTable2026091522000,
    CreateUsersTable2026091523000,
    CreateAccountsTable2026091615000,
    CreateCategoriesTable2026091616000,
    CreateTransactionsTable2026091617000,
    CreateTransfersTable2026091618000,
    EnableTenantRls2026091619000,
    AddTransactionIdempotency2026091620000,
  ],
  synchronize: false,
});
