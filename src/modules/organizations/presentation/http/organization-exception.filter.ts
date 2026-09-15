import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrganizationAlreadyExistsError } from '../../application/errors/organization-already-exists.error.js';
import { OrganizationNotFoundError } from '../../application/errors/organization-not-found.error.js';

type OrganizationApplicationError =
  OrganizationAlreadyExistsError | OrganizationNotFoundError;

@Catch(OrganizationAlreadyExistsError, OrganizationNotFoundError)
export class OrganizationExceptionFilter implements ExceptionFilter {
  catch(exception: OrganizationApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof OrganizationAlreadyExistsError
        ? HttpStatus.CONFLICT
        : HttpStatus.NOT_FOUND;

    response.status(statusCode).json({
      statusCode,
      error: statusCode === HttpStatus.CONFLICT ? 'Conflict' : 'Not Found',
      message: exception.message,
    });
  }
}
