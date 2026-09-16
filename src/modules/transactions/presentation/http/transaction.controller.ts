import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case.js';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case.js';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions.use-case.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionExceptionFilter } from './transaction-exception.filter.js';
import { Roles } from '../../../auth/auth.decorators.js';
import { UserRole } from '../../../users/domain/entities/user.entity.js';
import type { AuthRequest } from '../../../auth/auth-user.js';

@Controller()
@UseFilters(TransactionExceptionFilter)
export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly listTransactions: ListTransactionsUseCase,
  ) {}

  @Post('transactions')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  create(@Body() body: CreateTransactionDto, @Req() request: AuthRequest,
    @Headers('idempotency-key') key?: string) {
    if (!key || !/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
      throw new BadRequestException('Idempotency-Key must be 8-128 safe characters');
    }
    return this.createTransaction.execute({ ...body,
      organizationId: request.user!.organizationId, idempotencyKey: key });
  }

  @Get('organizations/:organizationId/transactions')
  list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    return this.listTransactions.execute(organizationId);
  }

  @Get('organizations/:organizationId/transactions/:transactionId')
  get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Param('transactionId', new ParseUUIDPipe({ version: '4' }))
    transactionId: string,
  ) {
    return this.getTransaction.execute(organizationId, transactionId);
  }
}
