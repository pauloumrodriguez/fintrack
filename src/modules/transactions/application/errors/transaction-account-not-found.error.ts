export class TransactionAccountNotFoundError extends Error {
  constructor() {
    super('Account was not found in this organization');
  }
}
