import { Transaction } from '../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { TransactionNotFoundError } from '../errors/transaction-not-found.error.js';

export class GetTransactionUseCase {
  constructor(private readonly transactions: TransactionRepository) {}

  async execute(organizationId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactions.findById(organizationId, id);
    if (!transaction) {
      throw new TransactionNotFoundError();
    }
    return transaction;
  }
}
