export class TransactionBalanceOverflowError extends Error {
  constructor() {
    super('Account balance would exceed the safe integer range');
  }
}
