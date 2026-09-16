import { AccountRepository } from '../../../accounts/domain/repositories/account.repository.js';
import { Transaction } from '../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { TransactionAccountNotFoundError } from '../../application/errors/transaction-account-not-found.error.js';
import { TransactionBalanceOverflowError } from '../../application/errors/transaction-balance-overflow.error.js';
import { TransactionIdempotencyConflictError } from '../../application/errors/transaction-idempotency-conflict.error.js';

export class InMemoryTransactionRepository implements TransactionRepository {
  readonly transactions: Transaction[] = [];

  constructor(private readonly accounts: AccountRepository) {}

  async createAndApplyBalance(transaction: Transaction): Promise<Transaction> {
    const existing = transaction.idempotencyKey && this.transactions.find(
      (item) => item.organizationId === transaction.organizationId &&
        item.idempotencyKey === transaction.idempotencyKey);
    if (existing) {
      if (existing.requestHash !== transaction.requestHash) throw new TransactionIdempotencyConflictError();
      return existing;
    }
    const account = await this.accounts.findById(
      transaction.organizationId,
      transaction.accountId,
    );
    if (!account) {
      throw new TransactionAccountNotFoundError();
    }
    const nextBalance =
      account.balanceInCents + transaction.balanceDeltaInCents;
    if (!Number.isSafeInteger(nextBalance)) {
      throw new TransactionBalanceOverflowError();
    }
    await this.accounts.save(
      account.withBalanceChange(transaction.balanceDeltaInCents),
    );
    this.transactions.push(transaction);
    return transaction;
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<Transaction | null> {
    return (
      this.transactions.find(
        (transaction) =>
          transaction.organizationId === organizationId &&
          transaction.id === id,
      ) ?? null
    );
  }

  async findAllByOrganizationId(
    organizationId: string,
  ): Promise<Transaction[]> {
    return this.transactions.filter(
      (transaction) => transaction.organizationId === organizationId,
    );
  }
}
