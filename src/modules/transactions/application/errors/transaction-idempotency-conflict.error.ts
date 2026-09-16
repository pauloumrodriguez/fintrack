export class TransactionIdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency key was already used for a different transaction');
    this.name = 'TransactionIdempotencyConflictError';
  }
}
