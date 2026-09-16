import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { CategoryAlreadyExistsError } from '../../application/errors/category-already-exists.error.js';
import { CategoryNotFoundError } from '../../application/errors/category-not-found.error.js';
import { CategoryOrganizationNotFoundError } from '../../application/errors/category-organization-not-found.error.js';

type CategoryError =
  | CategoryAlreadyExistsError
  | CategoryNotFoundError
  | CategoryOrganizationNotFoundError;

@Catch(
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
  CategoryOrganizationNotFoundError,
)
export class CategoryExceptionFilter implements ExceptionFilter {
  catch(exception: CategoryError, host: ArgumentsHost): void {
    const statusCode =
      exception instanceof CategoryAlreadyExistsError
        ? HttpStatus.CONFLICT
        : HttpStatus.NOT_FOUND;
    host.switchToHttp().getResponse<Response>().status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.CONFLICT ? 'Conflict' : 'Not Found',
      message: exception.message,
    });
  }
}
