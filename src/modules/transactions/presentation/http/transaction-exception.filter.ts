import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { TransactionAccountNotFoundError } from '../../application/errors/transaction-account-not-found.error.js';
import { TransactionBalanceOverflowError } from '../../application/errors/transaction-balance-overflow.error.js';
import { TransactionCategoryNotFoundError } from '../../application/errors/transaction-category-not-found.error.js';
import { TransactionCategoryTypeMismatchError } from '../../application/errors/transaction-category-type-mismatch.error.js';
import { TransactionNotFoundError } from '../../application/errors/transaction-not-found.error.js';
import { TransactionIdempotencyConflictError } from '../../application/errors/transaction-idempotency-conflict.error.js';

type TransactionError =
  | TransactionAccountNotFoundError
  | TransactionCategoryNotFoundError
  | TransactionCategoryTypeMismatchError
  | TransactionBalanceOverflowError
  | TransactionNotFoundError
  | TransactionIdempotencyConflictError;

@Catch(
  TransactionAccountNotFoundError,
  TransactionCategoryNotFoundError,
  TransactionCategoryTypeMismatchError,
  TransactionBalanceOverflowError,
  TransactionNotFoundError,
  TransactionIdempotencyConflictError,
)
export class TransactionExceptionFilter implements ExceptionFilter {
  catch(exception: TransactionError, host: ArgumentsHost): void {
    const statusCode = exception instanceof TransactionIdempotencyConflictError
      ? HttpStatus.CONFLICT
      : exception instanceof TransactionCategoryTypeMismatchError ||
          exception instanceof TransactionBalanceOverflowError
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.NOT_FOUND;
    host.switchToHttp().getResponse<Response>().status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.CONFLICT ? 'Conflict' :
        statusCode === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Not Found',
      message: exception.message,
    });
  }
}
