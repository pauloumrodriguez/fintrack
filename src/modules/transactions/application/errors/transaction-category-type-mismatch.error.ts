export class TransactionCategoryTypeMismatchError extends Error {
  constructor() {
    super('Category type must match transaction type');
  }
}
