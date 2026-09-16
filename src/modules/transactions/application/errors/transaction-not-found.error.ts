export class TransactionNotFoundError extends Error {
  constructor() {
    super('Transaction was not found in this organization');
  }
}
