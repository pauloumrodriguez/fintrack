import { randomUUID } from 'node:crypto';
import dataSource from '../src/database/data-source.js';
import { TenantDb } from '../src/database/tenant-db.js';
import { AccountOrmEntity } from '../src/modules/accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { CategoryType } from '../src/modules/categories/domain/entities/category.entity.js';
import { CategoryOrmEntity } from '../src/modules/categories/infrastructure/database/typeorm/category.orm-entity.js';
import { OrganizationOrmEntity } from '../src/modules/organizations/infrastructure/database/typeorm/organization.orm-entity.js';
import { Transaction, TransactionType } from '../src/modules/transactions/domain/entities/transaction.entity.js';
import { TransactionOrmEntity } from '../src/modules/transactions/infrastructure/database/typeorm/transaction.orm-entity.js';
import { TypeOrmTransactionRepository } from '../src/modules/transactions/infrastructure/database/typeorm/typeorm-transaction.repository.js';

describe('TransactionRepository com PostgreSQL', () => {
  const createdOrganizationIds: string[] = [];

  beforeAll(async () => {
    await dataSource.initialize();
  });

  afterEach(async () => {
    for (const organizationId of createdOrganizationIds) {
      await dataSource.getRepository(TransactionOrmEntity).delete({
        organizationId,
      });
      await dataSource.getRepository(CategoryOrmEntity).delete({
        organizationId,
      });
      await dataSource.getRepository(AccountOrmEntity).delete({ organizationId });
      await dataSource.getRepository(OrganizationOrmEntity).delete({
        id: organizationId,
      });
    }
    createdOrganizationIds.length = 0;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  async function setup() {
    const organizationId = randomUUID();
    const accountId = randomUUID();
    const categoryId = randomUUID();
    const now = new Date();
    createdOrganizationIds.push(organizationId);
    await dataSource.getRepository(OrganizationOrmEntity).insert({
      id: organizationId,
      name: `Integração ${organizationId}`,
      createdAt: now,
    });
    await dataSource.getRepository(AccountOrmEntity).insert({
      id: accountId,
      organizationId,
      name: 'Caixa',
      balanceInCents: 0,
      createdAt: now,
    });
    await dataSource.getRepository(CategoryOrmEntity).insert({
      id: categoryId,
      organizationId,
      name: 'Vendas',
      type: CategoryType.INCOME,
      createdAt: now,
    });
    const repository = new TypeOrmTransactionRepository(new TenantDb(dataSource));
    const createTransaction = (id: string) =>
      new Transaction({
        id,
        organizationId,
        accountId,
        categoryId,
        amountInCents: 100,
        type: TransactionType.INCOME,
        description: '',
        occurredAt: now,
        createdAt: now,
      });
    return {
      organizationId,
      accountId,
      categoryId,
      repository,
      createTransaction,
    };
  }

  it('desfaz a mudança de saldo se a gravação do lançamento falhar', async () => {
    const { organizationId, accountId, repository, createTransaction } =
      await setup();
    const transaction = createTransaction(randomUUID());
    await repository.createAndApplyBalance(transaction);

    await expect(
      repository.createAndApplyBalance(transaction),
    ).rejects.toThrow();

    const account = await dataSource.getRepository(AccountOrmEntity).findOneByOrFail({
      organizationId,
      id: accountId,
    });
    expect(account.balanceInCents).toBe(100);
    expect(
      await dataSource.getRepository(TransactionOrmEntity).countBy({
        organizationId,
      }),
    ).toBe(1);
  });

  it('não perde saldo com lançamentos simultâneos', async () => {
    const { organizationId, accountId, repository, createTransaction } =
      await setup();
    await Promise.all(
      Array.from({ length: 5 }, () =>
        repository.createAndApplyBalance(createTransaction(randomUUID())),
      ),
    );

    const account = await dataSource.getRepository(AccountOrmEntity).findOneByOrFail({
      organizationId,
      id: accountId,
    });
    expect(account.balanceInCents).toBe(500);
    expect(
      await dataSource.getRepository(TransactionOrmEntity).countBy({
        organizationId,
      }),
    ).toBe(5);
  });

  it('o banco rejeita categoria de outra organização e preserva o saldo', async () => {
    const first = await setup();
    const second = await setup();
    const now = new Date();
    const invalidTransaction = new Transaction({
      id: randomUUID(),
      organizationId: first.organizationId,
      accountId: first.accountId,
      categoryId: second.categoryId,
      amountInCents: 100,
      type: TransactionType.INCOME,
      description: '',
      occurredAt: now,
      createdAt: now,
    });

    await expect(
      first.repository.createAndApplyBalance(invalidTransaction),
    ).rejects.toThrow();

    const account = await dataSource.getRepository(AccountOrmEntity).findOneByOrFail({
      organizationId: first.organizationId,
      id: first.accountId,
    });
    expect(account.balanceInCents).toBe(0);
    expect(
      await dataSource.getRepository(TransactionOrmEntity).countBy({
        organizationId: first.organizationId,
      }),
    ).toBe(0);
  });
});
