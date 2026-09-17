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
import { TransactionHttpMapper } from './transaction-http.mapper.js';

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
  async create(
    @Body() body: CreateTransactionDto,
    @Req() request: AuthRequest,
    @Headers('idempotency-key') key?: string,
  ) {
    if (!key || !/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
      throw new BadRequestException(
        'Idempotency-Key must be 8-128 safe characters',
      );
    }
    const transaction = await this.createTransaction.execute({
      organizationId: request.user!.organizationId,
      accountId: body.accountId,
      categoryId: body.categoryId,
      amountInCents: body.amountInCents,
      type: body.type,
      description: body.description,
      occurredAt: body.occurredAt,
      idempotencyKey: key,
    });
    return TransactionHttpMapper.toResponse(transaction);
  }

  @Get('organizations/:organizationId/transactions')
  async list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    const transactions = await this.listTransactions.execute(organizationId);
    return transactions.map((transaction) =>
      TransactionHttpMapper.toResponse(transaction),
    );
  }

  @Get('organizations/:organizationId/transactions/:transactionId')
  async get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Param('transactionId', new ParseUUIDPipe({ version: '4' }))
    transactionId: string,
  ) {
    const transaction = await this.getTransaction.execute(
      organizationId,
      transactionId,
    );
    return TransactionHttpMapper.toResponse(transaction);
  }
}
