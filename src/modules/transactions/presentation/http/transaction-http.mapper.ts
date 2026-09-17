import { Transaction } from '../../domain/entities/transaction.entity.js';

export class TransactionHttpMapper {
  static toResponse(transaction: Transaction) {
    return {
      id: transaction.id,
      organizationId: transaction.organizationId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amountInCents: transaction.amountInCents,
      type: transaction.type,
      description: transaction.description,
      occurredAt: transaction.occurredAt,
      createdAt: transaction.createdAt,
    };
  }
}
