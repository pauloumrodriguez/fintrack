export class TransactionCategoryNotFoundError extends Error {
  constructor() {
    super('Category was not found in this organization');
  }
}
