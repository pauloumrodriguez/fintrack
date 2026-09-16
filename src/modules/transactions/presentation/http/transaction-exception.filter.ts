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

type TransactionError =
  | TransactionAccountNotFoundError
  | TransactionCategoryNotFoundError
  | TransactionCategoryTypeMismatchError
  | TransactionBalanceOverflowError
  | TransactionNotFoundError;

@Catch(
  TransactionAccountNotFoundError,
  TransactionCategoryNotFoundError,
  TransactionCategoryTypeMismatchError,
  TransactionBalanceOverflowError,
  TransactionNotFoundError,
)
export class TransactionExceptionFilter implements ExceptionFilter {
  catch(exception: TransactionError, host: ArgumentsHost): void {
    const statusCode =
      exception instanceof TransactionCategoryTypeMismatchError ||
      exception instanceof TransactionBalanceOverflowError
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.NOT_FOUND;
    host.switchToHttp().getResponse<Response>().status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Not Found',
      message: exception.message,
    });
  }
}
