import { randomUUID } from 'node:crypto';
import { AccountRepository } from '../../../accounts/domain/repositories/account.repository.js';
import { CategoryRepository } from '../../../categories/domain/repositories/category.repository.js';
import { Transaction, TransactionType } from '../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { TransactionAccountNotFoundError } from '../errors/transaction-account-not-found.error.js';
import { TransactionBalanceOverflowError } from '../errors/transaction-balance-overflow.error.js';
import { TransactionCategoryNotFoundError } from '../errors/transaction-category-not-found.error.js';
import { TransactionCategoryTypeMismatchError } from '../errors/transaction-category-type-mismatch.error.js';

interface CreateTransactionInput {
  organizationId: string;
  accountId: string;
  categoryId: string;
  amountInCents: number;
  type: TransactionType;
  description?: string;
  occurredAt?: string;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly accounts: AccountRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const account = await this.accounts.findById(
      input.organizationId,
      input.accountId,
    );
    if (!account) {
      throw new TransactionAccountNotFoundError();
    }
    const category = await this.categories.findById(
      input.organizationId,
      input.categoryId,
    );
    if (!category) {
      throw new TransactionCategoryNotFoundError();
    }
    if (String(category.type) !== input.type) {
      throw new TransactionCategoryTypeMismatchError();
    }

    const now = new Date();
    const transaction = new Transaction({
      id: randomUUID(),
      organizationId: input.organizationId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      amountInCents: input.amountInCents,
      type: input.type,
      description: input.description ?? '',
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : now,
      createdAt: now,
    });
    if (
      !Number.isSafeInteger(
        account.balanceInCents + transaction.balanceDeltaInCents,
      )
    ) {
      throw new TransactionBalanceOverflowError();
    }
    await this.transactions.createAndApplyBalance(transaction);
    return transaction;
  }
}
