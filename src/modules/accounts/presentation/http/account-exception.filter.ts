import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AccountAlreadyExistsError } from '../../application/errors/account-already-exists.error.js';
import { AccountNotFoundError } from '../../application/errors/account-not-found.error.js';
import { AccountOrganizationNotFoundError } from '../../application/errors/account-organization-not-found.error.js';

type AccountApplicationError =
  | AccountAlreadyExistsError
  | AccountNotFoundError
  | AccountOrganizationNotFoundError;

@Catch(
  AccountAlreadyExistsError,
  AccountNotFoundError,
  AccountOrganizationNotFoundError,
)
export class AccountExceptionFilter implements ExceptionFilter {
  catch(exception: AccountApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof AccountAlreadyExistsError
        ? HttpStatus.CONFLICT
        : HttpStatus.NOT_FOUND;

    response.status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.CONFLICT ? 'Conflict' : 'Not Found',
      message: exception.message,
    });
  }
}
