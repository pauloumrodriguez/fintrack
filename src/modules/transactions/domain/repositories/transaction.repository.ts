import { Transaction } from '../entities/transaction.entity.js';

export abstract class TransactionRepository {
  abstract createAndApplyBalance(transaction: Transaction): Promise<void>;
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<Transaction | null>;
  abstract findAllByOrganizationId(
    organizationId: string,
  ): Promise<Transaction[]>;
}
