import { Account } from '../../../accounts/domain/entities/account.entity.js';
import { InMemoryAccountRepository } from '../../../accounts/infrastructure/repositories/in-memory-account.repository.js';
import { Category, CategoryType } from '../../../categories/domain/entities/category.entity.js';
import { InMemoryCategoryRepository } from '../../../categories/infrastructure/repositories/in-memory-category.repository.js';
import { InMemoryTransactionRepository } from '../../infrastructure/repositories/in-memory-transaction.repository.js';
import { TransactionType } from '../../domain/entities/transaction.entity.js';
import { TransactionAccountNotFoundError } from '../errors/transaction-account-not-found.error.js';
import { TransactionCategoryTypeMismatchError } from '../errors/transaction-category-type-mismatch.error.js';
import { CreateTransactionUseCase } from './create-transaction.use-case.js';

describe('CreateTransactionUseCase', () => {
  async function setup() {
    const accounts = new InMemoryAccountRepository();
    const categories = new InMemoryCategoryRepository();
    const transactions = new InMemoryTransactionRepository(accounts);
    await accounts.save(
      new Account({
        id: 'account-1',
        organizationId: 'org-1',
        name: 'Caixa',
        createdAt: new Date(),
      }),
    );
    await categories.save(
      new Category({
        id: 'category-income',
        organizationId: 'org-1',
        name: 'Vendas',
        type: CategoryType.INCOME,
        createdAt: new Date(),
      }),
    );
    await categories.save(
      new Category({
        id: 'category-expense',
        organizationId: 'org-1',
        name: 'Aluguel',
        type: CategoryType.EXPENSE,
        createdAt: new Date(),
      }),
    );
    return {
      accounts,
      categories,
      transactions,
      useCase: new CreateTransactionUseCase(
        transactions,
        accounts,
        categories,
      ),
    };
  }

  it('soma receitas e subtrai despesas em centavos', async () => {
    const { accounts, useCase } = await setup();
    await useCase.execute({
      organizationId: 'org-1',
      accountId: 'account-1',
      categoryId: 'category-income',
      amountInCents: 2000,
      type: TransactionType.INCOME,
    });
    await useCase.execute({
      organizationId: 'org-1',
      accountId: 'account-1',
      categoryId: 'category-expense',
      amountInCents: 750,
      type: TransactionType.EXPENSE,
    });
    expect((await accounts.findById('org-1', 'account-1'))?.balanceInCents).toBe(
      1250,
    );
  });

  it('não aceita categoria de tipo diferente', async () => {
    const { useCase, transactions } = await setup();
    await expect(
      useCase.execute({
        organizationId: 'org-1',
        accountId: 'account-1',
        categoryId: 'category-income',
        amountInCents: 100,
        type: TransactionType.EXPENSE,
      }),
    ).rejects.toBeInstanceOf(TransactionCategoryTypeMismatchError);
    expect(transactions.transactions).toHaveLength(0);
  });

  it('não aceita conta de outra organização', async () => {
    const { useCase } = await setup();
    await expect(
      useCase.execute({
        organizationId: 'org-2',
        accountId: 'account-1',
        categoryId: 'category-income',
        amountInCents: 100,
        type: TransactionType.INCOME,
      }),
    ).rejects.toBeInstanceOf(TransactionAccountNotFoundError);
  });
});
