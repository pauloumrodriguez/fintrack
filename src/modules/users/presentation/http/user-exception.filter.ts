import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserAlreadyExistsError } from '../../application/errors/user-already-exists.error.js';
import { UserOrganizationNotFoundError } from '../../application/errors/user-organization-not-found.error.js';

type UserApplicationError =
  | UserAlreadyExistsError
  | UserOrganizationNotFoundError;

@Catch(UserAlreadyExistsError, UserOrganizationNotFoundError)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof UserAlreadyExistsError
        ? HttpStatus.CONFLICT
        : HttpStatus.NOT_FOUND;

    response.status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.CONFLICT ? 'Conflict' : 'Not Found',
      message: exception.message,
    });
  }
}
