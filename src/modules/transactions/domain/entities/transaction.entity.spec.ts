import { Transaction, TransactionType } from './transaction.entity.js';

const props = {
  id: 'transaction-1',
  organizationId: 'org-1',
  accountId: 'account-1',
  categoryId: 'category-1',
  amountInCents: 1200,
  type: TransactionType.INCOME,
  description: ' Venda ',
  occurredAt: new Date(),
  createdAt: new Date(),
};

describe('Transaction', () => {
  it('a receita aumenta e a despesa diminui o saldo', () => {
    expect(new Transaction(props).balanceDeltaInCents).toBe(1200);
    expect(
      new Transaction({ ...props, type: TransactionType.EXPENSE })
        .balanceDeltaInCents,
    ).toBe(-1200);
  });

  it('rejeita zero e frações de centavo', () => {
    expect(
      () => new Transaction({ ...props, amountInCents: 0 }),
    ).toThrow();
    expect(
      () => new Transaction({ ...props, amountInCents: 1.5 }),
    ).toThrow();
  });
});
