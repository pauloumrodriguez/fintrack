import { Transaction } from '../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class ListTransactionsUseCase {
  constructor(private readonly transactions: TransactionRepository) {}

  execute(organizationId: string): Promise<Transaction[]> {
    return this.transactions.findAllByOrganizationId(organizationId);
  }
}
